import * as core from '@actions/core'
import {HttpClient} from '@actions/http-client'
import * as gh from './github'

export async function run(): Promise<void> {
    try {
        core.info('Inside run block');
        const ghToken: string = core.getInput('repo-token', {required: true});

        // authenticated client to call APIs
        const client: HttpClient = gh.getClient(ghToken);

        // get workflow id see https://docs.github.com/en/actions/learn-github-actions/environment-variables
        const workflowId: string = process.env['GITHUB_RUN_ID'] || '';
        core.info("workflowId: " + workflowId);

    } catch (e) {
        core.setFailed(`Run failed: ${e}`);
    }
}