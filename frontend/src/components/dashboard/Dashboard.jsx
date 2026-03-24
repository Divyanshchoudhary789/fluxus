import React, { useEffect, useState } from "react";
import axios from "axios";
import { GraphIcon, StarIcon } from '@primer/octicons-react';
import "./Dashboard.css";
import { server_url } from "../../environment.js";

import Navbar from "../Navbar/Navbar.jsx";
import { Button } from '@primer/react'
import { RepoIcon } from '@primer/octicons-react'
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from '@primer/react'
import Footer from "../Footer/Footer.jsx";
import { Banner } from '@primer/react'




function Dashboard() {
    const [repositories, setRepositories] = useState([]);
    const [suggestedRepositories, setSuggestedRepositories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showMsg, setShowMsg] = useState("");
    const [hoveredRepoId, setHoveredRepoId] = useState(null);

    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");


    useEffect(() => {

        const fetchRepositories = async () => {
            try {
                const res = await axios.get(`${server_url}/repo/user/${userId}`);
                setRepositories(res.data.repositories);
            } catch (err) {
                console.error("Error while fetching user Repositories", err);
            }
        };

        const fetchSuggestedRepositories = async () => {
            try {
                const res = await axios.get(`${server_url}/repo/all`);
                //console.log(res);
                setSuggestedRepositories(res.data);
            } catch (err) {
                console.error("Error while fetching all repositories: ", err);
            }
        }

        fetchRepositories();
        fetchSuggestedRepositories();

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


    const data = [
        {
            time: "5 hours ago",
            text: "Monitor Copilot coding agent logs live in Raycast",
        },
        {
            time: "6 hours ago",
            text: "A smoother navigation experience in GitHub Mobile for Android",
        },
        {
            time: "19 hours ago",
            text: "More visibility into Copilot coding agent sessions",
        },
        {
            time: "Yesterday",
            text: "GitHub Actions: Late March 2026 updates",
        },
    ];


    const starRepo = async (repoId) => {
        const userId = localStorage.getItem("userId");
        try {
            const res = await axios.patch(`${server_url}/starRepo/${userId}`, {
                repoId,
            });
            //console.log(res);
            setShowMsg(res.data.message);
            setTimeout(() => {
                setShowMsg("");
            }, 2000);

        } catch (err) {
            console.error("Error in starring a repo:", err.message);
            setShowMsg("Starring a Repo Failed, try Again!");
            setTimeout(() => {
                setShowMsg("");
            });
        }
    }

    const followUser = async (repoOwnerId) => {
        const userId = localStorage.getItem("userId");

        try {
            const result = await axios.patch(`${server_url}/followUser/${userId}`, {
                repoOwnerId,
            });

            setShowMsg(result.data.message);
            setTimeout(() => {
                setShowMsg("");
            }, 2000);

        } catch (err) {
            console.error("Error in Following a User:", err.message);
            setShowMsg("Following the user, Failed! try Again");
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        }
    }




    return (
        <>
            <Navbar />
            <section id="dashboard">
                {showMsg ? <Banner
                    aria-label="message critical info"
                    id="star-banner"
                    title="Success"
                    hideTitle
                    description={showMsg}
                /> : undefined}

                <aside id="user-repos">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontSize: "14px" }}>Top Repositories</h4>
                        <Link to={"/new"} style={{ textDecoration: "none" }}>
                            <Button id="new-button" size="small" leadingVisual={<RepoIcon size={16} />} style={{ backgroundColor: "#347D39", color: "white", border: "none" }}>New</Button>
                        </Link>
                    </div>
                    <div id="search">
                        <input placeholder="Find a repository..." id="search" name="search" type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
                    </div>
                    {searchResults.map((repo) => (
                        <div key={repo._id} id="searched-repo">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Avatar size={20} src="/avatar.png" alt="user avatar" />
                                <Link id="repo-name-link" to={`/repo/${repo._id}`} ><p style={{ fontSize: "20px", margin: "2px 0px" }}>{repo.name}</p></Link>
                            </div>
                            <p style={{ fontSize: "15px", margin: "8px 0px 2px" }}>{repo.description}</p>
                        </div>
                    ))}
                </aside>
                <main id="main-div">
                    <div className="feed-div">
                        <h3>Feed</h3>
                        <div id="suggested-repos-div">
                            <div >
                                <h5 style={{ display: "flex", gap: "15px", marginBottom: "50px" }}><GraphIcon size={16} />Suggested repositories </h5>
                            </div>
                            {suggestedRepositories.map((repo) => (

                                <div key={repo._id} id="trending-repo">

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", position: "relative" }}>

                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} onMouseEnter={() => setHoveredRepoId(repo._id)} onMouseLeave={() => setHoveredRepoId(null)}  >
                                            <Avatar id="user-profile-avatar" onClick={() => { navigate(`/profile/${repo.owner._id}`) }} size={25} src="/avatar2.png" alt="user avatar" />
                                            {hoveredRepoId === repo._id && (
                                                <div className="profile-avatar-popup" key={repo._id} >
                                                    <div className="popup-heading">
                                                        <Avatar size={20} src="/avatar.png" alt="user avatar" />
                                                        {userId !== repo.owner._id ? <Button onClick={async () => { followUser(repo.owner._id) }} size="small">Follow</Button> : null}
                                                    </div>
                                                    <div style={{ fontSize: "14px", zIndex: "100" }} >{repo.owner.username}</div>
                                                </div>
                                            )}

                                            <Link id="suggested-repo-link" to={`/repo/${repo._id}`} ><p style={{ fontSize: "20px", margin: "2px 0px" }}>{repo.name}</p></Link>
                                        </div>
                                        <div>
                                            <Button onClick={async () => { await starRepo(repo._id) }} leadingVisual={StarIcon} style={{ border: "1px solid #3d444d", height: "27px", color: "#C9D1D9", width: "80px", backgroundColor: "#3D4550" }}>Star</Button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "15px", margin: "8px 0px 2px" }}>{repo.description}</p>
                                </div>

                            ))}
                        </div>
                    </div>
                    <div id="changelog-card">
                        <div style={{ fontSize: "14px", margin: "15px 0px", color: "e6edf3" }}>Latest from our changelog</div>

                        <div className="timeline">
                            {data.map((item, index) => (
                                <div className="timeline-item" key={index}>
                                    <div className="dot"></div>

                                    <div className="content">
                                        <span className="time">{item.time}</span>
                                        <p>{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link className="footer" to={"https://www.linkedin.com/in/divyansh--choudhary/"} ><div >View changelog →</div></Link>
                    </div>

                </main>
            </section >
            <Footer />
        </>
    );

}


export default Dashboard;