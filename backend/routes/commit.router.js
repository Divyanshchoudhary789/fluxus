const express = require("express");
const commitRouter = express.Router();

const commitController = require("../controllers/commitController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

commitRouter.post("/commit/create", authMiddleware, commitController.createCommit);



module.exports = commitRouter;