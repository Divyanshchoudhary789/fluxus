const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");


async function getToken() {
    try {
        const configPath = path.join(os.homedir(), ".fluxconfig.json");
        const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
        return config.token;
    } catch {
        return null;
    }
}




/*
 Recursively copy folder (used for parent + staging merge)
*/
async function copyFolder(src, dest) {
    const items = await fs.readdir(src, { withFileTypes: true });

    for (const item of items) {
        // skip internal/meta files
        if (item.name === ".flux") continue;
        if (item.name === "commit.json") continue;
        if (item.name === "tree.json") continue;

        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);

        if (item.isDirectory()) {
            await fs.mkdir(destPath, { recursive: true });
            await copyFolder(srcPath, destPath);
        } else {
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.copyFile(srcPath, destPath);
        }
    }
}


/*
 Ensure README.md exists in staging
*/
async function ensureReadme(stagedPath, repoName = "Flux Project") {
    const readmePath = path.join(stagedPath, "README.md");

    try {
        await fs.access(readmePath);
        // already exists → do nothing
    } catch {
        // create default README
        const content = `# ${repoName}

This repository is managed using Flux version control system.

## Description
Add your project description here.

## Features
- Version control
- Commit tracking
- File history

## Usage
Update this README with proper details.
`;

        await fs.writeFile(readmePath, content);
    }
}





/*
 Build tree structure for UI 
*/
async function buildTree(dir, basePath = "") {
    const result = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.name === ".flux") continue;
        if (item.name === "commit.json") continue;
        if (item.name === "tree.json") continue;

        const fullPath = path.join(dir, item.name);
        const relativePath = path.join(basePath, item.name);

        if (item.isDirectory()) {
            result.push({
                name: item.name,
                type: "folder",
                children: await buildTree(fullPath, relativePath)
            });
        } else {
            result.push({
                name: item.name,
                type: "file",
                path: relativePath.replace(/\\/g, "/")
            });
        }
    }

    return result.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}




async function commitRepo(message) {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const stagedPath = path.join(repoPath, "staging");
    const commitsPath = path.join(repoPath, "commits");
    const headPath = path.join(repoPath, "HEAD");
    const configPath = path.join(repoPath, "config.json");

    try {
        // validate message
        if (!message || message.trim() === "") {
            console.log("Commit message required");
            return;
        }

        // login Check
        const token = await getToken();
        if (!token) {
            console.log("Not Logged In. Run: login");
            return;
        }



        // check staging
        let stagedFiles = [];
        try {
            stagedFiles = await fs.readdir(stagedPath);
        } catch {
            console.log("Staging not found. Run init first.");
            return;
        }



        // get repoId from config
        let repoId;
        let repoName = "Flux Project";

        try {
            const config = JSON.parse(await fs.readFile(configPath, "utf-8"));

            if (!config.remotes || !config.remotes.origin) {
                console.log("No remote origin found");
                return;
            }

            repoId = config.remotes.origin.repoId;
            repoName = config.repoName || repoName;
        } catch {
            console.log("Config not found. Setup remote first.");
            return;
        }

        // ensure README exists before commit
        await ensureReadme(stagedPath, repoName);

        // create commit folder
        const commitID = uuidv4();
        const commitDir = path.join(commitsPath, commitID);
        await fs.mkdir(commitDir, { recursive: true });

        // get parent commit
        let parent = null;
        try {
            parent = (await fs.readFile(headPath, "utf-8")).trim();
            if (!parent) parent = null;
        } catch { }

        // copy previous snapshot (IMPORTANT for Git-like behavior)
        if (parent) {
            const parentDir = path.join(commitsPath, parent);
            try {
                await copyFolder(parentDir, commitDir);
            } catch (err) {
                console.log("Parent copy failed:", err.message);
            }
        }

        // apply new changes from staging (overwrite/add)
        await copyFolder(stagedPath, commitDir);

        // build tree after merge
        const tree = await buildTree(commitDir);

        if (tree.length === 0) {
            console.log("Empty commit");
            return;
        }

        // commit metadata
        const commitData = {
            commitId: commitID,
            message,
            timestamp: Date.now(),
            parent,
            tree
        };

        // save metadata
        await fs.writeFile(
            path.join(commitDir, "commit.json"),
            JSON.stringify(commitData, null, 2)
        );

        // save tree separately 
        await fs.writeFile(
            path.join(commitDir, "tree.json"),
            JSON.stringify(tree, null, 2)
        );

        // update HEAD
        await fs.writeFile(headPath, commitID);

        // clear staging
        await fs.rm(stagedPath, { recursive: true, force: true });
        await fs.mkdir(stagedPath, { recursive: true });

        console.log(`Commit created: ${commitID}`);

        // sync with backend
        try {
            await axios.post("http://localhost:8080/commit/create", {
                commitId: commitID,
                message,
                repoId,
                tree,
                parentCommit: parent
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Commit synced with server");
        } catch (err) {
            console.log("Saved locally, sync failed:", err.message);
        }

    } catch (err) {
        console.error("Commit error:", err.message);
    }
}

module.exports = { commitRepo };