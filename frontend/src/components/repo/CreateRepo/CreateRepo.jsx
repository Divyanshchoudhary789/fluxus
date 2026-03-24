import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CreateRepo.css";

import Navbar from "../../Navbar/Navbar.jsx";
import { server_url } from "../../../environment.js";

import { TextInput } from '@primer/react'
import { Button } from '@primer/react'
import { Avatar } from '@primer/react'
import { useNavigate } from "react-router-dom";

function CreateRepo() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(true);

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");

    useEffect(() => {

        const userInfo = async () => {
            try {
                const res = await axios.get(`${server_url}/userProfile/${userId}`);
                setUsername(res.data.username);
            } catch (err) {
                console.error("Error during fetching user details: ", err);
            }
        }

        userInfo();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${server_url}/repo/create`, {
                name: name,
                description: description,
                visibility: visibility,
                owner: userId,
            });
            //console.log(res);
            setLoading(false);
            const repoId = res.data.repositoryID;
            navigate(`/repo/${repoId}`);
        } catch (err) {
            console.error("Error during Repository Creation", err);
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />
            <div id="main-form-wrapper">
                <div className="upper-new-div">
                    <p>Create a new repository</p>
                    <div>Repositories contain a project's files and version history. </div>
                    <div >Required fields are marked with an asterisk (*).</div>
                </div>
                <div className="central-form-div">
                    <h2 style={{ fontSize: "16px" }}>General</h2>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
                            <label htmlFor="owner">Owner*</label>
                            <div style={{ border: "1px solid #9198A1", color: "white", width: "230px", display: "flex", borderRadius: "8px", padding: "0px 10px", alignItems: "center", backgroundColor: "#3D444D" }}>
                                <Avatar size={20} src="avatar.png" />
                                <TextInput id="owner" value={username} />
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
                            <label htmlFor="name">Repository Name*</label>
                            <TextInput id="name" value={name} onChange={(e) => { setName(e.target.value) }} style={{ border: "1px solid #9198A1", color: "#9198A1", width: "300px" }} />
                        </div>
                    </div>
                    <p>Great repository names are short and memorable.</p>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
                        <label htmlFor="description">Description</label>
                        <TextInput id="description" value={description} onChange={(e) => { setDescription(e.target.value) }} style={{ border: "1px solid #9198A1", color: "#9198A1" }} min={0} max={350} />
                    </div>
                    <div style={{ fontSize: "14px", color: "#9198A1", marginBottom: "50px" }}>{description.length} / 350 characters</div>
                    <h2 style={{ fontSize: "16px", marginBottom: "30px" }}>Configuration</h2>
                    <div className="visibility-div">
                        <div>
                            <div>Choose visibility *</div>
                            <div style={{ fontSize: "14px", color: "#9198A1" }}>Choose who can see and commit to this repository</div>
                        </div>
                        <div>
                            <select name="visibility" id="visibility" value={visibility.toString()} onChange={(e) => { setVisibility(e.target.value === "true") }} style={{ width: "80px", height: "30px", borderRadius: "8px", backgroundColor: "#212830", color: "white", padding: "5px", cursor: "pointer" }}>
                                <option value="true">Public</option>
                                <option value="false">Private</option>
                            </select>
                        </div>
                    </div>
                    <div className="main-btn">
                        <Button disabled={loading} onClick={handleSubmit} style={{ backgroundColor: "#347D39", border: "none", color: "white" }}>{loading ? "Loading..." : "Create Repository"}</Button>
                    </div>
                </div>
            </div>
        </>
    );
}


export default CreateRepo;