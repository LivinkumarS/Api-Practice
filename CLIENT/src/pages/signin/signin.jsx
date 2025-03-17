import React from "react";
import "./signin.css";
import Navbar from "../../components/navbar/navbar";
import logoImg from "../../assets/logo.png";
import { Link } from "react-router-dom";

export default function signin() {
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
          <form>
            <h3>Sign In</h3>
            <div>
              <label htmlFor="email">Email:</label>
              <input type="text" name="email" id="email" />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input type="password" name="password" id="password" />
            </div>

            <button type="submit">Submit</button>
          </form>
        </section>
      </div>
    </div>
  );
}
