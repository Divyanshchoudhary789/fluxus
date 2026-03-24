import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserRepos.css";

import Navbar from "../../Navbar/Navbar.jsx";
import { Link } from "react-router-dom";
import { Button } from '@primer/react'
import { Avatar } from '@primer/react'
import { RepoIcon } from '@primer/octicons-react';
import { Token } from '@primer/react'
import { StarIcon } from '@primer/octicons-react'

function UserRepos() {
    const [repositories, setRepositories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);


    useEffect(() => {
        const userId = localStorage.getItem("userId");

        const fetchRepositories = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/repo/user/${userId}`);
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
            <Navbar />
            <div className="outer-wrapper-div">
                <div style={{ fontSize: "24px", marginLeft: "310px", marginBottom: "20px" }}>My contributions</div>
                <div className="user-repos-container">
                    <div className="user-repo-div">
                        <div className="upper-search-repo">
                            <div className="repo-search">
                                <input placeholder="Find a repository..." id="search" name="search" type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
                            </div>
                            <div >
                                <Link to={"/new"} style={{ textDecoration: "none" }}>
                                    <Button id="new-button" size="small" leadingVisual={<RepoIcon size={16} />} style={{ backgroundColor: "#347D39", color: "white", border: "none" }}>New repository</Button>
                                </Link>
                            </div>
                        </div>

                        <div className="searched-results-wrapper">
                            {searchResults.map((repo) => (
                                <div key={repo._id} id="searched-repo">
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Avatar size={20} src="avatar.png" alt="user avatar" />
                                            <Link className="repo-link" to={`/repo/${repo._id}`} ><p style={{ fontSize: "16px", margin: "2px 0px" }}>{repo.name}</p></Link>
                                            <Token text={repo.visibility ? "Public" : "Private"} style={{ color: "#9198A1" }} />
                                        </div>
                                        <div>
                                            <Button leadingVisual={StarIcon} style={{ border: "1px solid #3d444d", height: "27px", color: "#C9D1D9", width: "80px", backgroundColor: "#3D4550" }}>Star</Button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "14px", margin: "8px 0px 2px" }}>{repo.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserRepos;