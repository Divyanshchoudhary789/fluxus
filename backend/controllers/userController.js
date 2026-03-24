const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const { ObjectId } = require("mongodb");

const Commit = require("../models/commitModel.js");
const User = require("../models/userModel.js");
const mongoose = require("mongoose");

dotenv.config();
const url = process.env.MONGODB_URL;

let client;

async function connectClient() {
    if (!client) {
        client = new MongoClient(url);
        await client.connect();
    }
}

const signup = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        await connectClient();
        const db = client.db("fluxus");
        const usersCollection = db.collection("users");

        if (!username && !password && !email) {
            return res.status(422).json({ message: "All fields are required to signup" });
        }

        const user = await usersCollection.findOne({ username });
        if (user) {
            return res.status(400).json({ "message": "User Already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username: username,
            password: hashedPassword,
            email: email,
            repositories: [],
            followedUsers: [],
            starRepos: []
        };

        const result = await usersCollection.insertOne(newUser);
        //console.log(result.insertedId);
        const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, userId: result.insertedId });

    } catch (err) {
        console.error("Error in signup: ", err.message);
        res.status(500).send("Server Error");
    }
}


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        await connectClient();
        const db = client.db("fluxus");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ "message": "Invalid Credentials!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ "message": "Invalid Credentials!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
        res.json({ token, userId: user._id });

    } catch (err) {
        console.error("Error in login: ", err.message);
        res.status(500).json({ message: "Server Error" });
    }
}


const getAllUsers = async (req, res) => {
    try {
        await connectClient();
        const db = client.db("fluxus");
        const usersCollection = db.collection("users");

        const users = await usersCollection.find({}).toArray();
        res.json(users);

    } catch (err) {
        console.error("Error in Fetching All Users: ", err.message);
        res.status(500).send("Server Error");
    }
}

const getUserProfile = async (req, res) => {
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("fluxus");
        const usersCollection = db.collection("users");

        const user = await usersCollection.aggregate([
            {
                $match: {
                    _id: new ObjectId(currentID)
                }
            },
            {
                $lookup: {
                    from: "repositories",
                    localField: "starRepos",
                    foreignField: "_id",
                    as: "starredRepos"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "followedUsers",
                    foreignField: "_id",
                    as: "followingUsers"
                }
            }
        ]).toArray();


        if (!user) {
            return res.status(404).json({ "message": "User Not Found!" });
        }

        res.send(user[0]);
    } catch (err) {
        console.error("Error in Fetching User Profile: ", err.message);
        res.status(500).send("Server Error");
    }
}

const updateUserProfile = async (req, res) => {
    const currentID = req.params.id;
    const { email, password } = req.body;

    try {
        await connectClient();
        const db = client.db("fluxus");
        const usersCollection = db.collection("users");

        const updateFields = {}

        if (email) {
            updateFields.email = email;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }

        if (!email && !password) {
            return res.status(400).json({ message: "Enter the details to update" });
        }

        const result = await usersCollection.findOneAndUpdate({ _id: new ObjectId(currentID) }, { $set: updateFields }, { returnDocument: "after" });

        if (!result) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        res.json({ message: "User Profile Updated Successfully", result });
    } catch (err) {
        console.error("Error in Updating User Profile: ", err.message);
        res.status(500).send("Server Error");
    }
}

const deleteUserProfile = async (req, res) => {
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("fluxus");
        const usersCollection = db.collection("users");

        const result = await usersCollection.deleteOne({ _id: new ObjectId(currentID) });
        console.log(result);
        if (result.deletedCount == 0) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        res.json({ message: "User Profile Deleted Successfully." });
    } catch (err) {
        console.error("Error in Deleting User Profile: ", err.message);
        res.status(500).send("Server Error");
    }
}

const getUserContributions = async (req, res) => {
    const { userId } = req.params;

    try {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const commits = await Commit.find({
            author: userId,
            createdAt: { $gte: oneYearAgo },
        });

        const map = {};

        commits.forEach(commit => {
            const date = commit.createdAt.toISOString().split("T")[0];

            map[date] = (map[date] || 0) + 1;
        });

        res.json(map);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
}



const starRepo = async (req, res) => {
    const { userId } = req.params;
    const repoId = req.body.repoId;

    try {
        const user = await User.findById(userId);

        if (user.starRepos.includes(repoId)) {
            res.json({ message: "Repo is alredy starred!" });
            return;
        }

        user.starRepos.push(repoId);
        await user.save();

        res.json({ message: "Repo Starred Successfully!" });

    } catch (err) {
        console.error("Error in starring a repo:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
}



const followUser = async (req, res) => {
    const userId = req.params.userId;
    const anotherUser = req.body.repoOwnerId;

    try {
        const user = await User.findById(userId);

        if (user.followedUsers.includes(anotherUser)) {
            return res.json({ message: "You Already following this User:" });
        }

        user.followedUsers.push(anotherUser);
        await user.save();

        res.json({ message: "User Followed" });

    } catch (err) {
        console.error("Error in following a user:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
}


const getFollowers = async (req, res) => {
    const userId = req.params.userId;

    try {
        const followers = await User.find({
            followedUsers: new mongoose.Types.ObjectId(userId)
        });

        //console.log(followers);
        res.json(followers);
    } catch (err) {
        console.error("Error in getting Followers:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
}




module.exports = {
    getAllUsers, signup, login, getUserProfile, updateUserProfile, deleteUserProfile, starRepo, followUser, getFollowers, getUserContributions
};