import * as core from '@actions/core'
import {HttpClient} from '@actions/http-client'

export async function run(): Promise<void> {
    try {
        core.info('Inside run block');


    } catch (e) {
        core.setFailed(`Run failed: ${e}`);
    }
}