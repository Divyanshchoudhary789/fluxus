const fs = require("fs");
const path = require("path");

function extractRepoId(url) {
    try {
        const parts = url.split("/");
        const repoId = parts[parts.length - 1];

        if (!repoId) {
            throw new Error("Invalid URL");
        }

        return repoId;
    } catch (err) {
        console.log("Invalid Repository URL");
        process.exit(1);
    }
}

async function addRemote(url) {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const configPath = path.join(repoPath, "config.json");

    if (!fs.existsSync(repoPath)) {
        console.log("Not a flux repository. Run 'init' first.");
        return;
    }

    const repoId = extractRepoId(url);

    let config = {};

    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath));
    }

    if (!config.remotes) {
        config.remotes = {};
    }

    config.remotes.origin = {
        repoId: repoId,
        url: url,
    }

    //save config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log("Remote origin added successfully");
    console.log(`repoId: ${repoId}`);
}

module.exports = { addRemote };