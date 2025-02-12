import React from "react";
import { Link } from "react-router-dom";
import "../css/footbar.css";

const Footbar = () => {
  return (
    <div className="footbar">
      <Link to="/search">Search</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/random">Random</Link>
      <Link to="/notifications">Notifications</Link>
      <Link to="/profile">Profile</Link>
    </div>
  );
};

export default Footbar;
