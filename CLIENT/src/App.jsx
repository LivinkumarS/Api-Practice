import React, { createContext, useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Home from "./pages/home/home";
import Signin from "./pages/signin/signin";
import Signup from "./pages/signup/signup";
import VerifyAccount from "./components/verifyAccount/verifyAccount";

export const userContext = createContext();

export default function App() {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const checkSign = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/check-sign`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const res = await response.json();
        if (response.ok) {
          setUserData(res.user);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    checkSign();
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <userContext.Provider value={{ userData, setUserData }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<Signin />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
        </Routes>
      </userContext.Provider>
    </BrowserRouter>
  );
}
