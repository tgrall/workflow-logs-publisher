import * as core from '@actions/core'
import * as github from '@actions/github'
import {HttpClient} from '@actions/http-client'
import * as gh from './github'
import * as artifact from '@actions/artifact'
const artifactClient = artifact.create()

// Split comma separated inputs into an array of trimmed values
export function getCommaSeparatedInput(value: string): string[] {
    let retVal: string[] = []
    if (value !== '') {
      retVal = value.split(',')
      // trim array items
      retVal = retVal.map(s => s.trim())
    }
  
    return retVal
  }

export async function run(): Promise<void> {
    try {
        const ghToken: string = core.getInput('repo-token', {required: true});
        const jobNames: string = core.getInput('job-names', {required: false}) || '';
        const allowList = getCommaSeparatedInput(jobNames);
        // authenticated client to call APIs
        const client: HttpClient = gh.getClient(ghToken);

        // get workflow id see https://docs.github.com/en/actions/learn-github-actions/environment-variables

        // get all the jobs for the current workflow
        const workflowId: string = process.env['GITHUB_RUN_ID'] || ''
        const repo: string = process.env['GITHUB_REPOSITORY'] || ''
        core.debug(`Allow listing ${allowList.length} jobs in repo ${repo}`)
        const jobs: gh.Job[] = await gh.fetchJobs(
            client,
            repo,
            workflowId,
            allowList
        )        // const workflowLogFile: string = await gh.fetchLogsForWorkflow(client, repo, workflowId);
        // core.debug(`workflow-log-file : ${workflowLogFile}`);
        // core.setOutput('workflow-log-file', workflowLogFile );


        let workflowLogFiles: string[] = [];
        core.info(`Getting logs for ${jobs.length} jobs for workflow ${workflowId}`);
        core.info( JSON.stringify(jobs, null, 2) );
        for (const j of jobs) {
            const tmpfile: string = await gh.fetchLogsForJob(client, repo, j);      
            workflowLogFiles.push(tmpfile);
        }
        core.setOutput('workflow-log-file', workflowLogFiles );
        const options = {
            continueOnError: true
        }        
        const uploadResult = await artifactClient.uploadArtifact("job-logs", workflowLogFiles, "/", options)

    } catch (e) {
        core.setFailed(`Run failed: ${e}`);
    }
}