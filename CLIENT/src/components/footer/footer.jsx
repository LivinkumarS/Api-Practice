import React from "react";
import "./footer.css";
import { FaWhatsapp, FaGithub, FaLinkedinIn } from "react-icons/fa";

export default function footer() {
  return (
    <div className="footer">
      <p>
        created by <a href="https://portfolio-saala.netlify.app/">Saala</a>
      </p>
      <div className="foot-links">
        <a
          target="_blank"
          href="https://www.linkedin.com/in/livinkumar-saravanan-666731255"
        >
          <FaLinkedinIn />
        </a>
        <a target="_blank" href="https://wa.me/7904535371">
          <FaWhatsapp />
        </a>
        <a target="_blank" href="https://github.com/LivinkumarS">
          <FaGithub />
        </a>
      </div>
    </div>
  );
}
