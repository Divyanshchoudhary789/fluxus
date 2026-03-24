const mongoose = require("mongoose");
const Repository = require("../models/repoModel.js");
const User = require("../models/userModel.js");
const Issue = require("../models/issueModel.js");
const Commit = require("../models/commitModel.js");


const createCommit = async (req, res) => {
    const { commitId, message, repoId, tree } = req.body;

    try {
        if (!commitId || !message || !repoId) {
            return res.status(400).json({ error: "commitId, message, and repoId are required!" })
        }

        const repo = await Repository.findById(repoId);
        if (!repo) {
            return res.status(404).json({ message: "Repository Not Found!" });
        }

        const parentCommitId = repo.latestCommitId || null;

        const commit = new Commit({
            commitId,
            message,
            repository: repoId,
            tree,
            author: req.userId,
            parentCommit: parentCommitId,
        });

        await commit.save();

        const response = await Repository.findByIdAndUpdate(repoId, {
            latestCommitId: commitId,
            $push: { commits: commit._id },
        });

        //console.log(response);
        res.status(201).json({ message: "Commit Created Successfully", commit });

    } catch (err) {
        console.error("Error in Creating a Commit", err.message);
        res.status(500).send("Server Error");
    }
}


module.exports = { createCommit };