const fs = require("fs");
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");

const server_url = "https://fluxus-backend-ym4j.onrender.com";

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".flux");
    const configPath = path.join(repoPath, "config.json");
    const commitsPath = path.join(repoPath, "commits");
    const headPath = path.join(repoPath, "HEAD");

    try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        if (!config.remotes || !config.remotes.origin) {
            throw new Error("Remote origin not set");
        }

        const repoId = config.remotes.origin.repoId;

        console.log("Downloading latest commit...");

        const res = await axios.post(
            `${server_url}/api/pull`,
            { repoId },
            { responseType: "arraybuffer" } // important
        );

        const zipBuffer = res.data;

        // temp zip path
        const zipPath = path.join(repoPath, "latest.zip");
        fs.writeFileSync(zipPath, zipBuffer);

        // unzip
        const zip = new AdmZip(zipPath);
        const extractPath = path.join(commitsPath, "temp");

        zip.extractAllTo(extractPath, true);

        // get commitId from response headers
        const commitId = res.headers["x-commit-id"];

        const finalPath = path.join(commitsPath, commitId);

        fs.renameSync(extractPath, finalPath);

        // copy to working directory
        function copyFolder(src, dest) {
            const items = fs.readdirSync(src, { withFileTypes: true });

            for (const item of items) {
                const srcPath = path.join(src, item.name);
                const destPath = path.join(dest, item.name);

                if (item.isDirectory()) {
                    fs.mkdirSync(destPath, { recursive: true });
                    copyFolder(srcPath, destPath);
                } else {
                    fs.writeFileSync(destPath, fs.readFileSync(srcPath));
                }
            }
        }

        copyFolder(finalPath, process.cwd());

        fs.writeFileSync(headPath, commitId);

        fs.unlinkSync(zipPath);

        console.log("Pull successful:", commitId);

    } catch (err) {
        console.error("Pull failed:", err.response?.data || err.message);
    }
}

module.exports = { pullRepo };