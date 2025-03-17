import React from "react";
import "./signup.css";
import Navbar from "../../components/navbar/navbar";
import logoImg from "../../assets/logo.png";
import { Link } from "react-router-dom";

export default function signup() {
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
          <form>
            <h3>Sign up</h3>
            <div>
              <label htmlFor="email">Email:</label>
              <input type="text" name="email" id="email" />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input type="password" name="password" id="password" />
            </div>
            <div>
              <label htmlFor="password">Confirm Password:</label>
              <input type="password" name="password" id="password" />
            </div>

            <button type="submit">Submit</button>
          </form>
        </section>
      </div>
    </div>
  );
}
