const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline-sync");

const configPath = path.join(os.homedir(), ".fluxconfig.json");

async function fluxLogout() {
    try {

        const confirm = readline.question("Are you sure you want to logout? (y/n): ");

        if (confirm.toLowerCase() !== "y") {
            console.log("Logout Cancelled!");
            return;
        }


        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
            console.log("Logged out Successfully!");
        } else {
            console.log("You are already Logged out!");
        }
    } catch (err) {
        console.log("Logout Failed:", err.message);
    }
}

module.exports = { fluxLogout }