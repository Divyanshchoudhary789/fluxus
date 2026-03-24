import React, { useState } from "react";
import axios from "axios";
import { Button } from '@primer/react'
import "./Auth.css";

import { server_url } from "../../environment.js";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext.jsx";
import { Banner } from '@primer/react'


function Signup() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showMsg, setShowMsg] = useState("");

    const { setCurrentUser } = useAuth();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await axios.post(`${server_url}/signup`, {
                username: username,
                email: email,
                password: password
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.userId);

            setCurrentUser(res.data.userId);
            setLoading(false);
            window.location.href = "/";

        } catch (err) {
            console.error(err);
            setShowMsg("Enter complete details, All Fields are Required to signup!");
            setLoading(false);
            setTimeout(() => {
                setShowMsg("");
            }, 3000);
        }
    }

    return (
        <div className="auth-wrapper-div">
            {showMsg ? <Banner
                aria-label="message critical info"
                id="signup-banner"
                title="Success"
                hideTitle
                description={showMsg}
            /> : undefined}
            <div className="auth-logo-container">
                <img src="/Fluxus_logo.png" alt="logo" />
            </div>
            <div className="auth-main-div">
                <div className="auth-main-heading">
                    <h2>Sign Up</h2>
                </div>
                <div className="auth-central-div">
                    <div>
                        <label htmlFor="username" className="auth-label">Username</label>
                        <input id="username" type="text" name="username" autoComplete="off" className="auth-input" value={username} onChange={(e) => { setUsername(e.target.value) }} />
                    </div>
                    <div>
                        <label htmlFor="email" className="auth-label">Email address</label>
                        <input id="email" type="email" name="email" autoComplete="off" className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                    </div>
                    <div>
                        <label htmlFor="password" className="auth-label">Password</label>
                        <input id="password" type="password" name="password" autoComplete="off" className="auth-input" value={password} onChange={(e) => { setPassword(e.target.value) }} />
                    </div>
                    <Button disabled={loading} onClick={handleSignup} >{loading ? "Loading..." : "Signup"}</Button>
                </div>
                <div className="auth-lower-div">
                    <p>Already have an account? <Link to={"/auth"} style={{ color: "#58A6FF", textDecorationLine: "none" }}>Sign In</Link> </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;