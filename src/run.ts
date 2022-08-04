import * as core from '@actions/core'
import * as github from '@actions/github'
import {HttpClient} from '@actions/http-client'
import * as gh from './github'
import {createWriteStream} from 'fs'

export async function run(): Promise<void> {
    try {
        const ghToken: string = core.getInput('repo-token', {required: true});

        // authenticated client to call APIs
        const client: HttpClient = gh.getClient(ghToken);

        // get workflow id see https://docs.github.com/en/actions/learn-github-actions/environment-variables
        const workflowId: string = github.context.runId.toString() || '';
        const repo: string = process.env['GITHUB_REPOSITORY'] || ''
        core.debug(`workflowId: ${workflowId}`);
        core.debug(`repo: ${repo}`);
        

        const context = JSON.stringify(github.context, undefined, 2)
        core.info(`The event context: ${context}`);

        // const workflowLogFile: string = await gh.fetchLogsForWorkflow(client, repo, workflowId);
        // core.debug(`workflow-log-file : ${workflowLogFile}`);
        // core.setOutput('workflow-log-file', workflowLogFile );


        const jobs: gh.Job[] = await gh.fetchJobs(
            client,
            repo,
            workflowId,
            []
          )
          
        core.info(`Getting logs for ${jobs.length} jobs for workflow ${workflowId}`);
        for (const j of jobs) {
            const lines: string[] = await gh.fetchLogsForJob(client, repo, j);
            core.debug(`Fetched ${lines.length} lines for job ${j.name}`);
      
            const tmpfile = `./out-${j.id}.log`;
            core.info(`Writing to ${tmpfile}`);
            const out = createWriteStream(tmpfile);
            out.write(lines);
            out.end();            

        }


    } catch (e) {
        core.setFailed(`Run failed: ${e}`);
    }
}