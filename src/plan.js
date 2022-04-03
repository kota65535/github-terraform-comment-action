const core = require('@actions/core')
const { findLinesBetween, removeLinesBetween } = require('./util')

const getRefreshSection = (lines, subsections) => {
  const matched = []
  for (const line of lines) {
    if (line.match(/Refreshing state\.\.\./)) {
      matched.push(line)
    }
  }
  return matched
}

const getOutsideChangeSection = (lines, subsections) => {
  return findLinesBetween(
    lines,
    /^Note: Objects have changed outside of Terraform$/,
    /^─+/)
}

const getResourceActionSection = (lines, subsections) => {
  let matched = findLinesBetween(
    lines,
    /^Terraform used the selected providers to generate the following execution$/,
    /^Plan:/)

  if (subsections.length === 0) {
    return matched
  }

  const patterns = {
    create: {
      pattern: /^ {2}# .* will be created$/,
      condition: subsections.includes('create')
    },
    update: {
      pattern: /^ {2}# .* will be updated in-place$/,
      condition: subsections.includes('update')
    },
    replace: {
      pattern: /^ {2}# .* (must be replaced|will be replaced, as requested)$/,
      condition: subsections.includes('create') || subsections.includes('destroy')
    },
    destroy: {
      pattern: /^ {2}# .* will be destroyed$/,
      condition: subsections.includes('destroy')
    },
    read: {
      pattern: /^ {2}# .* will be read during apply$/,
      condition: subsections.includes('read')
    }
  }

  for (const value of Object.values(patterns)) {
    if (!value.condition) {
      matched = removeLinesBetween(matched, value.pattern, /^ {4}}/, 1)
    }
  }
  return matched
}

const getOutputChangeSection = (lines, subsections) => {
  return findLinesBetween(
    lines,
    /^Changes to Outputs:$/,
    /^─+/)
}

const MAJOR_SECTIONS = [
  'refresh',
  'outside',
  'action',
  'output'
]

const SECTION_FUNCS = {
  refresh: getRefreshSection,
  outside: getOutsideChangeSection,
  action: getResourceActionSection,
  output: getOutputChangeSection
}

const plan = (input, sectionSpecs) => {
  const planInput = input.replace(/\x1b\[[0-9;]*m/g, '') // eslint-disable-line no-control-regex
  const lines = planInput.split('\n')

  const selectedSections = {}
  for (const spec of sectionSpecs) {
    const matched = spec.match(/^(\w+)(\.(\w+))?/)
    if (matched) {
      const majorSection = matched[1]
      const minorSection = matched[3]
      if (!(majorSection in selectedSections)) {
        selectedSections[majorSection] = { minor: [] }
      }
      if (minorSection) {
        selectedSections[majorSection].minor.push(minorSection)
      }
    }
  }

  const ret = []
  for (const s of MAJOR_SECTIONS) {
    if (s in selectedSections) {
      const sectionLines = SECTION_FUNCS[s](lines, selectedSections[s].minor)
      ret.concat(sectionLines)
      core.info(s)
      for (const line of sectionLines) {
        core.info(line)
      }
    }
  }

  return ret.join('\n')
}

module.exports = plan
