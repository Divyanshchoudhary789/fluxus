import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateIssue.css";

import Navbar from "../../Navbar/Navbar.jsx";
import Footer from "../../Footer/Footer.jsx";

import { server_url } from "../../../environment.js";

import { Button, FormControl, SelectPanel } from '@primer/react';
import { TriangleDownIcon } from '@primer/octicons-react';
import { TextInput } from '@primer/react'
import { Banner } from '@primer/react'

function CreateIssue() {
    const [repositories, setRepositories] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultMsg, setResultMsg] = useState("");

    const items = repositories.map(repo => (
        {
            text: repo.name,
            id: repo._id
        }
    ));


    const [selected, setSelected] = useState(null)
    const [filter, setFilter] = useState('')
    const [open, setOpen] = useState(false)

    const filteredItems = items.filter(item =>
        item.text?.toLowerCase().includes(filter.toLowerCase())
    )



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

    //console.log(selected);

    const handleIssueCreation = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${server_url}/issue/create/${selected.id}`, {
                title: title,
                description: description,
            });
            //console.log(res);
            setResultMsg(res.data.message);
            setLoading(false);
            setTimeout(() => {
                setResultMsg("");
                setTitle("");
                setDescription("");
                setSelected(null);
            }, [2000]);
        } catch (err) {
            console.error("Error in Issue Creation:", err);
            setLoading(false);
        }
    }


    return (
        <>
            <Navbar />
            <div id="outer-issue-container">
                {resultMsg ? <Banner
                    aria-label="message critical info"
                    id="settings-msg-banner"
                    title="Success"
                    hideTitle
                    description={resultMsg}
                /> : undefined}
                <div className="issue-container">
                    <div className="main-heading">Create New Issue</div>
                    <div className="issue-form">
                        <div className="issue-form-left" >
                            <FormControl.Label style={{ marginBottom: "10px" }}>Repository*</FormControl.Label>

                            <SelectPanel
                                renderAnchor={({ children, ...anchorProps }) => (
                                    <Button className="repo-select-btn" {...anchorProps} trailingAction={TriangleDownIcon}>
                                        {selected?.text || "Select Repository"}
                                    </Button>
                                )}
                                placeholder="Pick one choice"
                                open={open}
                                onOpenChange={setOpen}
                                items={filteredItems}
                                selected={selected}
                                onSelectedChange={setSelected}
                                onFilterChange={setFilter}
                                className="select-panel"
                            />
                        </div>
                        <div className="issue-form-right">
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                <label htmlFor="title">Issue Title</label>
                                <TextInput id="title" style={{ backgroundColor: "#262C36", border: "1px solid #D1D7E0", borderRadius: "10px" }} value={title} onChange={(e) => { setTitle(e.target.value) }} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                <label htmlFor="description">Issue description</label>
                                <TextInput id="description" style={{ backgroundColor: "#262C36", border: "1px solid #D1D7E0", borderRadius: "10px" }} value={description} onChange={(e) => { setDescription(e.target.value) }} />
                            </div>
                            <div className="issue-btn">
                                <Button disabled={loading} className="btn" onClick={handleIssueCreation} >{loading ? "Loading..." : "Create Issue"}</Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}

export default CreateIssue;