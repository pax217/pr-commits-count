const core = require('@actions/core');
const exec = require("@actions/exec");
const github = require("@actions/github");
const src = __dirname;
const messages = {};
messages.exceptList = 'target branch is in except list. Check was skipped';
messages.squash = 'Only 1 commit is possible in pull request. Please squash your commits';
messages.backport = 'source branch is backport. Check was skipped';

try {
    const payload = core.getInput('payload') ;
    const jsonPayload = JSON.parse(payload);

    const targetBranch = jsonPayload.pull_request.base.ref
    const sourceBranch = jsonPayload.pull_request.head.ref
    const exceptBranches = core.getInput('except-branches').split(';');
    const commitsCount = Number.parseInt(core.getInput('commits-count'));

    if (sourceBranch.split("/").includes("backport")) {
        core.info(messages.backport);
        return
    }

    const pattern = exceptBranches.find((target) => target.match( (targetBranch).split("/")[0] ))
    if (pattern) {
        core.info(messages.exceptList);
    } else {
        // check commit count
        const commitsOnPr = parseInt(jsonPayload.commits)

        core.info(`commitsOnPr: ${commitsOnPr}`);
        core.info(`commitsCount: ${commitsCount}`);
        if (commitsOnPr>commitsCount){
            core.setFailed(`Commits number ${commitsOnPr} only allowed  ${commitsCount}`);
            return
        }
    }

} catch (error) {
    core.setFailed(error.message);
}
