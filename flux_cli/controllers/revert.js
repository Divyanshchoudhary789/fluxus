const fs = require("fs").promises;
const path = require("path");

async function revertRepo(commitID) {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const commitDir = path.join(repoPath, "commits", commitID);
    const headPath = path.join(repoPath, "HEAD");

    try {
        const items = await fs.readdir(commitDir, { withFileTypes: true });

        for (const item of items) {
            if (item.name === "commit.json") continue;

            const src = path.join(commitDir, item.name);
            const dest = path.join(process.cwd(), item.name);

            if (item.isDirectory()) continue;

            await fs.copyFile(src, dest);
        }

        await fs.writeFile(headPath, commitID);

        console.log(`Reverted to commit: ${commitID}`);
    } catch (err) {
        console.error("Revert failed:", err.message);
    }
}

module.exports = { revertRepo };