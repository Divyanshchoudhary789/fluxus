const fs = require("fs");
const path = require("path");
const axios = require("axios");
const archiver = require("archiver");
const FormData = require("form-data");

const server_url = "https://fluxus-backend-ym4j.onrender.com";

// zip folder
async function zipFolder(source, out) {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on("error", err => reject(err))
            .pipe(stream);

        stream.on("close", () => resolve());
        archive.finalize();
    });
}

async function pushRepo() {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const commitsPath = path.join(repoPath, "commits");
    const configPath = path.join(repoPath, "config.json");
    const headPath = path.join(repoPath, "HEAD");

    try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        if (!config.remotes || !config.remotes.origin) {
            throw new Error("Remote origin not set");
        }

        const repoId = config.remotes.origin.repoId;
        const commitId = fs.readFileSync(headPath, "utf-8").trim();
        const commitPath = path.join(commitsPath, commitId);

        const zipPath = path.join(repoPath, `${commitId}.zip`);

        console.log("Zipping files...");
        await zipFolder(commitPath, zipPath);

        console.log("Uploading to server...");

        const form = new FormData();
        form.append("repoId", repoId);
        form.append("commitId", commitId);
        form.append("file", fs.createReadStream(zipPath));

        await axios.post(`${server_url}/api/push`, form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        fs.unlinkSync(zipPath); // delete zip after upload

        console.log("Push successful.");

    } catch (err) {
        console.error("Push failed:", err.response?.data || err.message);
    }
}

module.exports = { pushRepo };