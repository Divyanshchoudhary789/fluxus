import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from '@primer/react'
import "./Auth.css";

import { server_url } from "../../environment.js";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { Banner } from '@primer/react'


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showMsg, setShowMsg] = useState("");


    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const res = await axios.post(`${server_url}/login`, {
                email: email,
                password: password
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.userId);

            setCurrentUser(res.data.userId);

            setLoading(false);
            navigate("/");

        } catch (err) {
            console.error(err);
            setShowMsg("Sign In Failed, Invalid Credentials!");
            setLoading(false);
            setTimeout(() => {
                setShowMsg("");
            }, 2000);
        }

    };

    return (
        <div className="auth-wrapper-div">
            {showMsg ? <Banner
                aria-label="message critical info"
                id="signIn-banner"
                title="Success"
                hideTitle
                description={showMsg}
            /> : undefined}
            <div className="auth-logo-container">
                <img src="/Fluxus_logo.png" alt="logo" />
            </div>
            <div className="auth-main-div">
                <div className="auth-main-heading">
                    <h2>Sign In</h2>
                </div>
                <div className="auth-central-div">
                    <div>
                        <label htmlFor="email" className="auth-label">Email address</label>
                        <input id="email" type="email" name="email" autoComplete="off" className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                    </div>
                    <div>
                        <label htmlFor="password" className="auth-label">Password</label>
                        <input id="password" type="password" name="password" autoComplete="off" className="auth-input" value={password} onChange={(e) => { setPassword(e.target.value) }} />
                    </div>
                    <Button disabled={loading} onClick={handleSignIn} >{loading ? "Loading..." : "SignIn"}</Button>
                </div>
                <div className="auth-lower-div">
                    <p>New to Fluxus? <Link to={"/signup"} style={{ color: "#58A6FF", textDecorationLine: "none" }}>Create an Account</Link> </p>
                </div>
            </div>
        </div>
    );
}

export default Login;