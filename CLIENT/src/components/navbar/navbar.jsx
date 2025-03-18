import React, { useContext } from "react";
import "./navbar.css";
import logoImg from "../../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import { userContext } from "../../App";
import { CiUser } from "react-icons/ci";
import { toast } from "react-toastify";

export default function Navbar({ hideSignIn }) {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(userContext);

  async function handleSignOut() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userData.email }),
          credentials: "include",
        }
      );

      const res = await response.json();

      if (!response.ok) {
        return toast.error(res.message);
      }
      setUserData({});
      toast.success("Signed out successfully");
      navigate("/sign-in");
    } catch (error) {
      toast.error(error.message);
    }
  }

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
        !userData.email ? (
          <Link to="/sign-in">
            <button className="nav-btn">Sign in</button>
          </Link>
        ) : (
          <div className="profile-svg">
            <CiUser />
            <div className="profile-option">
              <h6>{userData.email}</h6>
              {userData.verified ? <h6>Verified✅</h6> : <h6>Not Verified</h6>}
              {!userData.verified && (
                <h6 className="link" onClick={() => navigate("/verify-account")}>Verify now!</h6>
              )}
              <h6 className="link" onClick={handleSignOut}>
                signout
              </h6>
            </div>
          </div>
        )
      ) : (
        <div></div>
      )}
    </div>
  );
}
