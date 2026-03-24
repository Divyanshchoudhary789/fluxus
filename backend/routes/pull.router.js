const express = require("express");
const pullController = require("../controllers/pullController.js");
const pullRouter = express.Router();


pullRouter.post("/api/pull", pullController.pull);


module.exports = pullRouter;