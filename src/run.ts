import * as core from '@actions/core'
const github = require('@actions/github');

import {HttpClient} from '@actions/http-client'
import * as gh from './github'

export async function run(): Promise<void> {
    try {
        const ghToken: string = core.getInput('repo-token', {required: true});

        // authenticated client to call APIs
        const client: HttpClient = gh.getClient(ghToken);

        // get workflow id see https://docs.github.com/en/actions/learn-github-actions/environment-variables
        const workflowId: string = process.env['GITHUB_RUN_ID'] || '';
        const repo: string = process.env['GITHUB_REPOSITORY'] || ''

        const payload = JSON.stringify(github.context.payload, undefined, 2)
        core.info(`The event payload: ${payload}`);

        const workflowLogFile: string = await gh.fetchLogsForWorkflow(client, repo, workflowId);
        core.debug(`workflow-log-file : ${workflowLogFile}`);
        core.setOutput('workflow-log-file', workflowLogFile );


        // const jobs: gh.Job[] = await gh.fetchJobs(
        //     client,
        //     repo,
        //     workflowId,
        //     []
        //   )
          
        // core.debug(`Getting logs for ${jobs.length} jobs for workflow ${workflowId}`);
        // for (const j of jobs) {
        //     const lines: string[] = await gh.fetchLogsForJob(client, repo, j);
        //     core.debug(`Fetched ${lines.length} lines for job ${j.name}`);
      
        //     const tmpfile = `./out-${j.id}.log`;
        //     core.debug(`Writing to ${tmpfile}`);
        // }


    } catch (e) {
        core.setFailed(`Run failed: ${e}`);
    }
}