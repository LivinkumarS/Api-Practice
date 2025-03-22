import React, { useEffect, useState } from "react";
import "./createPost.css";
import Navbar from "../../components/navbar/navbar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userContext } from "../../App";
import Footer from "../../components/footer/footer";

export default function createPost() {
  const { userData } = useContext(userContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData.userId) {
      toast.error("Signin to create post");
      navigate("/sign-in");
    }
  }, [userData]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    code: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      formData.title === "" ||
      formData.category === "" ||
      formData.code === "" ||
      formData.description === ""
    ) {
      setLoading(false);
      return toast.error("Please fill out all the fields");
    }

    if (!userData.userId) {
      setLoading(false);
      return toast.error("Signin to create post");
    }
    if (!userData.verified) {
      setLoading(false);
      return toast.error("Verified users only can create posts");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/post/create-post`,
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

    toast.success("Post created!");
    setLoading(false);
    return navigate("/");
  };

  return (
    <div>
      <Navbar />

      <div className="create-post">
        <h4>Create Post</h4>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title: </label>
            <input
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => {
                  return {
                    ...prev,
                    title: e.target.value,
                  };
                });
              }}
              type="text"
              id="title"
            />
          </div>

          <div>
            <label htmlFor="category">Category: </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => {
                setFormData((prev) => {
                  return {
                    ...prev,
                    category: e.target.value,
                  };
                });
              }}
            >
              <option value="">Choose category</option>
              <option value="HTML">HTML</option>
              <option value="CSS">CSS</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData((prev) => {
                return {
                  ...prev,
                  description: e.target.value,
                };
              });
            }}
            placeholder="description"
            rows="4"
          ></textarea>

          <textarea
            value={formData.code}
            onChange={(e) => {
              setFormData((prev) => {
                return {
                  ...prev,
                  code: e.target.value,
                };
              });
            }}
            placeholder="paste your code here"
            rows="6"
          ></textarea>

          <button disabled={loading} type="submit">
            {loading ? "Loading..." : "submit"}
          </button>
        </form>
      </div>
      <Footer/>
    </div>
  );
}
