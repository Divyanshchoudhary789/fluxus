import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useMonaco } from "@monaco-editor/react";
import githubDark from "../../../themes/GitHub Dark.json";
import Navbar from "../../Navbar/Navbar.jsx";

function FileViewer() {
    const { repoId, commitId, "*": filePath } = useParams();

    const [content, setContent] = useState("");
    const monaco = useMonaco();

    useEffect(() => {
        const fetchFile = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8080/repo/${repoId}/file`,
                    {
                        params: {
                            filePath,
                            commitId,
                        }
                    }
                );

                setContent(res.data.content);
            } catch (err) {
                console.error("Error fetching file:", err);
            }
        };

        fetchFile();
    }, [repoId, commitId, filePath]);



    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("github-dark", githubDark);
            monaco.editor.setTheme("github-dark");
        }
    }, [monaco]);


    const getLanguage = (filePath) => {
        const ext = filePath.split(".").pop();

        switch (ext) {
            case "js": return "javascript";
            case "ts": return "typescript";
            case "py": return "python";
            case "java": return "java";
            case "cpp": return "cpp";
            case "c": return "c";
            case "json": return "json";
            case "html": return "html";
            case "css": return "css";
            case "md": return "markdown";
            case "sh": return "shell";
            default: return "plaintext";
        }
    };


    return (
        <>
            <Navbar />
            <div style={{ padding: "0px 20px" }}>
                <h3>{filePath}</h3>

                <Editor
                    height="80vh"
                    language={getLanguage(filePath)}
                    value={content}
                    theme="github-dark"
                    options={{
                        readOnly: true,
                        smoothScrolling: true,
                        cursorStyle: "line-thin",
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                    }}
                />
            </div>
        </>
    );
}

export default FileViewer;