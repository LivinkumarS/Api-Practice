import React, { useContext, useState } from "react";
import "./signin.css";
import Navbar from "../../components/navbar/navbar";
import logoImg from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userContext } from "../../App";

export default function signin() {
  const { userData, setUserData } = useContext(userContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.email === "" || formData.password === "") {
      return toast.error("Please fillout all input fields");
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      const res = await response.json();
      if (!response.ok) {
        return toast.error(res.message);
      }
      setFormData({ email: "", password: "" });
      await setUserData(res.user);
      toast.success("Signed in successfully");

      if (userData.verified) {
        navigate("/");
      } else {
        navigate("/verify-account");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <Navbar hideSignIn={true} />

      <div className="sign-in">
        <section className="text-field">
          <div>
            <img src={logoImg} alt="Logo" />
            <h2>Saala's Point</h2>
          </div>
          <p>
            Don't you have an account? <Link to="/sign-up">sign up</Link>
          </p>
        </section>
        <section className="input-field">
          <form onSubmit={handleSubmit}>
            <h3>Sign In</h3>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, email: e.target.value };
                  });
                }}
                type="text"
                name="email"
                id="email"
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, password: e.target.value };
                  });
                }}
                type="password"
                name="password"
                id="password"
              />
            </div>

            <button type="submit">Submit</button>
          </form>
        </section>
      </div>
    </div>
  );
}
