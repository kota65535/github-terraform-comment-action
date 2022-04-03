const core = require('@actions/core')
const github = require('@actions/github')

const plan = (commentInput, githubToken) => {
  core.info('Looking for an existing fmt PR comment.')
  const context = github.context
  const octokit = github.getOctokit(githubToken)
  octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: context.issue.number,
    body: 'aaaa'
  })
}

const run = () => {
  const commentType = core.getInput('comment_type').trim()
  const commentInput = core.getInput('comment_input').trim()
  const githubToken = core.getInput('github-token').trim()

  if (github.context.eventName !== 'pull_request') {
    core.warning("Action doesn't seem to be running in a PR workflow context.")
    core.warning('Skipping comment creation.')
    return
  }

  switch (commentType) {
    case 'plan':
      plan(commentInput, githubToken)
      break
    default:
      core.warning(`Unknown comment_type ${commentType}`)
  }
}

module.exports = run
