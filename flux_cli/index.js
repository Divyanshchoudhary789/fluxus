#!/usr/bin/env node
// shebang (hashbang) --> Tells the operating system to execute this file using Node.js


const dotenv = require("dotenv");
dotenv.config();

const yargs = require("yargs");

const { hideBin } = require("yargs/helpers");


const { initRepo } = require("./controllers/init.js");
const { addRepo } = require("./controllers/add.js");
const { commitRepo } = require("./controllers/commit.js");
const { pushRepo } = require("./controllers/push.js");
const { pullRepo } = require("./controllers/pull.js");
const { revertRepo } = require("./controllers/revert.js");
const { addRemote } = require("./controllers/addRemote.js");
const { fluxLogin } = require("./controllers/fluxLogin.js");
const { fluxLogout } = require("./controllers/fluxLogout.js");




yargs(hideBin(process.argv))
    .scriptName("flux")
    .command("init", "Initialize a new repository", {}, initRepo)
    .command("add <file>", "add a file to the repository", (yargs) => {
        yargs.positional("file", {
            describe: "File to add to the staging area",
            type: "string",
        });
    }, (argv) => {
        addRepo(argv.file)
    })
    .command("remote add origin <url>", "Add remote repository", (yargs) => {
        yargs.positional("url", {
            describe: "Repository URL (e.g. http://localhost:8080/repo/abc123)",
            type: "string",
        });
    }, (argv) => {
        addRemote(argv.url);
    })
    .command("login", "Login to Flux", {}, fluxLogin)
    .command("logout", "Logout from Flux", {}, fluxLogout)
    .command("commit <message>", "Commit the staged files", (yargs) => {
        yargs.positional("message", {
            describe: "Commit message",
            type: "string",
        });
    }, (argv) => {
        commitRepo(argv.message)
    })
    .command("push", "Push commits to R2", {}, pushRepo)
    .command("pull", "Pull commits from R2", {}, pullRepo)
    .command("revert <commitID>", "Revert to a specific commit", (yargs) => {
        yargs.positional("commitID", {
            describe: "Commit ID to revert to",
            type: "string"
        });
    }, (argv) => {
        revertRepo(argv.commitID)
    })
    .demandCommand(1, "You need at least one command").help().argv;

