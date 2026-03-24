const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");

async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const configPath = path.join(repoPath, "config.json");
    const commitsPath = path.join(repoPath, "commits");
    const headPath = path.join(repoPath, "HEAD");

    try {
        const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
        const repoId = config.remotes.origin.repoId;

        const data = await s3.send(new ListObjectsV2Command({
            Bucket: S3_BUCKET,
            Prefix: `${repoId}/`,
        }));

        const commitMap = {};

        for (const obj of data.Contents || []) {
            if (!obj.Key || obj.Key.endsWith("/")) continue;

            const parts = obj.Key.split("/");
            const commitId = parts[1];

            if (!commitMap[commitId]) commitMap[commitId] = [];
            commitMap[commitId].push(obj);
        }

        let latestCommitId = null;
        let latestTime = 0;

        // Read commit.json for accurate detection
        for (const commitId in commitMap) {
            const metaObj = commitMap[commitId].find(o => o.Key.endsWith("commit.json"));
            if (!metaObj) continue;

            const res = await s3.send(new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: metaObj.Key
            }));

            const buffer = await streamToBuffer(res.Body);
            const json = JSON.parse(buffer.toString());

            if (json.timestamp > latestTime) {
                latestTime = json.timestamp;
                latestCommitId = commitId;
            }
        }

        if (!latestCommitId) {
            console.log("No commits found");
            return;
        }

        const latestObjects = commitMap[latestCommitId];

        // Save commit locally
        for (const obj of latestObjects) {
            const relativePath = obj.Key.replace(`${repoId}/${latestCommitId}/`, "");
            const filePath = path.join(commitsPath, latestCommitId, relativePath);

            const res = await s3.send(new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: obj.Key
            }));

            const buffer = await streamToBuffer(res.Body);

            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, buffer);
        }

        // Update working directory
        for (const obj of latestObjects) {
            const relativePath = obj.Key.replace(`${repoId}/${latestCommitId}/`, "");

            if (relativePath === "commit.json") continue;

            const filePath = path.join(process.cwd(), relativePath);

            const res = await s3.send(new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: obj.Key
            }));

            const buffer = await streamToBuffer(res.Body);

            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, buffer);
        }

        await fs.writeFile(headPath, latestCommitId);

        console.log("Pull successful:", latestCommitId);
    } catch (err) {
        console.error("Pull failed:", err.message);
    }
}

module.exports = { pullRepo };