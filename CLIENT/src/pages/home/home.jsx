import React, { useContext, useEffect, useState } from "react";
import "./home.css";
import Navbar from "../../components/navbar/navbar";
import { userContext } from "../../App";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import PostCard from "../../components/postCard/postCard";

export default function Home() {
  const { userData } = useContext(userContext);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/post/all-post?searchTerm=${searchTerm}&postPerPage=10&page=${page}&category=${category}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const res = await response.json();

      if (!response.ok) {
        setLoading(false);
        toast.error(res.message);
      }
      setTotalPosts(res.result.totalPosts);
      setPosts(res.result.posts);
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, searchTerm, category]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleLikePost = async (postId) => {
    if (!userData.userId) {
      return toast.error("Signin to Like the Post");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/post/like-post/${postId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const res = await response.json();

    if (!response.ok) {
      return toast.error(res.message);
    }

    setPosts((prev) =>
      prev.map((ele) => {
        if (ele._id === postId) {
          const isLiked = ele.likes.includes(userData.userId);

          return {
            ...ele,
            likes: isLiked
              ? ele.likes.filter((id) => id !== userData.userId)
              : [...ele.likes, userData.userId],
            noOfLikes: isLiked ? ele.noOfLikes - 1 : ele.noOfLikes + 1,
          };
        }
        return ele;
      })
    );
  };

  const handleDeletePost = async (postId) => {
    const okDelete = await window.confirm(
      "Do You Really Want To Delete This Post?"
    );

    if (!okDelete) {
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/post/delete/${postId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const res = await response.json();
    if (!response.ok) {
      return toast.error(res.message);
    }
    setPosts((prev) => {
      return prev.filter((ele) => {
        return ele._id !== postId;
      });
    });
    setTotalPosts((prev) => prev - 1);
    return toast.success(res.message);
  };

  return (
    <div>
      <Navbar />
      <div className="home">
        <h5>
          Welcome...!{" "}
          <span style={{ color: "var(--button-color)" }}>{userData.email}</span>
        </h5>
        <p>
          Welcome to{" "}
          <span style={{ color: "var(--button-color)" }}>Saala's Point</span>, a
          dedicated space for web developers and enthusiasts looking to enhance
          their skills in HTML, CSS, JavaScript, and React. Here, Anyone can
          share practical tips, tricks, and best practices to help you write
          clean, efficient, and modern code.
        </p>

        <div className="search-cont">
          <div className="head-cat">
            <h3>Latest Posts</h3>
            <div>
              <span
                onClick={() => {
                  setCategory((prev) => {
                    return prev === "HTML" ? "" : "HTML";
                  });
                }}
              >
                HTML{" "}
                {category === "HTML" && (
                  <div>
                    <IoClose />
                  </div>
                )}
              </span>
              <span
                onClick={() => {
                  setCategory((prev) => {
                    return prev === "CSS" ? "" : "CSS";
                  });
                }}
              >
                CSS{" "}
                {category === "CSS" && (
                  <div>
                    <IoClose />
                  </div>
                )}
              </span>
              <span
                onClick={() => {
                  setCategory((prev) => {
                    return prev === "JavaScript" ? "" : "JavaScript";
                  });
                }}
              >
                JavaScript{" "}
                {category === "JavaScript" && (
                  <div>
                    <IoClose />
                  </div>
                )}
              </span>
              <span
                onClick={() => {
                  setCategory((prev) => {
                    return prev === "React" ? "" : "React";
                  });
                }}
              >
                React{" "}
                {category === "React" && (
                  <div>
                    <IoClose />
                  </div>
                )}
              </span>
              <span
                onClick={() => {
                  setCategory((prev) => {
                    return prev === "Others" ? "" : "Others";
                  });
                }}
              >
                Others{" "}
                {category === "Others" && (
                  <div>
                    <IoClose />
                  </div>
                )}
              </span>
            </div>
          </div>
          <input
            type="text"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            value={searchTerm}
            placeholder="Search"
          />{" "}
        </div>
        {!loading ? (
          <>
            <div className="posts-container">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post._id}>
                    <PostCard
                      copyToClipboard={copyToClipboard}
                      handleDeletePost={handleDeletePost}
                      handleLikePost={handleLikePost}
                      post={post}
                    />
                  </div>
                ))
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "var(--button-color)",
                    marginTop: "30px",
                  }}
                >
                  No posts available.
                </p>
              )}
            </div>

            {totalPosts > posts.length && (
              <p
                onClick={() => {
                  setPage((prev) => prev + 1);
                }}
                style={{
                  color: "blue",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                See More
              </p>
            )}
          </>
        ) : (
          <p
            style={{
              textAlign: "center",
              fontWeight: "bold",
              color: "var(--button-color)",
              marginTop: "30px",
            }}
          >
            Loading...
          </p>
        )}
      </div>
    </div>
  );
}
