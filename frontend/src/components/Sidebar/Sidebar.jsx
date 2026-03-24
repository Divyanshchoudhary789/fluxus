import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";

import { XIcon } from '@primer/octicons-react'
import { TreeView } from '@primer/react'
import { Link, useLocation } from "react-router-dom";
import { HomeIcon } from '@primer/octicons-react'
import { IssueOpenedIcon } from '@primer/octicons-react'
import { RepoIcon } from '@primer/octicons-react'
import { Button } from '@primer/react'
import { Avatar } from '@primer/react'
import "./Sidebar.css";
import { server_url } from "../../environment.js";



function Sidebar({ openSidebar, setOpenSidebar }) {
    const [repositories, setRepositories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const location = useLocation();

    useEffect(() => {
        const userId = localStorage.getItem("userId");

        const fetchRepositories = async () => {
            try {
                const res = await axios.get(`${server_url}/repo/user/${userId}`);
                setRepositories(res.data.repositories);
            } catch (err) {
                console.error("Error while fetching user Repositories", err);
            }
        };

        fetchRepositories();
    }, []);


    useEffect(() => {
        if (searchQuery == "") {
            setSearchResults(repositories);
        }
        else {
            const filteredRepositories = repositories.filter((repo) => {
                return repo.name.toLowerCase().includes(searchQuery.toLowerCase());
            });

            setSearchResults(filteredRepositories);
        }
    }, [searchQuery, repositories]);


    return (
        <>
            <div id="sidebar" className={openSidebar ? "open" : ""}>
                <div className="upper-sidebar">
                    <div className="logo">
                        <img src="/Fluxus_logo.png" alt="Fluxus-logo" />
                    </div>
                    <div className="cross-icon-div" onClick={() => { setOpenSidebar(!openSidebar) }}>
                        <XIcon size={16} />
                    </div>
                </div>
                <div className="body-sidebar">
                    <TreeView aria-label="Sidebar">
                        <TreeView.Item id="home" className={location.pathname === "/" ? "active-item" : ""}>
                            <Link to={"/"} style={{ textDecoration: "none", color: "#C9D1D9" }}>
                                <HomeIcon size={16} style={{ marginRight: "5px", opacity: "0.8" }} /> Home
                            </Link>
                        </TreeView.Item>

                        <TreeView.Item id="issues" className={location.pathname === "/issues" ? "active-item" : ""}>
                            <Link to={"/issues"} style={{ textDecoration: "none", color: "#C9D1D9" }}>
                                <IssueOpenedIcon size={16} style={{ marginRight: "5px", opacity: "0.8" }} />Issues
                            </Link>
                        </TreeView.Item>

                        <TreeView.Item id="repos" className={location.pathname === "/repos" ? "active-item" : ""}>
                            <Link to={"/repos"} style={{ textDecoration: "none", color: "#C9D1D9" }}>
                                <RepoIcon size={16} style={{ marginRight: "5px", opacity: "0.8" }} />Repository
                            </Link>
                        </TreeView.Item>
                    </TreeView>
                </div>
                <div className="lower-sidebar">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h5>Top Repositories</h5>
                        <Link to={"/new"} style={{ textDecoration: "none" }}>
                            <Button id="new-button" size="small" leadingVisual={<RepoIcon size={16} />} style={{ backgroundColor: "#347D39", color: "white", border: "none" }}>New</Button>
                        </Link>
                    </div>
                    <div id="sidebar-search">
                        <input placeholder="Find a repository..." id="search" name="search" type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
                    </div>
                    {searchResults.map((repo) => (
                        <div key={repo._id} id="searched-repo-sidebar">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Avatar size={20} src="/avatar.png" alt="user avatar" />
                                <Link id="repoName" to={`/repo/${repo._id}`} style={{ color: "#D1D7E0", borderColor: "#D1D7E0", opacity: "0.7" }} ><p style={{ fontSize: "16px", margin: "2px 0px" }}>{repo.name}</p></Link>
                            </div>
                            <p style={{ fontSize: "14px", margin: "8px 0px 2px" }}>{repo.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Sidebar;