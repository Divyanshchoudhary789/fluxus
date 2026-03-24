const fs = require("fs").promises;
const path = require("path");

async function copyFolder(src, dest) {
    const items = await fs.readdir(src, { withFileTypes: true });

    for (const item of items) {
        if (item.name === "commit.json") continue;

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

async function clearWorkingDir(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.name === ".flux") continue; // important

        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
        } else {
            await fs.unlink(fullPath);
        }
    }
}

async function revertRepo(commitID) {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const commitDir = path.join(repoPath, "commits", commitID);
    const headPath = path.join(repoPath, "HEAD");

    try {
        // 1. clear current working dir
        await clearWorkingDir(process.cwd());

        // 2. copy full commit (recursive)
        await copyFolder(commitDir, process.cwd());

        // 3. update HEAD
        await fs.writeFile(headPath, commitID);

        console.log(`Reverted to commit: ${commitID}`);
    } catch (err) {
        console.error("Revert failed:", err.message);
    }
}

module.exports = { revertRepo };