const express = require("express");
const app = express();

const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const { Server } = require("socket.io");

const mainRouter = require("./routes/main.router.js");



const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.json());


const mongodb_url = process.env.MONGODB_URL;

mongoose.connect(mongodb_url)
    .then(() => {
        console.log("MongoDB connected Successfully");
    })
    .catch((err) => {
        console.error("Unable to connect with Mongo DB: ", err);
    });


app.use(cors({ origin: "*" }));

app.use("/", mainRouter);



let user = "test";

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
        user = userID;
        console.log("=======");
        console.log(user);
        console.log("=======");
        socket.join(userID);
    });
});


const db = mongoose.connection;

db.once("open", async () => {
    console.log("CRUD Operations called!");
    //CRUD operations
});

app.use((req, res) => {
    res.status(404).send("Page Not Found!");
});

httpServer.listen(port, () => {
    console.log(`Server is Listening on Port ${port}`);
});


