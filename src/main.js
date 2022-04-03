const core = require('@actions/core')
const github = require('@actions/github')
const plan = require('./plan')

const run = () => {
  const type = core.getInput('type').trim()
  const input = core.getInput('input').trim()
  const sections = core.getInput('sections').split(',').map(s => s.trim())

  if (github.context.eventName !== 'pull_request') {
    core.warning("Action doesn't seem to be running in a PR workflow context.")
    core.warning('Skipping comment creation.')
    return
  }

  const githubToken = process.env.GITHUB_TOKEN
  if (githubToken === 'undefined') {
    throw new Error('GITHUB_TOKEN environment variable is required')
  }

  let comment
  switch (type) {
    case 'plan':
      comment = plan(input, sections)
      break
    default:
      core.warning(`Unknown type ${type}`)
  }

  github.getOctokit.rest.issues.createComment({
    ...github.context.repo,
    issue_number: github.context.issue.number,
    body: comment
  })
}

module.exports = run
