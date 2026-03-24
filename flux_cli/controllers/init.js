const fs = require("fs").promises;
const path = require("path");

async function initRepo() {
    const repoPath = path.resolve(process.cwd(), ".flux");

    try {
        // Create main repo folder
        await fs.mkdir(repoPath, { recursive: true });

        // Create required subfolders
        await fs.mkdir(path.join(repoPath, "commits"), { recursive: true });
        await fs.mkdir(path.join(repoPath, "staging"), { recursive: true });

        // Create config file
        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({}, null, 2)
        );

        // Create HEAD file (tracks latest commit)
        await fs.writeFile(path.join(repoPath, "HEAD"), "");

        console.log("Repository initialized successfully");
    } catch (e) {
        console.error("Error initializing repository:", e.message);
    }
}

module.exports = { initRepo };