import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ShowIssue.css";


import Navbar from "../../Navbar/Navbar.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { Token } from '@primer/react'
import { IssueOpenedIcon } from '@primer/octicons-react'
import { IssueClosedIcon } from '@primer/octicons-react'
import { Button } from '@primer/react'
import { TextInput } from '@primer/react'
import { Banner } from '@primer/react'
import { TrashIcon } from '@primer/octicons-react'
import { XIcon } from '@primer/octicons-react';




function ShowIssue() {
    const { issueId } = useParams();
    const navigate = useNavigate();

    const [issue, setIssue] = useState({});
    const [issueRepo, setIssueRepo] = useState({});
    const [showEditForm, setShowEditForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [showMsg, setShowMsg] = useState("");
    const [openDeleteForm, setOpenDeleteForm] = useState(false);
    const [newIssue, setNewIssue] = useState({});

    useEffect(() => {

        const fetchIssue = async () => {
            try {
                const result = await axios.get(`http://localhost:8080/issue/${issueId}`);
                if (result) {
                    //console.log(result);
                    setIssue(result.data.issue);
                    setIssueRepo(result.data.issue.repository);
                    setNewTitle(result.data.issue.title);
                    setNewDescription(result.data.issue.description);
                    setNewStatus(result.data.issue.status);
                    //console.log(issue);
                }
            } catch (err) {
                console.error("Error in fetching Issue:", err);
            }
        }


        fetchIssue();

    }, [issueId, newIssue]);

    const updateIssue = async () => {
        try {
            const result = await axios.put(`http://localhost:8080/issue/update/${issueId}`, {
                title: newTitle,
                description: newDescription,
                status: newStatus,
            });
            if (result) {
                //console.log(result);
                setShowEditForm(false);
                setShowMsg(result.data.message);
                setNewIssue(result.data.issue);
                setNewTitle("");
                setNewDescription("");
                setNewStatus("");
                setTimeout(() => {
                    setShowMsg("");
                }, 2000);
            }
        } catch (err) {
            console.error("Error in updating issue:", err);
        }
    }

    const deleteIssue = async () => {
        try {
            const result = await axios.delete(`http://localhost:8080/issue/delete/${issueId}`);
            if (result) {
                //console.log(result);
                navigate("/repos");
            }
        } catch (err) {
            console.error("Error in deleting a issue:", err);
        }
    }


    return (
        <>
            <Navbar />
            <div className="issue-outer-wrapper">
                {showMsg ? <Banner
                    aria-label="message critical info"
                    id="issue-banner"
                    title="Success"
                    hideTitle
                    description={showMsg}
                /> : undefined}
                <div className="issue-div">
                    <div style={{ fontSize: "26px", borderBottom: "1px solid #9198A1", height: "45px", marginBottom: "25px" }} >Issue Details-</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                        <div className="issue-header">
                            <div className="issue-title">Issue Title: <span style={{ color: "#316dca", marginLeft: "25px" }}>{issue.title}</span></div>
                            <div className="issue-description">Issue Description: <span style={{ color: "#316dca", marginLeft: "25px" }}>{issue.description}</span></div>
                            <div className="issue-status">
                                <div>Issue Status:</div>
                                <div style={{ color: "#316dca", marginLeft: "25px" }}>{issue.status}</div>
                                <div style={{ marginLeft: "20px", display: "flex", alignItems: "flex-end" }}>{issue.status === "open" ? <IssueOpenedIcon size={16} /> : <IssueClosedIcon size={16} />}</div></div>
                        </div>
                        <div className="repo-detail">
                            <div style={{ display: "flex", gap: "10px", marginBottom: "15px", fontSize: "20px" }}>
                                <div className="repo-name">Repository Name: <span style={{ color: "#316dca", marginLeft: "15px" }}>{issueRepo.name}</span></div>
                                <Token text={issueRepo.visibility ? "Public" : "Private"} style={{ color: "#9198A1" }} />
                            </div>
                            <div style={{ fontSize: "20px" }} className="repo-name">Repository description: <span style={{ color: "#316dca", marginLeft: "15px" }}>{issueRepo.description}</span></div>
                        </div>
                    </div>
                    <div style={{ fontSize: "24px", marginBottom: "15px" }}>Edit Issue Panel:</div>
                    <div className="edit-issue-panel">
                        <div className="update-issue">
                            <div style={{ fontSize: "20px", color: "#9198A1" }}>Edit this Issue</div>
                            <Button className="edit-btn" onClick={() => { setShowEditForm(true) }} >Edit Issue</Button>
                        </div>
                        <div className="delete-issue">
                            <div style={{ fontSize: "20px", display: "flex", flexDirection: "column", gap: "15px", color: "#9198A1" }}>
                                <div>Delete this Issue</div>
                                <div style={{ fontSize: "14px" }}>Once you delete a issue, there is no going back. Please be certain.</div>
                            </div>
                            <Button className="edit-btn" onClick={() => { setOpenDeleteForm(true) }} >Delete Issue</Button>
                        </div>
                    </div>
                </div>
            </div >


            {showEditForm ?
                <div className="edit-form">
                    <div style={{ fontSize: "20px" }}>Edit Issue</div>
                    <div>
                        <div id="label">
                            <label htmlFor="title" >New Title</label>
                        </div>
                        <div className="edit-form-input">
                            <TextInput id="title" placeholder="Enter New Title" name="title" value={newTitle} onChange={(e) => { setNewTitle(e.target.value) }} />
                        </div>
                    </div>
                    <div>
                        <div id="label">
                            <label htmlFor="title" >New Description</label>
                        </div>
                        <div className="edit-form-input">
                            <TextInput id="title" placeholder="Enter New description" name="description" value={newDescription} onChange={(e) => { setNewDescription(e.target.value) }} />
                        </div>
                    </div>
                    <div>
                        <div id="label">
                            <label htmlFor="status" >Updated Status</label>
                        </div>
                        <div >
                            <select id="status" className="edit-form-select" name="status" value={newStatus} onChange={(e) => { setNewStatus(e.target.value) }}>
                                <option value="open" >Open</option>
                                <option value="close">Close</option>
                            </select>
                        </div>
                    </div>
                    <div className="btns">
                        <Button onClick={updateIssue} className="save-btn" >Save Changes</Button>
                        <Button onClick={() => { setShowEditForm(false) }} >Cancel</Button>
                    </div>
                </div >
                : null
            }

            {openDeleteForm === true ?
                <div className="delete-issue-panel">
                    <div className="upper-div">
                        <div id="delete-div-top">Delete Issue <span style={{ color: "#478be6" }}>{issue.title}</span> </div>
                        <div onClick={() => { setOpenDeleteForm(false) }} style={{ cursor: "pointer" }} ><XIcon size={20} /></div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", width: "100%", gap: "10px" }}>
                            <div className="icon"><TrashIcon size={34} /></div>
                            <div style={{ fontSize: "24px", color: "#478be6" }}>{issue.title}</div>
                        </div>
                        <div className="delete-panel-footer">
                            <Button id="delete-btn" onClick={deleteIssue} >I want to delete this issue</Button>
                        </div>
                    </div>
                </div>
                : null}



        </>
    );
}


export default ShowIssue;