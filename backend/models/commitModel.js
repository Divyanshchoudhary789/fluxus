const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const CommitSchema = new Schema({
    commitId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    message: {
        type: String,
        required: true
    },

    repository: {
        type: Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
        index: true,
    },

    tree: {
        type: Object,
        required: true,
    }
    ,

    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },

    parentCommit: {
        type: String,
        default: null
    }

});


const Commit = mongoose.model("Commit", CommitSchema);


module.exports = Commit;