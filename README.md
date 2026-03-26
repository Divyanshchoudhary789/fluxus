# Fluxus Project Documentation

## Project Description
Fluxus is a robust project aimed at simplifying the workflow of managing projects in a collaborative environment. It provides a seamless interface for executing various version control commands.

## Tech Stack
- **Language**: JavaScript
- **Framework**: Node.js
- **Database**: MongoDB
- **Version Control**: Git

## Features
- User authentication
- Real-time collaboration
- Version control management
- Intuitive command-line interface

## CLI Commands
- **init**: Initialize a new repository
- **add**: Add files to staging
- **commit**: Commit changes to the repository
- **push**: Push changes to the remote repository
- **pull**: Fetch changes from the remote repository
- **revert**: Revert to a previous commit
- **remote add origin**: Add a remote repository
- **login**: Authenticate user
- **logout**: End user session

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Divyanshchoudhary789/fluxus.git
   cd fluxus
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   npm start
   ```

## Folder Structure
```
fluxus/
├── src/
│   ├── commands/
│   ├── models/
│   └── utils/
├── tests/
├── config/
└── README.md
```

## Additional Information
For detailed information on each command, refer to the documentation within the respective command files.