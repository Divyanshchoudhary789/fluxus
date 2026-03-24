const express = require("express");
const mainRouter = express.Router();

const userRouter = require("./user.router.js");
const repoRouter = require("./repo.router.js");
const issueRouter = require("./issue.router.js");
const commitRouter = require("./commit.router.js");
const pushRouter = require("./push.router.js");
const pullRouter = require("./pull.router.js");

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
mainRouter.use(commitRouter);
mainRouter.use(pushRouter);
mainRouter.use(pullRouter);

mainRouter.get("/", (req, res) => {
    res.send("Welcome to Fluxus!");
});


module.exports = mainRouter;