import express from "express";
import {
  createPost,
  getAllPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
} from "../controllers/postController.js";
import identifyUser from "../middlewares/identifier.js";

const router = express.Router();

router.post("/create-post", identifyUser, createPost);
router.get("/all-post", getAllPost);
router.get("/single-post/:postId", getPost);

router.get("/like-post/:postId", identifyUser, likePost);

router.put("/update/:postId", identifyUser, updatePost);
router.delete("/delete/:postId", identifyUser, deletePost);

export default router;
