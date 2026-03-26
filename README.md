## Fluxus - Version Control System
A complete GitHub-like version control platform with an integrated CLI tool for seamless repository management and version tracking.

## 🎯 Overview
**Fluxus** is a full-stack version control platform designed to replicate GitHub's core functionality. It enables users to create repositories, manage files with nested folder structures, track commits, and maintain complete version history—all from both a web interface and an integrated command-line tool.

# 🌐 Live Deployment

### Frontend (Render)
https://fluxus-1i48.onrender.com

### Backend (Render)
https://fluxus-backend-ym4j.onrender.com

---

### Key Highlights:
- 🌐 Full-featured web application built with React
- 💾 RESTful API backend powered by Express.js
- 🔐 Secure user authentication with JWT
- 📁 File explorer with nested directory support
- 📊 Contribution tracking and heatmaps
- ⚡ Custom Git-like CLI for terminal-based workflow
- ☁️ Cloudflare R2 for distributed file storage

-------

##Tech Stack- Fluxus
1. Frontend - React.js
2. Backend - Node.js, Express.js, JWT + bcryptjs(Authentication)
3. Database - Mongodb
4. Cloudflare R2 Object Storage - to store the user code files.

### CLI Tool
- **Command Parser**: Yargs
- **File Compression**: ADM-ZIP, Archiver
- **Cloud Integration**: AWS S3 SDK
- **Interactive Input**: readline-sync
- **Utilities**: UUID for unique identifiers


  
### 💻 CLI Tool (Flux)

The `flux` CLI tool brings Git-like workflows directly to your terminal, enabling developers to manage repositories programmatically without touching the web interface.

**Available Commands:**
- `flux init` - Initialize a new repository
- `flux add <file>` - Stage files for commit
- `flux commit <message>` - Create commits with descriptive messages
- `flux push` - Upload commits and changes to Cloudflare R2
- `flux pull` - Fetch latest changes from remote
- `flux revert <commitID>` - Rollback to a specific commit
- `flux remote add origin <url>` - Configure remote repository URL
- `flux login` - Authenticate with Fluxus platform
- `flux logout` - Logout from current session

# CLI Installation Command -->  npm i fluxus_cli
---

# 👨‍💻 Author

**Divyansh Choudhary**

Full Stack Developer | MERN STACK Developer

GitHub:  
https://github.com/Divyanshchoudhary789

LinkedIn:  
https://www.linkedin.com/in/divyansh--choudhary/
