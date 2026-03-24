const axios = require("axios");
const readline = require("readline-sync");
const fs = require("fs");
const path = require("path");
const os = require("os");

const configPath = path.join(os.homedir(), ".fluxconfig.json");

async function fluxLogin() {
    try {
        console.log("Flux login\n");

        const email = readline.questionEMail("Email: ");
        const password = readline.question("Password: ", {
            hideEchoBack: true
        });

        const res = await axios.post("http://localhost:8080/login", {
            email,
            password,
        });

        const { token, userId } = res.data;

        fs.writeFileSync(configPath, JSON.stringify({
            token,
            userId,
        }, null, 2));

        console.log("Login Successful");

    } catch (err) {
        console.log("Login Failed!", err.message);
    }
}


module.exports = { fluxLogin };