import React from "react";
import "./Footer.css";

import { Link } from "react-router-dom";

function Footer() {
    return (
        <div className="footer-div">
            <Link style={{ textDecoration: "none" }} to={"https://www.linkedin.com/in/divyansh--choudhary/"} ><img src="/Fluxus_logo.png" alt="logo" className="logo-image" /></Link>
            <h5>&copy; 2026 Fluxus,Inc.</h5>
            <p>Terms</p>
            <p>Privacy</p>
            <p>Security</p>
            <p>Status</p>
            <p>Community</p>
            <p>Docs</p>
            <p>Contact</p>
        </div>
    );
}

export default Footer;