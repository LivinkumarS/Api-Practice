import React, { useEffect, useState } from "react";
import "./forgotPassword.css";
import { useContext } from "react";
import { userContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/navbar/navbar";
import { FaArrowRight } from "react-icons/fa";

export default function forgotPassword() {
  const { userData, setUserData } = useContext(userContext);
  const navigate = useNavigate();

  const [load, setLoad] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    providedCode: "",
    newPassword: "",
  });
  const [canResend, setCanResend] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (userData.email) {
      toast.warn("Already Signed In");
      navigate("/");
    }
  }, [userData]);

  useEffect(() => {
    if (otpSent && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
      setOtpSent(false);
    }
  }, [otpSent, timeLeft]);

  async function sendOTP(e) {
    e.preventDefault();
    setCanResend(false);
    if (formData.email === "") {
      return toast.error("Fill out all the fields");
    }

    try {
      setLoad(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/send-forgotpassword-code`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
          credentials: "include",
        }
      );

      const res = await response.json();

      if (!response.ok) {
        setOtpSent(false);
        setLoad(false);
        return toast.error(res.message);
      } else {
        setLoad(false);
        toast.success(res.message);
        setTimeLeft(300);
        return setOtpSent(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function verifyOTP(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-forgotpassword-code`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const res = await response.json();

      if (!response.ok) {
        return toast.error(res.message);
      } else {
        setOtpSent(false);
        setCanResend(false);
        setTimeLeft(300);
        setFormData({ email: "", providedCode: "" });
        toast.success(res.message);

        navigate("/sign-in");
      }

      return setFormData({ email: "", providedCode: "" });
    } catch (error) {
      toast.error(error.message);
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div>
      <Navbar />
      <div className="forgot-pass">
        <section className="text-section">
          <h2>Forgot Password</h2>
          <p>
            To verify your email, we have sent a 6-digit OTP (One-Time Password)
            to your registered email address. Please enter the OTP in the field
            provided and click the "Verify" button. If the OTP is correct, you
            can change your current password, and you will be redirected to Sign
            in page. If you didn't receive the OTP, you can click the "Resend
            OTP" button to request a new one. This verification step ensures the
            security of your account and helps us confirm that the email
            provided belongs to you.
          </p>
        </section>
        <section className="input-section">
          <form>
            <div className="email-cont">
              <input
                type="email"
                name="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, email: e.target.value };
                  });
                }}
              />
              <button
                className={load || otpSent ? "hide" : ""}
                disabled={load || otpSent}
                onClick={sendOTP}
              >
                Send OTP
              </button>
            </div>
          </form>

          <form onSubmit={verifyOTP}>
            <div className={otpSent ? "otp-cont" : "hide otp-cont"}>
              <label htmlFor="otp">Verification Code: </label>
              <input
                type="number"
                name="providedCode"
                placeholder="OTP"
                id="otp"
                disabled={!otpSent}
                value={formData.providedCode}
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, providedCode: e.target.value };
                  });
                }}
              />
            </div>
            <div className={otpSent ? "pass-cont" : "hide pass-cont"}>
              <label htmlFor="otp">New password: </label>
              <input
                type="password"
                name="newPassword"
                placeholder="new password"
                id="otp"
                disabled={!otpSent}
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, newPassword: e.target.value };
                  });
                }}
              />
            </div>

            <button
              type="submit"
              className={otpSent ? "" : "hide"}
              disabled={!otpSent}
            >
              Submit
            </button>
            <div>
              <div className="doLater">
                {otpSent &&
                  !canResend &&
                  `Resend OTP in ${formatTime(timeLeft)}`}
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
