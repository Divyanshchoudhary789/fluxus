const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RepositorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
    },

    latestCommitId: {
        type: String,
        default: null,
    },
    commits: [
        {
            type: Schema.Types.ObjectId,
            ref: "Commit",
        }
    ],

    visibility: {
        type: Boolean,
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    issues: [
        {
            type: Schema.Types.ObjectId,
            ref: "Issue",
        },
    ],

    websiteLink: {
        type: String,
        default: null,
    }

}, { timestamps: true });


const Repository = mongoose.model("Repository", RepositorySchema);

module.exports = Repository;