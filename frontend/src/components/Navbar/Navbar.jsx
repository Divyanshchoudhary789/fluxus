import React, { useEffect, useState } from "react";
import axios from "axios";

import "./Navbar.css";
import { useAuth } from "../../authContext";

import { Link, useNavigate } from "react-router-dom";
import { ActionList, ActionMenu } from '@primer/react'
import { PlusIcon } from '@primer/octicons-react'
import { ThreeBarsIcon } from '@primer/octicons-react';
import { SearchIcon } from '@primer/octicons-react';
import { TextInput } from '@primer/react'
import { RepoIcon } from '@primer/octicons-react'
import { IssueOpenedIcon } from '@primer/octicons-react';
import { RepoPushIcon } from '@primer/octicons-react'
import { Button } from '@primer/react'
import { GitPullRequestIcon } from '@primer/octicons-react'
import { InboxIcon } from '@primer/octicons-react'
import { Avatar } from '@primer/react'
import { PersonIcon } from '@primer/octicons-react'
import { StarIcon } from '@primer/octicons-react'
import { OrganizationIcon } from '@primer/octicons-react'
import { CodeSquareIcon } from '@primer/octicons-react'
import { GlobeIcon } from '@primer/octicons-react'
import { HeartIcon } from '@primer/octicons-react'
import { GearIcon } from '@primer/octicons-react'
import { PaintbrushIcon } from '@primer/octicons-react'
import { AccessibilityIcon } from '@primer/octicons-react'
import { SignOutIcon } from '@primer/octicons-react'
import { XIcon } from '@primer/octicons-react'
import Sidebar from "../Sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import { Token } from '@primer/react';



function Navbar({ profileNavStyle }) {

    const userId = localStorage.getItem("userId");

    const [searchQuery, setSearchQuery] = useState("");
    const [allRepositories, setAllRepositories] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    const [openSearchTab, setOpenSearchTab] = useState(false);
    const [username, setUsername] = useState("");
    const [openSidebar, setOpenSidebar] = useState(false);
    const [pageName, setPageName] = useState("");


    const location = useLocation();

    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();

    useEffect(() => {
        const fetchAllRepositories = async () => {
            try {
                const res = await axios.get("http://localhost:8080/repo/all");
                setAllRepositories(res.data);
            } catch (err) {
                console.error("Error while fetching all repositories: ", err);
            }
        }
        fetchAllRepositories();
    }, []);


    useEffect(() => {
        if (searchQuery === "") {
            return
        } else {
            const filteredRepo = allRepositories.filter((repo) => {
                return repo.name.toLowerCase().includes(searchQuery.toLowerCase());
            });
            setSearchResults(filteredRepo);
        }
    }, [searchQuery]);


    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const userInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/userProfile/${userId}`);
                setUsername(res.data.username);
            } catch (err) {
                console.error("Error during fetching user details: ", err);
            }
        }

        userInfo();
    }, []);

    const handleSignout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setCurrentUser(null);

        navigate("/auth");
    }

    const handleSidebar = () => {
        setOpenSidebar(!openSidebar);
    }

    useEffect(() => {
        if (location.pathname == "/") {
            setPageName("Dashboard");
        } else if (location.pathname == "/repos") {
            setPageName("Repositories");
        } else if (location.pathname == "/profile") {
            setPageName(username);
        } else if (location.pathname == "/new") {
            setPageName("New Repository");
        } else if (location.pathname == "/issues") {
            setPageName("Issues");
        } else if (location.pathname == "/settings") {
            setPageName("Settings");
        }
    }, [location.pathname, username]);

    return (
        <nav id="navbar" style={profileNavStyle} >
            <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
            <div className="left-nav">
                <div className="open-menu" onClick={() => { handleSidebar() }}>
                    <ThreeBarsIcon size={16} />
                </div>
                <Link to={"/"} style={{ textDecoration: "none", color: "#C9D1D9" }}>
                    <div className="logo-div">
                        <img src="/Fluxus_logo.png" alt="logo" className="logo" />
                        <div style={{ fontSize: "14px", color: "#D1D7E0", fontWeight: "500" }}>{pageName}</div>
                    </div>
                </Link>
            </div>
            <div id="nav-searchbar-div" className={openSearchTab ? "open" : ""}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div id="nav-big-input">
                        <TextInput style={{ width: "65rem" }} leadingVisual={SearchIcon} placeholder="Type to search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
                    </div>
                    <div className="cross-icon-div" onClick={() => { setOpenSearchTab(!openSearchTab) }}>
                        <XIcon size={32} />
                    </div>
                </div>
                <div className="search-results-div">
                    {searchResults.map((repo) => (
                        <div key={repo._id}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                <Avatar size={20} src="avatar.png" alt="user avatar" />
                                <Link className="search-repo-link" to={`/repo/${repo._id}`} ><p style={{ fontSize: "20px", margin: "2px 0px" }}>{repo.name}</p></Link>
                                <Token text={repo.visibility ? "Public" : "Private"} style={{ color: "#9198A1" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="right-nav">
                <div className="nav-search-box">
                    <TextInput style={{ cursor: "pointer" }} leadingVisual={SearchIcon} placeholder="Type to search" onClick={() => { setOpenSearchTab(!openSearchTab) }} />
                </div>
                <div id="options" >
                    <ActionMenu>
                        <ActionMenu.Button style={{ border: "1px solid #3d444d" }}><PlusIcon size={18} /></ActionMenu.Button>
                        <ActionMenu.Overlay style={{ backgroundColor: "#2d343f" }}>
                            <ActionList >
                                <ActionList.Item
                                    onSelect={() => {
                                        navigate("/new")
                                    }}
                                >
                                    <RepoIcon size={16} /> New Repository
                                </ActionList.Item>
                                <ActionList.Item

                                    onSelect={() => {
                                        navigate("/issues")
                                    }}
                                >
                                    <IssueOpenedIcon size={16} /> New Issue

                                </ActionList.Item>
                                <ActionList.Item
                                    onSelect={() => {
                                        alert('Item three clicked')
                                    }}
                                >
                                    <RepoPushIcon size={16} /> Import Repository
                                </ActionList.Item>
                            </ActionList>
                        </ActionMenu.Overlay>
                    </ActionMenu>

                    <div id="issue-icon" className="icon">
                        <Button leadingVisual={IssueOpenedIcon} onClick={() => { navigate(`/profile/${userId}?tab=repositories`) }} style={{ border: "1px solid #3d444d" }}></Button>
                    </div>
                    <div id="pr-icon" className="icon">
                        <Button leadingVisual={GitPullRequestIcon} style={{ border: "1px solid #3d444d" }}></Button>
                    </div>
                    <div id="repo-icon" className="icon">
                        <Button leadingVisual={RepoIcon} onClick={() => { navigate("/repos") }} style={{ border: "1px solid #3d444d" }}></Button>
                    </div>
                    <div id="inbox-icon" className="icon">
                        <Button leadingVisual={InboxIcon} style={{ border: "1px solid #3d444d" }}></Button>
                    </div>
                    <div id="profile-icon">
                        <ActionMenu>
                            <ActionMenu.Button style={{ border: "none" }}><Avatar size={32} src="/avatar.png" alt="user avatar" /></ActionMenu.Button>
                            <ActionMenu.Overlay style={{ backgroundColor: "#2d343f", width: "235px" }}>
                                <ActionList >
                                    <div className="user-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Avatar size={32} src="/avatar.png" alt="user avatar" />
                                        <div>{username}</div>
                                    </div>
                                    <div className="profile-body">
                                        <ActionList.Item
                                            onSelect={() => {
                                                navigate(`/profile/${userId}`);
                                            }}
                                        >
                                            <PersonIcon size={16} /> Profile
                                        </ActionList.Item>
                                        <ActionList.Item
                                            onSelect={() => {
                                                navigate(`/profile/${userId}?tab=repositories`);
                                            }}
                                        >
                                            <RepoIcon size={16} /> Repositories
                                        </ActionList.Item>
                                        <ActionList.Item
                                            onSelect={() => {
                                                navigate(`/profile/${userId}?tab=stars`)
                                            }}
                                        >
                                            <StarIcon size={16} /> Stars
                                        </ActionList.Item>
                                        <ActionList.Item
                                            onSelect={() => {
                                                alert('Item three clicked')
                                            }}
                                        >
                                            <CodeSquareIcon size={16} /> Gists
                                        </ActionList.Item>
                                        <ActionList.Item
                                            onSelect={() => {
                                                alert('Item three clicked')
                                            }}
                                        >
                                            <OrganizationIcon size={16} /> Organization
                                        </ActionList.Item>
                                        <ActionList.Item
                                            onSelect={() => {
                                                alert('Item three clicked')
                                            }}
                                        >
                                            <GlobeIcon size={16} /> Enterprises
                                        </ActionList.Item>
                                        <ActionList.Item
                                            onSelect={() => {
                                                alert('Item three clicked')
                                            }}
                                        >
                                            <HeartIcon size={16} /> Sponsors
                                        </ActionList.Item>
                                    </div>

                                    <div className="profile-footer">
                                        <ActionList.Item
                                            onSelect={() => {
                                                navigate("/settings");
                                            }}
                                        >
                                            <GearIcon size={16} /> Settings
                                        </ActionList.Item>
                                        <ActionList.Item
                                            onSelect={() => {
                                                alert('Item two clicked')
                                            }}
                                        >
                                            <PaintbrushIcon size={16} /> Appearance
                                        </ActionList.Item>
                                        <ActionList.Item
                                            onSelect={() => {
                                                alert('Item three clicked')
                                            }}
                                        >
                                            <AccessibilityIcon size={16} /> Accessibility
                                        </ActionList.Item>
                                    </div>
                                    <div className="signout">
                                        <ActionList.Item
                                            onClick={handleSignout}
                                        >
                                            <SignOutIcon size={16} /> Sign out
                                        </ActionList.Item>
                                    </div>
                                </ActionList>
                            </ActionMenu.Overlay>
                        </ActionMenu>
                    </div>
                </div>

            </div>

        </nav>
    );
}

export default Navbar;