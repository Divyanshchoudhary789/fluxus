const { GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { s3, S3_BUCKET } = require("../config/aws-config");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

const pull = async (req, res) => {
    try {
        const { repoId } = req.body;

        if (!repoId) {
            return res.status(400).json({ error: "repoId required" });
        }

        // list objects
        const data = await s3.send(new ListObjectsV2Command({
            Bucket: S3_BUCKET,
            Prefix: `${repoId}/`,
        }));

        let latestCommitId = null;
        let latestTime = 0;

        for (const obj of data.Contents || []) {
            if (!obj.Key || !obj.Key.endsWith("commit.json")) continue;

            const parts = obj.Key.split("/");
            const commitId = parts[1];

            const resObj = await s3.send(new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: obj.Key
            }));

            const buffer = await streamToBuffer(resObj.Body);
            const json = JSON.parse(buffer.toString());

            if (json.timestamp > latestTime) {
                latestTime = json.timestamp;
                latestCommitId = commitId;
            }
        }

        if (!latestCommitId) {
            return res.status(404).json({ error: "No commits found" });
        }

        // fetch all files of latest commit
        const objects = (data.Contents || []).filter(
            obj => obj.Key.startsWith(`${repoId}/${latestCommitId}/`)
        );

        const zip = new AdmZip();

        for (const obj of objects) {
            if (obj.Key.endsWith("/")) continue;

            const relativePath = obj.Key.replace(`${repoId}/${latestCommitId}/`, "");

            const resObj = await s3.send(new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: obj.Key
            }));

            const buffer = await streamToBuffer(resObj.Body);

            zip.addFile(relativePath, buffer);
        }

        const zipBuffer = zip.toBuffer();

        res.setHeader("Content-Type", "application/zip");
        res.setHeader("x-commit-id", latestCommitId);

        res.send(zipBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { pull };