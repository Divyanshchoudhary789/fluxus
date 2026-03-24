import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import "./ShowRepo.css";

import { useParams } from "react-router-dom";
import { useAuth } from "../../../authContext.jsx";

import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import { FormControl, TextInput, TreeView } from '@primer/react'
import Navbar from "../../Navbar/Navbar.jsx";
import Footer from "../../Footer/Footer.jsx";
import { CopyIcon } from '@primer/octicons-react'
import { UnderlineNav } from '@primer/react'

import { Banner } from '@primer/react'
import { CodeIcon } from '@primer/octicons-react'
import { IssueOpenedIcon } from '@primer/octicons-react'
import { GearIcon } from '@primer/octicons-react'
import { Avatar } from '@primer/react'
import { Token } from '@primer/react'
import { LinkIcon } from '@primer/octicons-react'
import { Button } from '@primer/react'
import { BookIcon } from '@primer/octicons-react'
import { FileDirectoryFillIcon } from '@primer/octicons-react'
import { FileDirectoryOpenFillIcon } from '@primer/octicons-react'
import { FileIcon } from '@primer/octicons-react';
import { XIcon } from '@primer/octicons-react';
import { RepoLockedIcon } from '@primer/octicons-react'
import { StarIcon } from '@primer/octicons-react'




function ShowRepo() {
    const { repoId } = useParams();
    const inputRef = useRef(null);

    const [showMsg, setShowMsg] = useState("");

    const [repository, setRepository] = useState({});
    const [tab, setTab] = useState("");
    const [openDescriptionUpdateForm, setOpenDescriptionUpdateForm] = useState(false);
    const [webLink, setWebLink] = useState("");
    const [repoDescription, setRepoDescription] = useState("");
    const [repoVisibility, setRepoVisibility] = useState();
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [allIssues, setAllIssues] = useState([]);
    const [openFolders, setOpenFolders] = useState({});
    const [username, setUsername] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [changeVisibilityOpen, setChangeVisibilityOpen] = useState(false);
    const [openDeleteRepoForm, setOpenDeleteRepoForm] = useState(false);
    const [repoStarsCount, setRepoStarsCount] = useState(0);

    const [params] = useSearchParams();
    const navigate = useNavigate();

    const { currentUser } = useAuth();

    const copyToClipboard = () => {
        if (inputRef.current) {
            inputRef.current.select();
            document.execCommand("copy");
            setShowMsg("Text Copied!");
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        }
    }


    useEffect(() => {
        const fetchRepo = async () => {
            try {
                const repo = await axios.get(`http://localhost:8080/repo/${repoId}`);
                //console.log(repo);
                setRepository(repo.data);
                setRepoDescription(repo.data.description);
                setWebLink(repo.data.websiteLink);
                setUsername(repo.data.owner.username);
                setOwnerId(repo.data.owner._id);
                setRepoVisibility(repo.data.visibility);

                const latestCommitId = repo.data.latestCommitId;
                const latestCommit = repo.data.commits.find((commit) => (
                    commit.commitId === latestCommitId
                ));

                if (latestCommit && latestCommit.tree) {
                    setTreeData(latestCommit.tree);
                }


            } catch (err) {
                console.error("Error in fetching repository by its id:", err);
            }
        }


        fetchRepo();
    }, [repoId]);


    useEffect(() => {
        const tabParam = params.get("tab");
        if (tabParam) {
            setTab(tabParam);
        } else {
            setTab("");
        }
    }, [params]);


    const handleDescriptionUpdate = async () => {
        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:8080/repo/update/${repoId}`, {
                description: repoDescription,
                websiteLink: webLink,
            });
            //console.log(response);
            setRepoDescription(response.data.repository.description);
            setWebLink(response.data.repository.websiteLink);
            setLoading(false);
            setOpenDescriptionUpdateForm(false);
            setShowMsg(response.data.message);
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        } catch (err) {
            console.error("Error in updating repo description:", err.message);
            setLoading(false);
            setOpenDescriptionUpdateForm(false);
            setShowMsg("Something Went Wrong!");
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        }
    }

    useEffect(() => {
        const getAllIssues = async () => {
            try {
                const result = await axios.get(`http://localhost:8080/issue/all/${repoId}`);
                //console.log(result);
                if (result) {
                    setAllIssues(result.data.issues);
                }
                //console.log(allIssues);
            } catch (err) {
                console.error("Error in fetching issues of a repo:", err.message);
            }
        }


        getAllIssues();
    }, [repoId]);


    const toggleFolder = (path) => {
        setOpenFolders((prev) => ({
            ...prev,
            [path]: !prev[path]
        }));
    };


    const renderTree = (nodes = [], parentPath = "") => {
        return nodes.map((node, index) => {
            const currentPath = parentPath + "/" + node.name;

            if (node.type === "folder") {
                const isOpen = openFolders[currentPath];

                return (
                    <div key={currentPath}>
                        <div
                            className="tree-item folder"
                            onClick={() => toggleFolder(currentPath)}
                        >
                            <span className="icon">
                                {isOpen ? <FileDirectoryOpenFillIcon style={{ color: "#9198A1" }} size={16} /> : <FileDirectoryFillIcon style={{ color: "#9198A1" }} size={16} />}
                            </span>
                            {node.name}
                        </div>

                        {isOpen && (
                            <div className="tree-children">
                                {renderTree(node.children, currentPath)}
                            </div>
                        )}
                    </div>
                );
            } else {
                return (
                    <div
                        key={currentPath}
                        className="tree-item file"
                        onClick={() => handleFileClick(node.path)}
                    >
                        <span className="icon"><FileIcon style={{ color: "#9198A1" }} size={16} /></span>
                        {node.name}
                    </div>
                );
            }
        });
    };



    const handleFileClick = (filePath) => {
        if (currentUser !== ownerId && repository.visibility === false) {
            setShowMsg("Access Denied! Private Repository");
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
            return;
        } else {
            const commitId = repository.latestCommitId;

            navigate(`/repo/${repoId}/blob/${commitId}/${filePath}`);
        }

    };


    const changeVisibility = async () => {
        try {
            const response = await axios.patch(`http://localhost:8080/repo/toggle/${repoId}`);

            if (response) {
                setShowMsg(response.data.message);
                setRepoVisibility(response.data.repository.visibility);
                setChangeVisibilityOpen(false);
            }
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        } catch (err) {
            console.error("Something Went Wrong", err);
            setShowMsg("Something Went Wrong!");
            setChangeVisibilityOpen(false);
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        }
    }


    const deleteRepo = async () => {
        try {
            const result = await axios.delete(`http://localhost:8080/repo/delete/${repoId}`);
            if (result) {
                //console.log(result);
                setShowMsg(result.data.message);
                setOpenDeleteRepoForm(false);
                navigate("/repos");
                setTimeout(() => {
                    setShowMsg("");
                }, 2000);
            }
        } catch (err) {
            console.error("Error in deleting repository", err);
            setShowMsg("Repo Deletion Failed!");
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        }
    }


    const handleSettingsNavigation = () => {
        if (currentUser && ownerId && currentUser === ownerId) {
            navigate(`/repo/${repoId}?tab=settings`);
        } else {
            setShowMsg("Access Denied!");
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        }
    }


    useEffect(() => {
        const getRepoStars = async () => {
            try {
                const result = await axios.get(`http://localhost:8080/repo/stars/${repoId}`);
                //console.log(result);
                setRepoStarsCount(result.data.users.length);

            } catch (err) {
                console.error("Error in fetching stars count for a repo:", err.message);
            }
        }

        getRepoStars();
    }, [repository]);

    return (
        <>
            <Navbar profileNavStyle={{ borderBottom: "none" }} />
            <div className="upper-navlist">
                <UnderlineNav aria-label="Repository with leading icons">
                    <UnderlineNav.Item icon={CodeIcon} aria-current={tab === "" ? "page" : undefined} onClick={() => { navigate(`/repo/${repoId}`) }} >
                        Code
                    </UnderlineNav.Item>
                    <UnderlineNav.Item icon={IssueOpenedIcon} counter={<span className="issue-counter">{allIssues.length}</span>} aria-current={tab === "issues" ? "page" : undefined} onClick={() => { navigate(`/repo/${repoId}?tab=issues`) }} >Issues</UnderlineNav.Item>
                    <UnderlineNav.Item icon={GearIcon} aria-current={tab === "settings" ? "page" : undefined} onClick={handleSettingsNavigation}>Settings</UnderlineNav.Item>
                </UnderlineNav>
            </div>
            <div className="outer-main-div">
                {showMsg ? <Banner
                    aria-label="message critical info"
                    id="banner"
                    title="Success"
                    hideTitle
                    description={showMsg}
                /> : undefined}
                <div className="header">
                    <div className="header-name">
                        <Avatar size={30} src="/avatar.png" alt="user avatar" />
                        <Link id="repoName" to={`/repo/${repoId}`}><div style={{ fontSize: "18px", marginRight: "5px" }} >{repository.name}</div></Link>
                        <Token text={repository.visibility === true ? "Public" : "Private"} style={{ color: "#D1D7E0", borderColor: "#D1D7E0", opacity: "0.7" }} />
                    </div>
                    {currentUser === ownerId ?
                        <div style={{ display: "flex", alignItems: "center", width: "60%" }}>
                            <div style={{ width: "100px" }}>Quick Setup -</div>
                            <div className="setup-link">
                                <TextInput ref={inputRef} value={`http://localhost:8080/repo/${repoId}`} className="input" readOnly />
                                <div className="copy-wrapper">
                                    <CopyIcon onClick={copyToClipboard} className="copy-icon" size={18} />
                                </div>
                            </div>
                        </div>
                        : null}

                </div>
                {tab === "" ?
                    <div className="body-div">
                        <div className="body-left">
                            <div className="owner-details">
                                <Avatar size={23} src="/avatar.png" alt="user avatar" />
                                {username}
                            </div>
                            <div className="repo-tree">
                                <TreeView aria-label="Files" >
                                    {Array.isArray(treeData) && renderTree(treeData)}
                                </TreeView>
                            </div>
                        </div>
                        <div className="body-right">
                            <div className="upper-nav">
                                <div style={{ fontWeight: "500" }}>About</div>
                                <div onClick={() => { setOpenDescriptionUpdateForm(true) }} style={{ cursor: "pointer" }} ><GearIcon size={20} /></div>
                            </div>
                            <div className="repo-info">
                                <div className="repo-description" style={{ fontSize: "18px", marginBottom: "5px" }} >{repoDescription}</div>
                                <div><LinkIcon size={16} /><Link id="website-link" style={{ color: "#478BE6", marginLeft: "10px" }}>{webLink}</Link></div>
                                <div className="readme-icon-div"><BookIcon size={16} /><Link to={`/repo/${repoId}/#readme`} id="readme-icon" style={{ color: "#9198A1", marginLeft: "10px" }}>Readme</Link></div>
                                <div className="readme-icon-div"><StarIcon size={16} /><span style={{ color: "#9198A1", marginLeft: "6px", }}> <span style={{marginRight:"3px"}}>{repoStarsCount}</span>stars</span></div>
                            </div>
                        </div>
                    </div>
                    : null}

                {tab === "issues" ?
                    <div className="issues-div">
                        {allIssues.length !== 0 ?
                            allIssues.map((issue, idx) => (
                                <div key={idx} className="issue">
                                    <Link to={`/issue/${issue._id}`} className="issue-name-link" ><div>{issue.title}</div></Link>
                                    <div id="issue-description">description- {issue.description}</div>
                                    <div id="issue-status">Status - {issue.status}</div>
                                </div>
                            ))
                            : null}
                    </div>
                    : null}



                {tab === "settings" && currentUser === ownerId ?
                    <div className="settings-outer-div">
                        <div style={{ fontSize: "24px", marginBottom: "20px" }}>General-</div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                            <div style={{ fontSize: "18px", marginRight: "100px" }}>Repository Name - </div>
                            <Link className="search-repo-link" to={`/repo/${repoId}`} ><div style={{ color: "#478be6", fontSize: "20px", marginRight: "5px" }}>{repository.name} </div></Link>
                            <Token text={repository.visibility ? "Public" : "Private"} style={{ color: "#9198A1" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "50px" }}>
                            <div style={{ fontSize: "18px", marginRight: "60px" }}>Repository Description- </div>
                            <div style={{ fontSize: "20px" }}>{repoDescription}</div>
                        </div>
                        <div style={{ fontSize: "24px", marginBottom: "20px" }}>Danger Zone</div>
                        <div className="danger-zone">
                            <div className="change-visibility-div">
                                <div className="left">
                                    <div style={{ marginBottom: "5px" }}>Change repository visibility</div>
                                    <div>This repository is currently <span style={{ color: "#478be6" }}>{repoVisibility ? "Public" : "Private"}.</span></div>
                                </div>
                                <div className="right">
                                    <Button onClick={() => { setChangeVisibilityOpen(true) }} className="danger-zone-btn">Change visibility</Button>
                                </div>
                            </div>
                            <div className="change-description-div">
                                <div className="left">
                                    <div style={{ marginBottom: "5px" }}>Change repository description</div>
                                    <div>Change repository description and add website link.</div>
                                </div>
                                <div className="right">
                                    <Button onClick={() => { setOpenDescriptionUpdateForm(true) }} className="danger-zone-btn">Change Description</Button>
                                </div>
                            </div>
                            <div className="delete-repo-div">
                                <div className="left">
                                    <div style={{ marginBottom: "5px" }}>Delete this repository</div>
                                    <div>Once you delete a repository, there is no going back. Please be certain.</div>
                                </div>
                                <div className="right">
                                    <Button onClick={() => { setOpenDeleteRepoForm(true) }} className="danger-zone-btn">Delete Repository</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    : null}



                {changeVisibilityOpen === true ?
                    <div className="changevisibilityForm-div">
                        <div className="visibility-text-div" onClick={changeVisibility} >Change to {repoVisibility ? "Private" : "Public"}</div>
                        <div id="cross-icon" onClick={() => { setChangeVisibilityOpen(false) }} ><XIcon size={18} /></div>
                    </div>
                    : null}


                {openDeleteRepoForm === true ?
                    <div className="delete-repo-panel">
                        <div className="upper-div">
                            <div id="delete-div-top">Delete <span style={{ color: "#478be6" }}>{repository.name}</span> </div>
                            <div onClick={() => { setOpenDeleteRepoForm(false) }} style={{ cursor: "pointer" }} ><XIcon size={20} /></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", width: "100%", gap: "10px" }}>
                                <div className="icon"><RepoLockedIcon size={34} /></div>
                                <div style={{ fontSize: "24px", color: "#478be6" }}>{repository.name}</div>
                            </div>
                            <div className="delete-panel-footer">
                                <Button id="delete-btn" onClick={deleteRepo} >I want to delete this repository</Button>
                            </div>
                        </div>
                    </div>
                    : null}



                {openDescriptionUpdateForm === true ?
                    <div className="description-update-form">
                        <div className="form-header">
                            Edit repository details
                        </div>
                        <div className="form-body">
                            <FormControl.Label>Description</FormControl.Label>
                            <TextInput value={repoDescription} onChange={(e) => { setRepoDescription(e.target.value) }} className="input" />
                            <FormControl.Label>Website</FormControl.Label>
                            <TextInput className="input" value={webLink} onChange={(e) => { setWebLink(e.target.value) }} />
                        </div>
                        <div className="form-footer">
                            <Button onClick={() => { setOpenDescriptionUpdateForm(false), setWebLink("") }} className="cancel-btn" style={{ border: "1px solid #9198A1" }}>Cancel</Button>
                            <Button onClick={handleDescriptionUpdate} className="green-btn" style={{ backgroundColor: "#347D39", border: "none" }}>{loading ? "Loading..." : "Save changes"}</Button>
                        </div>
                    </div>
                    : ""}

            </div>
        </>
    );
}


export default ShowRepo;