import React, { useContext, useState } from "react";
import { userContext } from "../../App";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";

export default function postCard({
  post,
  copyToClipboard,
  handleDeletePost,
  handleLikePost,
}) {
  const { userData } = useContext(userContext);
  const [expand, setExpand] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);

  return (
    <div className="post-card">
      <div className="head">
        <h5>
          {post.title} {"   "}{" "}
          <span style={{ color: "gray", fontSize: "small" }}>
            ({post.userId.email}✅)
          </span>
        </h5>

        <div>
          {userData.userId &&
            (post.userId._id === userData.userId ||
              userData.userId.toString() ===
                import.meta.env.VITE_ADMIN_USER_ID) && (
              <button
                onClick={() => {
                  handleDeletePost(post._id);
                }}
              >
                Delete
              </button>
            )}

          <div
            onClick={() => {
              handleLikePost(post._id);
            }}
            className="like-cont"
          >
            {post.likes.includes(userData.userId) ? (
              <AiFillLike />
            ) : (
              <AiOutlineLike />
            )}

            <span>{post.noOfLikes}</span>
          </div>
        </div>
      </div>
      <p className="category">
        Category: <span style={{ fontWeight: "bold" }}>{post.category}</span>
      </p>

      <div className="code-container">
        <div
          className={expand ? "code" : "code short"}
          onClick={() => {
            copyToClipboard(post.code);
          }}
          style={{ cursor: "pointer" }}
        >
          <SyntaxHighlighter language="html" style={oneDark}>
            {post.code}
          </SyntaxHighlighter>
        </div>

        <button
          onClick={() => {
            setExpand((prev) => !prev);
          }}
        >
          {expand ? "Shorten" : "Expand"}
        </button>
      </div>

      <p style={{ fontSize: "smaller" }}>
        {expandDesc ? post.description : post.description.slice(0, 200) + "..."}
        <span
          onClick={() => {
            setExpandDesc((prev) => !prev);
          }}
          style={{
            fontSize: "small",
            color: "blue",
            textDecoration: "underlinee",
            cursor: "pointer",
          }}
        >
          {expandDesc ? "show less" : "show more"}
        </span>
      </p>
      <p style={{ fontSize: "small", color: "gray" }}>
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
