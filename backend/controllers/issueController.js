const mongoose = require("mongoose");
const User = require("../models/userModel.js");
const Issue = require("../models/issueModel.js");

const createIssue = async (req, res) => {
    const { title, description } = req.body;
    const { id } = req.params;

    try {
        const issue = new Issue({
            title,
            description,
            repository: id,
        });

        await issue.save();

        res.status(201).json({ message: "Issue Created Successfully." });

    } catch (err) {
        console.error("Error during Issue Creation: ", err.message);
        res.status(500).send("Server Error");
    }
}

const updateIssueById = async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ message: "Issue Not Found!" });
        }

        issue.title = title;
        issue.description = description;
        issue.status = status;

        await issue.save();
        res.json({ message: "Issue Updated Successfully", issue });
    } catch (err) {
        console.error("Error during Issue updation: ", err.message);
        res.status(500).send("Server Issue");
    }
}

const deleteIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Issue.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: "Issue Not Found!" });
        }

        res.json({ message: "Issue Deleted Successfully." });
    } catch (err) {
        console.error("Error during Issue deletion by id: ", err.message);
        res.status(500).send("server Error");
    }
}

const getAllIssues = async (req, res) => {
    const repoId = req.params.id;
    try {
        const issues = await Issue.find({ repository: repoId }).populate("repository");
        if (!issues) {
            return res.status(404).json({ message: "Issues Not Found!" });
        }

        res.json({ message: "Issues Fetched Successfully.", issues });
    } catch (err) {
        console.error("Error during Fetching Issues: ", err.message);
        res.status(500).send("server Error");
    }
}

const getIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const issue = await Issue.findById(id).populate("repository");
        if (!issue) {
            return res.status(404).json({ message: "Issue Not Found!" });
        }

        res.json({ message: "Issue Fetched Successfully.", issue });
    } catch (err) {
        console.error("Error during Fetching an Issue: ", err.message);
        res.status(500).send("Server Error");
    }
}


module.exports = { createIssue, updateIssueById, deleteIssueById, getAllIssues, getIssueById };