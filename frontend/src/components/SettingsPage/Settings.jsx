import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Settings.css";


import Navbar from "../Navbar/Navbar.jsx";
import { Link, useNavigate } from "react-router-dom";

import { MailIcon } from '@primer/octicons-react'
import { Avatar } from '@primer/react'
import { Button } from '@primer/react'
import { TextInput } from '@primer/react'
import { Banner } from '@primer/react'
import Footer from "../Footer/Footer.jsx";
import { XIcon } from '@primer/octicons-react';
import { PersonIcon } from '@primer/octicons-react'



function Settings() {
    const [userInfo, setUserInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [updatedEmail, setUpdatedEmail] = useState("");
    const [updatedPassword, setUpdatedPassword] = useState("");
    const [resultMsg, setResultMsg] = useState("");
    const [openDeleteAccountForm, setOpenDeleteAccountForm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const userInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/userProfile/${userId}`);
                setUserInfo(res.data);
            } catch (err) {
                console.error("Error during fetching user details: ", err);
            }
        }

        userInfo();
    }, []);


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

    const handleProfileDeletion = async () => {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        try {
            const res = await axios.delete(`http://localhost:8080/deleteProfile/${userId}`);
            setLoading(false);
            setResultMsg(res.data.message);
            setTimeout(() => {
                setResultMsg("");
            }, 1000);
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            navigate("/signup");
        } catch (err) {
            console.error("Error in deleting user profile.", err);
            setLoading(false);
        }

    }


    return (
        <>
            <Navbar />
            <div className="outer-wrapper" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {resultMsg ? <Banner
                    aria-label="message critical info"
                    id="settings-msg-banner"
                    title="Success"
                    hideTitle
                    description={resultMsg}
                /> : undefined}

                <div className="header-div">
                    <div className="user-avatar">
                        <Avatar size={40} src="avatar.png" alt="Mona user avatar" />
                    </div>
                    <div>
                        <div className="username">
                            {userInfo.username}
                        </div>
                        <div style={{ fontSize: "13px", color: "#9198A1" }}>
                            Your personal account
                        </div>
                    </div>
                </div>

                <div className="heading">Public Profile</div>
                <div className="lower-form">
                    <div className="user-details">
                        <div style={{ fontSize: "24px", margin: "8px 0px" }}>Username - {userInfo.username}</div>
                        <div style={{ fontSize: "20px", color: "#9198A1" }}>Email - {userInfo.email}</div>
                        <label style={{ marginTop: "20px" }}>Email</label>
                        <TextInput type="email" style={{ border: "1px solid #9198A1", borderRadius: "10px", height: "35px" }} placeholder="Enter New Email" value={updatedEmail} onChange={(e) => { setUpdatedEmail(e.target.value) }} />
                        <label style={{ marginTop: "10px" }}>Password</label>
                        <TextInput style={{ border: "1px solid #9198A1", marginBottom: "20px", borderRadius: "5px", height: "35px" }} placeholder="Enter New Password" value={updatedPassword} onChange={(e) => { setUpdatedPassword(e.target.value) }} />
                        <div className="update-btn">
                            <Button onClick={handleProfileUpdate} style={{ backgroundColor: "#347D39", border: "none" }}>{loading ? "Loading..." : "Update Profile"}</Button>
                            <Button onClick={() => { setOpenDeleteAccountForm(true) }} style={{ backgroundColor: "#EA5C53", border: "none" }}>{loading ? "Loading..." : "Delete your Account"}</Button>

                        </div>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <div className="email"><MailIcon size={18} style={{ color: "#9198A1" }} /> {userInfo.email}</div>
                    </div>
                    <div className="user-avatar">
                        Profile picture
                        <Avatar size={250} src="avatar.png" alt="Mona user avatar" />
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
                                <Button id="delete-btn" onClick={handleProfileDeletion} >I want to delete this Account</Button>
                            </div>
                        </div>
                    </div>
                    : null}


            </div>
            <Footer />
        </>
    );
}

export default Settings;