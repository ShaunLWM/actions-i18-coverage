/* eslint-disable no-console */
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as glob from '@actions/glob'
import {Octokit} from '@octokit/rest'

async function run(): Promise<void> {
  try {
    const contextPullRequest = github.context.payload.pull_request
    if (!contextPullRequest) {
      throw new Error(
        "This action can only be invoked in `pull_request` events. Otherwise the pull request can't be inferred."
      )
    }

    const repoToken = core.getInput('repo-token')

    const octokit = new Octokit({
      auth: repoToken
    })

    const files = await octokit.pulls.listFiles({
      ...github.context.repo,
      pull_number: contextPullRequest.number
    })

    const changedFilesGlobber = await glob.create(
      files.data.map(file => file.filename).join('\n')
    )
    const changedFiles = await changedFilesGlobber.glob()
    console.log(changedFiles)

    const patterns = [
      'src/locales/translations-*.ts',
      'src/assets/web-translations-*.json'
    ]
    const translationsGlobber = await glob.create(patterns.join('\n'))
    const translationFiles = await translationsGlobber.glob()
    console.log(translationFiles)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
