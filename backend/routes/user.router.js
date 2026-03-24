const express = require("express");
const userController = require("../controllers/userController.js");
const userRouter = express.Router();


userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:id", userController.getUserProfile);
userRouter.put("/updateProfile/:id", userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", userController.deleteUserProfile);
userRouter.patch("/starRepo/:userId", userController.starRepo);
userRouter.patch("/followUser/:userId", userController.followUser);
userRouter.get("/user/followers/:userId", userController.getFollowers);

userRouter.get("/user/contributions/:userId", userController.getUserContributions);

module.exports = userRouter;