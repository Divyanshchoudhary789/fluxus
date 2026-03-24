const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function uploadFolder(localPath, remotePath) {
    const items = await fs.readdir(localPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(localPath, item.name);
        const key = `${remotePath}/${item.name}`;

        if (item.isDirectory()) {
            await uploadFolder(fullPath, key);
        } else {
            const fileContent = await fs.readFile(fullPath);

            console.log("Uploading files...");
            
            await s3.send(new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: fileContent,
            }));

            console.log("Uploaded:", key);
        }
    }
}

async function pushRepo() {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const commitsPath = path.join(repoPath, "commits");
    const configPath = path.join(repoPath, "config.json");
    const headPath = path.join(repoPath, "HEAD");

    try {
        const config = JSON.parse(await fs.readFile(configPath, "utf-8"));

        if (!config.remotes || !config.remotes.origin) {
            throw new Error("Remote origin not set");
        }

        const repoId = config.remotes.origin.repoId;

        const commitId = (await fs.readFile(headPath, "utf-8")).trim();
        const commitPath = path.join(commitsPath, commitId);

        await uploadFolder(commitPath, `${repoId}/${commitId}`);

        console.log("Push successful");
    } catch (err) {
        console.error("Push failed:", err.message);
    }
}

module.exports = { pushRepo };