const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const plan = require('./plan')

const createCommentBody = (result) => {
  const title = result.title
  const detail = result.detail
  return `### ${title}
    <details open><summary>Show Output</summary>
    \`\`\`diff
    ${detail}
    \`\`\`
    </details>`
}

const run = () => {
  const type = core.getInput('type').trim()
  let input = core.getInput('input').trim()
  const inputFile = core.getInput('input_file').trim()
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

  if (input && inputFile) {
    throw new Error('Specify only one of input or input_file')
  }

  if (inputFile) {
    input = fs.readFileSync(inputFile, 'utf-8')
  }

  core.info("Input:")
  core.info(input)

  let result
  switch (type) {
    case 'plan':
      result = plan(input, sections)
      break
    default:
      core.warning(`Unknown type ${type}`)
  }

  core.info(result)

  const octokit = github.getOctokit(githubToken)

  octokit.rest.issues.createComment({
    ...github.context.repo,
    issue_number: github.context.issue.number,
    body: createCommentBody(result)
  })
}

module.exports = run
