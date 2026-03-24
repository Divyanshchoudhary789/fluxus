import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import Navbar from "../Navbar/Navbar.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";


import { useParams } from "react-router-dom";

import { UnderlineNav } from '@primer/react'
import { BookIcon } from '@primer/octicons-react'
import { RepoIcon } from '@primer/octicons-react'
import { TableIcon } from '@primer/octicons-react'
import { StarIcon } from '@primer/octicons-react'
import { Avatar } from '@primer/react'
import { Button } from '@primer/react'
import { MailIcon } from '@primer/octicons-react'
import { Token } from '@primer/react'
import Footer from "../Footer/Footer.jsx";
import { TextInput } from '@primer/react'
import { Banner } from '@primer/react'
import { XIcon } from '@primer/octicons-react';
import { PersonIcon } from '@primer/octicons-react'
import { PeopleIcon } from '@primer/octicons-react'
import { DotFillIcon } from '@primer/octicons-react'



import Heatmap from "../Heatmap/Heatmap.jsx";






function Profile() {
    const { userId } = useParams();

    const [userInfo, setUserInfo] = useState({});
    const [repositories, setRepositories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [tab, setTab] = useState("");
    const [showEditForm, setShowEditForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [updatedEmail, setUpdatedEmail] = useState("");
    const [updatedPassword, setUpdatedPassword] = useState("");
    const [resultMsg, setResultMsg] = useState("");
    const [openDeleteAccountForm, setOpenDeleteAccountForm] = useState(false);
    const [starredRepos, setStarredRepos] = useState([]);
    const [following, setFollowing] = useState(0);
    const [followingUsers, setFollowingUsers] = useState([]);
    const [followers, setFollowers] = useState([]);

    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/userProfile/${userId}`);
                //console.log(res);
                setUserInfo(res.data);
                setStarredRepos(res.data.starredRepos);
                setFollowing(res.data.followedUsers.length);
                setFollowingUsers(res.data.followingUsers);

            } catch (err) {
                console.error("Error during fetching user details: ", err);
            }
        }

        const fetchRepositories = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/repo/user/${userId}`);
                if (res) {
                    setRepositories(res.data.repositories);
                }
            } catch (err) {
                console.error("Error while fetching user Repositories", err);
            }
        };


        userInfo();
        fetchRepositories();
    }, [userId]);

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

    useEffect(() => {
        const tabParam = params.get("tab");
        if (tabParam) {
            setTab(tabParam);
        } else {
            setTab("");
        }
    }, [params]);

    const handleProfileUpdate = async () => {
        setLoading(true);

        try {
            if (updatedEmail === "" && updatedPassword === "") {
                setResultMsg("Enter Details to Update");
                setTimeout(() => {
                    setResultMsg("");
                }, 1000);
                setLoading(false);
                return
            }
            const userId = localStorage.getItem("userId");
            const res = await axios.put(`http://localhost:8080/updateProfile/${userId}`, {
                email: updatedEmail,
                password: updatedPassword,
            });
            //console.log(res);
            setLoading(false);
            setShowEditForm(false);
            setUpdatedEmail("");
            setUpdatedPassword("");
            setResultMsg(res.data.message);
            setUserInfo(res.data.result);
            setTimeout(() => {
                setResultMsg("");
            }, 1000);
        } catch (err) {
            console.error("Error in updating user Profile: ", err);
            setLoading(false);
        }


    }

    const deleteAccount = async () => {
        try {
            const userId = localStorage.getItem("userId");
            const result = await axios.delete(`http://localhost:8080/deleteProfile/${userId}`);
            if (result) {
                //console.log(result);
                setResultMsg(result.data.message);
                setOpenDeleteAccountForm(false);
                setShowEditForm(false);
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                navigate("/auth");
                setTimeout(() => {
                    setResultMsg("");
                }, 2000);
            }
        } catch (err) {
            console.error("Error in deleting user Account:", err);
            setResultMsg("User Account Deletion Failed!, try Again!");
            setTimeout(() => {
                setResultMsg("");
            }, 2000);
        }
    }


    useEffect(() => {
        const getFollowers = async () => {
            try {
                const result = await axios.get(`http://localhost:8080/user/followers/${userId}`);
                //console.log(result);
                setFollowers(result.data);
            } catch (err) {
                console.error("Error in getting followers count:", err.message);
            }
        }

        getFollowers();
    }, [userId]);




    const followUser = async (anotherUserId) => {
        const userId = localStorage.getItem("userId");

        try {
            const result = await axios.patch(`http://localhost:8080/followUser/${userId}`, {
                repoOwnerId: anotherUserId,
            });

            setResultMsg(result.data.message);
            setTimeout(() => {
                setResultMsg("");
            }, 2000);

        } catch (err) {
            console.error("Error in Following a User:", err.message);
            setResultMsg("Following the user, Failed! try Again");
            setTimeout(() => {
                setResultMsg("");
            }, 2000);
        }
    }


    return (
        <>
            <Navbar profileNavStyle={{ borderBottom: "none" }} />
            <div className="upper-navlist">
                <UnderlineNav aria-label="Repository with leading icons">
                    <UnderlineNav.Item icon={BookIcon} aria-current={tab === "" ? "page" : undefined} onClick={() => { navigate(`/profile/${userId}`) }} >
                        Overview
                    </UnderlineNav.Item>
                    <UnderlineNav.Item icon={RepoIcon} counter={<span className="repo-counter">{repositories.length}</span>} aria-current={tab === "repositories" ? "page" : undefined} onClick={() => { navigate(`/profile/${userId}?tab=repositories`) }} >Repositories</UnderlineNav.Item>
                    <UnderlineNav.Item icon={TableIcon} aria-current={tab === "projects" ? "page" : undefined} onClick={() => { navigate(`/profile/${userId}?tab=projects`) }}>Projects</UnderlineNav.Item>
                    <UnderlineNav.Item icon={StarIcon} counter={<span className="repo-counter">{starredRepos.length}</span>} aria-current={tab === "stars" ? "page" : undefined} onClick={() => { navigate(`/profile/${userId}?tab=stars`) }}>Stars</UnderlineNav.Item>
                </UnderlineNav>
            </div>
            {resultMsg ? <Banner
                aria-label="message critical info"
                id="msg-banner"
                title="Success"
                hideTitle
                description={resultMsg}
            /> : undefined}

            <div className="outer-wrapper">

                <div className="user-info-div">
                    <div className="user-avatar">
                        <Avatar size={300} src="/avatar.png" alt="Mona user avatar" />
                    </div>
                    <div className="user-details-div">
                        <div style={{ fontSize: "24px", margin: "8px 0px" }}>{userInfo.username}</div>
                        <div style={{ fontSize: "20px", color: "#9198A1" }}>{userInfo.email}</div>


                        {userId === localStorage.getItem("userId") ?
                            (showEditForm === false ? (
                                <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
                                    <Button variant="default" onClick={() => { setShowEditForm(true) }} className="edit-profile-btn">Edit profile</Button>
                                </div>)

                                : (<>
                                    <label style={{ marginTop: "20px" }}>Email</label>
                                    <TextInput type="email" style={{ border: "1px solid #9198A1", borderRadius: "5px", height: "25px" }} placeholder="Enter New Email" value={updatedEmail} onChange={(e) => { setUpdatedEmail(e.target.value) }} />
                                    <label style={{ marginTop: "10px" }}>Password</label>
                                    <TextInput style={{ border: "1px solid #9198A1", marginBottom: "20px", borderRadius: "5px", height: "25px" }} placeholder="Enter New Password" value={updatedPassword} onChange={(e) => { setUpdatedPassword(e.target.value) }} />
                                    <div className="update-profile-btns">
                                        <div className="left-btns">
                                            <Button size="small" onClick={handleProfileUpdate} style={{ backgroundColor: "#347D39", border: "none" }}>{loading ? "Loading..." : "Save"}</Button>
                                            <Button size="small" onClick={() => { setShowEditForm(false); setOpenDeleteAccountForm(false) }} >Cancel</Button>
                                        </div>
                                        <div className="right-btns">
                                            <Button onClick={() => { setOpenDeleteAccountForm(true) }} size="small" >Delete Account</Button>
                                        </div>
                                    </div>
                                </>)

                            ) : null}


                        {userId !== localStorage.getItem("userId") ? <Button className="follow-btn" onClick={async () => { await followUser(userId) }} >Follow</Button> : null}
                        <div className="email"><MailIcon size={16} style={{ color: "#9198A1" }} /> {userInfo.email}</div>
                    </div>
                    <div className="connect-people">
                        <div className="count"><PeopleIcon size={24} /> <span className="followers-count" onClick={() => { navigate(`/profile/${userId}?tab=followers`) }} >{followers.length} followers</span>  <DotFillIcon size={16} /><span onClick={() => { navigate(`/profile/${userId}?tab=following`) }} className="following-count">{following} following</span></div>
                    </div>
                </div>

                {openDeleteAccountForm === true ?
                    <div className="delete-account-panel">
                        <div className="upper-div">
                            <div id="delete-div-top">Delete Account- <span style={{ color: "#478be6" }}>{userInfo.username}</span> </div>
                            <div onClick={() => { setOpenDeleteAccountForm(false) }} style={{ cursor: "pointer" }} ><XIcon size={20} /></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", width: "100%", gap: "10px" }}>
                                <div className="icon"><PersonIcon size={34} /></div>
                                <div style={{ fontSize: "20px" }} >Username: <span style={{ fontSize: "24px", color: "#478be6" }}>{userInfo.username}</span> </div>
                            </div>
                            <div style={{ fontSize: "14px" }}>Once you deleted your Account, there is no going back. Please be certain.</div>
                            <div className="delete-panel-footer">
                                <Button id="delete-btn" onClick={deleteAccount} >I want to delete this Account</Button>
                            </div>
                        </div>
                    </div>
                    : null}





                {tab === "" ?
                    <div className="overview-div">
                        <div className="user-repo-div">
                            <div style={{ fontSize: "20px" }}>Popular repositories</div>
                            <div className="user-repo-wrapper">
                                {repositories.map((repo) => (
                                    <div className="user-repo" key={repo._id} >
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <Link to={`/repo/${repo._id}`} className="repo-name-link" ><div>{repo.name}</div></Link>
                                            <Token text={repo.visibility ? "Public" : "Private"} style={{ color: "#9198A1" }} />
                                        </div>
                                        <div style={{ marginTop: "8px" }}>{repo.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="heatmap">
                            <div style={{ fontSize: "20px" }}>Recent Contributions-</div>
                            <Heatmap userId={userId} />
                        </div>
                    </div>
                    : null}

                {tab === "repositories" ?
                    <div className="user-repo-div">
                        <div className="upper-search-repo">
                            <div className="repo-search">
                                <input placeholder="Find a repository..." id="search" name="search" type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
                            </div>
                            <div >
                                <Link to={"/new"} style={{ textDecoration: "none" }}>
                                    <Button id="new-button" size="small" leadingVisual={<RepoIcon size={16} />} style={{ backgroundColor: "#347D39", color: "white", border: "none" }}>New</Button>
                                </Link>
                            </div>
                        </div>

                        <div className="searched-results-wrapper">
                            {searchResults.map((repo) => (
                                <div key={repo._id} id="searched-repo">
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Avatar size={20} src="/avatar.png" alt="user avatar" />
                                            <Link to={`/repo/${repo._id}`} className="repo-name-link" ><p style={{ fontSize: "16px", margin: "2px 0px" }}>{repo.name}</p></Link>
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
                    : null}



                {tab === "stars" ?
                    <div className="stars-div">
                        <div className="user-repo-div" style={{ height: "100%" }}>
                            <div style={{ fontSize: "20px" }}>Starred repositories</div>
                            <div className="user-repo-wrapper" >
                                {starredRepos.map((repo) => (
                                    <div className="user-repo" key={repo._id} >
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <Link to={`/repo/${repo._id}`} className="repo-name-link" ><div>{repo.name}</div></Link>
                                            <Token text={repo.visibility ? "Public" : "Private"} style={{ color: "#9198A1" }} />
                                        </div>
                                        <div style={{ marginTop: "8px" }}>{repo.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    : null}


                {tab === "following" ?
                    <div className="following-div">
                        <div className="user-div" style={{ height: "100%" }}>
                            <div style={{ fontSize: "20px" }}>Following</div>
                            <div className="following-users-list" >
                                {followingUsers.map((user) => (
                                    <div className="user" key={user._id} >
                                        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                                            <Avatar size={30} src="/avatar.png" alt="user avatar" />
                                            <div onClick={() => { navigate(`/profile/${user._id}`) }} className="following-user-username">{user.username}</div>
                                        </div>
                                        <div>Email- {user.email}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    : null}



                {tab === "followers" ?
                    <div className="following-div">
                        <div className="user-div" style={{ height: "100%" }}>
                            <div style={{ fontSize: "20px" }}>Followers</div>
                            <div className="following-users-list" >
                                {followers.map((user) => (
                                    <div className="user" key={user._id} >
                                        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                                            <Avatar size={30} src="/avatar.png" alt="user avatar" />
                                            <div onClick={() => { navigate(`/profile/${user._id}`) }} className="following-user-username">{user.username}</div>
                                        </div>
                                        <div>Email- {user.email}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    : null}

            </div>
            <Footer />
        </>
    );
}


export default Profile;