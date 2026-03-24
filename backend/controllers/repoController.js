const mongoose = require("mongoose");
const User = require("../models/userModel.js");
const Repository = require("../models/repoModel.js");
const Issue = require("../models/issueModel.js");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3, S3_BUCKET } = require("../config/aws-config.js");


const createRepository = async (req, res) => {
    const { name, description, visibility, owner, issues } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ message: "Repository name is required!" });
        }

        if (!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ message: "Invalid User ID!" });
        }

        const newRepository = new Repository({
            name, description, visibility, owner, issues
        });

        const result = await newRepository.save();

        res.status(201).json({ message: "Repository created Successfully", repositoryID: result._id });

    } catch (err) {
        console.error("Error during Repository Creation: ", err.message);
        res.status(500).send("Server Error");
    }
}

const getAllRepositories = async (req, res) => {
    try {

        const repositories = await Repository.find({}).populate("owner").populate("issues");
        res.json(repositories);
    } catch (err) {
        console.error("Error during fetching Repositories: ", err.message);
        res.status(500).send("Server Error");
    }
}

const fetchRepositoryById = async (req, res) => {
    const repoId = req.params.repoId;

    try {
        const repository = await Repository.findById(repoId).populate("owner").populate("issues").populate("commits");

        if (!repository) {
            return res.status(400).json({ message: "Repository Not Found!" });
        }

        res.json(repository);
    } catch (err) {
        console.error("Error during Fetching a repository By Id : ", err.message);
        res.status(500).send("Server Error");
    }
}

const fetchRepositoryByName = async (req, res) => {
    const repoName = req.params.name;

    try {

        const repository = await Repository.find({ name: repoName }).populate("owner").populate("issues");
        if (!repository) {
            return res.status(400).json({ message: "Repository Not Found!" });
        }

        res.json(repository);
    } catch (err) {
        console.error("Error during Fetching a Repository by Name: ", err.message);
        res.status(500).send("Server Error");
    }
}

const fetchRepositoriesForCurrentUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const repositories = await Repository.find({ owner: userId });
        if (!repositories) {
            return res.status(404).json({ message: "User Repositories Not Found!" });
        }

        res.json({ message: "Repositories Found!", repositories });

    } catch (err) {
        console.error("Error during fetching user repositories: ", err.message);
        res.status(500).send("Server Error");
    }
}

const updateRepositoryById = async (req, res) => {
    const repoId = req.params.id;
    const { description, websiteLink } = req.body;

    try {
        const repository = await Repository.findById(repoId);
        if (!repository) {
            return res.status(404).json({ message: "Repository Not Found!" });
        }

        repository.description = description;

        if (websiteLink) {
            repository.websiteLink = websiteLink;
        }

        const updatedRepository = await repository.save();
        res.json({ message: "Repository Updated Successfully", repository: updatedRepository });
    } catch (err) {
        console.error("Error during updating a repository by its Id: ", err.message);
        res.status(500).send("Server Error");
    }
}

const toggleVisibilityById = async (req, res) => {
    const repoId = req.params.id;

    try {

        const repository = await Repository.findById(repoId);
        if (!repository) {
            return res.status(404).json({ message: "Repository Not Found!" });
        }

        repository.visibility = !repository.visibility;
        const updatedRepository = await repository.save();

        res.json({ message: "Visibility Updated Successfully", repository: updatedRepository });

    } catch (err) {
        console.error("Error during toggling visibility of a repository by its Id: ", err.message);
        res.status(500).send("Server Error");
    }
}

const deleteRepositoryById = async (req, res) => {
    const repoId = req.params.id;

    try {
        const result = await Repository.findByIdAndDelete(repoId);
        if (result.deletedCount == 0) {
            return res.status(404).json({ message: "Repository Not Found!" });
        }

        res.json({ message: "Repository Deleted Successfully" });
    } catch (err) {
        console.error("Error in deleting a repository by its ID: ", err.message);
        res.status(500).send("Server Error");
    }
}




const getFilesFromR2 = async (req, res) => {


    const streamToString = async (stream) => {
        return new Promise((resolve, reject) => {
            const chunks = [];

            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () =>
                resolve(Buffer.concat(chunks).toString("utf-8"))
            );
        });
    };


    const { repoId } = req.params;
    const { filePath, commitId } = req.query;

    if (!filePath || !commitId) {
        return res.status(400).json({ error: "Missing params" });
    }

    const key = `${repoId}/${commitId}/${filePath}`;

    try {
        const data = await s3.send(
            new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: key
            })
        );

        const content = await streamToString(data.Body);

        res.json({ content });
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: "File not found" });
    }


}



const getRepoStars = async (req, res) => {
    const repoId = req.params.repoId;
    try {
        const users = await User.find({ starRepos: new mongoose.Types.ObjectId(repoId) });
        if (!users) {
            return res.json({ message: "This Repo is not starred by anyone yet!" });
        }

        res.json({ message: "stars fetched successfully!", users });
    } catch (err) {
        console.error("Error in fetching stars for a repo:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
}


module.exports = { createRepository, getAllRepositories, fetchRepositoryById, fetchRepositoryByName, fetchRepositoriesForCurrentUser, updateRepositoryById, toggleVisibilityById, deleteRepositoryById, getRepoStars, getFilesFromR2 };