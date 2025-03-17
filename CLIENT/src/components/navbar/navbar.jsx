import React from "react";
import "./navbar.css";
import logoImg from "../../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar({ hideSignIn }) {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div
        onClick={() => {
          navigate("/");
        }}
      >
        <img src={logoImg} alt="Logo" />
        <h2>Saala's Point</h2>
      </div>

      {!hideSignIn ? (
        <Link to="/sign-in">
          <button className="nav-btn">Sign in</button>
        </Link>
      ) : (
        <div></div>
      )}
    </div>
  );
}
