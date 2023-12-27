const core = require('@actions/core');
const github = require("@actions/github");
const messages = {};
const validEvent = ['push', 'pull_request'];
messages.exceptList = 'target branch is in except list. Check was skipped';
messages.squash = 'Only 1 commit is possible in pull request. Please squash your commits';
messages.backport = 'source branch is backport. Check was skipped';


async function run() {
    try{
        const eventName = github.context.eventName;
        core.info(`Event name: ${eventName}`);
        if (validEvent.indexOf(eventName) < 0) {
            core.setFailed(`Invalid event: ${eventName}`);
            return;
        }

        const payload = core.getInput('payload') ;
        const jsonPayload = JSON.parse(payload);

        const exceptBranches = core.getInput('except-branches').split(';');
        const commitsCount = Number.parseInt(core.getInput('commits-count'));

        const branch = getBranchName(eventName, jsonPayload);
        const pattern = exceptBranches.find((target) => target.match( (branch).split("/")[0] ))
        if (pattern) {
            core.info(messages.exceptList);
        } else {
            // check commit count
            const commitsOnPr = parseInt(jsonPayload.pull_request.commits)

            core.info(`Commits On Pr: ${commitsOnPr}`);
            core.info(`Commits Allowed: ${commitsCount}`);
            if (commitsOnPr>commitsCount){
                core.setFailed(`Commits number ${commitsOnPr} only allowed  ${commitsCount}`);
            }
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

function getBranchName(eventName, payload) {
    let branchName;
    switch (eventName) {
        case 'push':
            branchName = payload.ref.replace('refs/heads/', '');
            break;
        case 'pull_request':
            branchName = payload.pull_request.head.ref;
            break;
        default:
            throw new Error(`Invalid event name: ${eventName}`);
    }
    return branchName;
}

run();
