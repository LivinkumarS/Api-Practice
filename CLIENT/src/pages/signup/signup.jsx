import React, { useContext, useState } from "react";
import "./signup.css";
import Navbar from "../../components/navbar/navbar";
import logoImg from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { userContext } from "../../App";
import { toast } from "react-toastify";
import Footer from "../../components/footer/footer";

export default function signup() {
  const { userData, setUserData } = useContext(userContext);
  const [showWarn, setShowWarn] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (formData.email === "" || formData.password === "") {
      setLoading(false);
      return toast.error("Please fillout all input fields");
    }

    if (showWarn) {
      setLoading(false);
      return toast.error("Password is not matching");
    }

    const errors = [];

    if (formData.password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(formData.password)) {
      errors.push("Password must contain at least one uppercase letter (A-Z).");
    }
    if (!/[a-z]/.test(formData.password)) {
      errors.push("Password must contain at least one lowercase letter (a-z).");
    }
    if (!/[0-9]/.test(formData.password)) {
      errors.push("Password must contain at least one number (0-9).");
    }
    if (!/[@$!%*?&]/.test(formData.password)) {
      errors.push(
        "Password must contain at least one special character (@, $, !, %, *, ?, &)."
      );
    }
    if (errors.length > 0) {
      setLoading(false);
      return errors.forEach((error) => toast.error(error));
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      const res = await response.json();
      if (!response.ok) {
        setLoading(false);
        return toast.error(res.message);
      }
      setFormData({ email: "", password: "" });
      toast.success("Signed up successfully");
      navigate("/sign-in");
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <Navbar hideSignIn={true} />

      <div className="sign-up">
        <section className="text-field">
          <div>
            <img src={logoImg} alt="Logo" />
            <h2>Saala's Point</h2>
          </div>
          <p>
            Do you already have an account? <Link to="/sign-in">sign in</Link>
          </p>
        </section>
        <section className="input-field">
          <form onSubmit={handleSubmit}>
            <h3>Sign up</h3>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, email: e.target.value };
                  });
                }}
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, password: e.target.value };
                  });
                }}
              />
            </div>
            <div>
              <label htmlFor="password">Confirm Password:</label>
              <input
                type="password"
                name="password"
                id="password"
                onChange={(e) => {
                  formData.password !== e.target.value
                    ? setShowWarn(true)
                    : setShowWarn(false);
                }}
              />

              {showWarn && <p>password is not matching</p>}
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "submit"}
            </button>
          </form>
        </section>
      </div>
      <Footer />
    </div>
  );
}
