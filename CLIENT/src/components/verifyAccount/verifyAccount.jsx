import React, { useContext, useEffect, useState } from "react";
import "./verifyAccount.css";
import Navbar from "../navbar/navbar";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { userContext } from "../../App";
import { FaArrowRight } from "react-icons/fa";

export default function verifyAccount() {
  const { userData, setUserData } = useContext(userContext);
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({ email: "", providedCode: "" });
  const [canResend, setCanResend] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (otpSent && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
      setOtpSent(false);
    }
  }, [otpSent, timeLeft]);

  useEffect(() => {
    if (!userData.email) {
      navigate("/sign-in");
    }
    if (userData.verified) {
      toast.success("Already verified!");
      navigate("/");
    }
  }, [userData]);

  async function sendOTP(e) {
    e.preventDefault();

    if (formData.email !== userData.email) {
      return toast.error("Wrong mail Id");
    }
    setCanResend(false);
    if (formData.email === "") {
      return toast.error("Fill out all the fields");
    }

    try {
      setLoad(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/send-verification-code`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
          credentials: "include",
        }
      );

      const res = await response.json();

      if (!response.ok) {
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
        `${import.meta.env.VITE_API_URL}/api/auth/verify-verification-code`,
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
        setUserData((prev) => {
          return { ...prev, verified: true };
        });
        return toast.success(res.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 300 ? "0" : ""}${secs}`;
  };

  return (
    <div>
      <Navbar />
      <div className="verify-acc">
        <section className="text-section">
          <h2>Verify Your Account</h2>
          <p>
            To verify your email, we have sent a 6-digit OTP (One-Time Password)
            to your registered email address. Please enter the OTP in the field
            provided and click the "Verify" button. If the OTP is correct, your
            email will be successfully verified, and you will be redirected to
            your account. If you didn't receive the OTP, you can click the
            "Resend OTP" button to request a new one. This verification step
            ensures the security of your account and helps us confirm that the
            email provided belongs to you.
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
            <div className={otpSent ? "" : "hide"}>
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
                <div
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Do it later <FaArrowRight />
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
