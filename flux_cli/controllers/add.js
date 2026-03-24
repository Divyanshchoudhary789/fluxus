const fs = require("fs").promises;
const path = require("path");

async function addRepo(filePath) {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const stagingPath = path.join(repoPath, "staging");

    try {
        // Maintain folder structure
        const relativePath = path.relative(process.cwd(), filePath);
        const destPath = path.join(stagingPath, relativePath);

        // Create directories if needed
        await fs.mkdir(path.dirname(destPath), { recursive: true });

        // Copy file to staging
        await fs.copyFile(filePath, destPath);

        console.log(`Added ${relativePath} to staging`);
    } catch (e) {
        console.error("Error adding file:", e.message);
    }
}

module.exports = { addRepo };