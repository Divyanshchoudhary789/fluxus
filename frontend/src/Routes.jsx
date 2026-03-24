import React, { useEffect } from "react";
import { useNavigate, useRoutes } from 'react-router-dom';


//Pages List
import Dashboard from "./components/dashboard/Dashboard.jsx";
import Profile from "./components/user/Profile.jsx";
import Login from "./components/auth/Login.jsx";
import Signup from "./components/auth/Signup.jsx";
import CreateRepo from "./components/repo/CreateRepo/CreateRepo.jsx";
import UserRepos from "./components/repo/UserRepos/UserRepos.jsx";
import Settings from "./components/SettingsPage/Settings.jsx";

//Auth Context
import { useAuth } from "./authContext.jsx";
import CreateIssue from "./components/issue/CreateIssue/CreateIssue.jsx";
import ShowRepo from "./components/repo/ShowRepo/ShowRepo.jsx";
import FileViewer from "./components/repo/FileViewer/FileViewer.jsx";
import ShowIssue from "./components/issue/ShowIssue/ShowIssue.jsx";


const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem("userId");

        if (userIdFromStorage && !currentUser) {
            setCurrentUser(userIdFromStorage);
        }

        if (!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname)) {
            navigate("/auth");
        }

        if (userIdFromStorage && window.location.pathname == "/auth") {
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);



    let element = useRoutes([
        {
            path: "/",
            element: <Dashboard />
        },

        {
            path: "/auth",
            element: <Login />
        },

        {
            path: "/signup",
            element: <Signup />
        },

        {
            path: "/profile/:userId",
            element: <Profile />
        },

        {
            path: "/new",
            element: <CreateRepo />
        },

        {
            path: "/repos",
            element: <UserRepos />
        },

        {
            path: "/settings",
            element: <Settings />
        },

        {
            path: "/issues",
            element: <CreateIssue />
        },

        {
            path: "/repo/:repoId",
            element: <ShowRepo />
        },

        {
            path: "/issue/:issueId",
            element: <ShowIssue />
        },

        {
            path: "/repo/:repoId/blob/:commitId/*",
            element: <FileViewer />
        }
    ]);

    return element;

}

export default ProjectRoutes;