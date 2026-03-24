const express = require("express");
const issueRouter = express.Router();

const issueController = require("../controllers/issueController.js");


issueRouter.post("/issue/create/:id", issueController.createIssue);
issueRouter.put("/issue/update/:id", issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", issueController.deleteIssueById);
issueRouter.get("/issue/all/:id", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueById);


module.exports = issueRouter;