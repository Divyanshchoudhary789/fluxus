const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3, S3_BUCKET } = require("../config/aws-config");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

const push = async (req, res) => {
    try {
        const { repoId, commitId } = req.body;
        const zipFile = req.file;

        if (!repoId || !commitId || !zipFile) {
            return res.status(400).json({ error: "Missing required data" });
        }

        // temp extract path
        const extractPath = path.join(__dirname, "../temp", commitId);

        // unzip
        const zip = new AdmZip(zipFile.path);
        zip.extractAllTo(extractPath, true);

        // recursive upload function (reuse idea)
        async function uploadFolder(localPath, remotePath) {
            const items = fs.readdirSync(localPath, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(localPath, item.name);
                const key = `${remotePath}/${item.name}`;

                if (item.isDirectory()) {
                    await uploadFolder(fullPath, key);
                } else {
                    const fileContent = fs.readFileSync(fullPath);

                    await s3.send(new PutObjectCommand({
                        Bucket: S3_BUCKET,
                        Key: key.replace(/\\/g, "/"),
                        Body: fileContent,
                    }));

                    console.log("Uploaded:", key);
                }
            }
        }

        // upload extracted files to R2
        await uploadFolder(extractPath, `${repoId}/${commitId}`);

        res.json({ message: "Push successful" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { push };