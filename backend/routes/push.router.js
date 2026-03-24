const express = require("express");
const pushController = require("../controllers/pushController.js");
const pushRouter = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

pushRouter.post("/api/push", upload.single("file"), pushController.push);

module.exports = pushRouter;