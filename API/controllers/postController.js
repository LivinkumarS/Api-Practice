import {
  createPostValidator,
  deletePostValidator,
  getSinglePostValidator,
  likePostValidator,
  updatePostValidator,
} from "../middlewares/validator.js";
import Posts from "../models/postModel.js";

export const createPost = async (req, res) => {
  const { title, description, category, code } = req.body;
  const { userId, verified } = req.user;

  try {
    const { error, value } = createPostValidator.validate({
      title,
      description,
      category,
      code,
      userId,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: "Verified User only Can Create posts",
      });
    }

    const createdPost = await Posts.create({
      title,
      description,
      userId,
      category,
      code,
    });

    return res.status(200).json({
      success: true,
      message: "Post created successfully",
      post: createdPost,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async (req, res) => {
  const { page, postPerPage, searchTerm, category } = req.query;
  const limiter = postPerPage ? Number(postPerPage) : 10;
  try {
    let pageNum = 0;
    if (Number(page) <= 1) pageNum = 1;
    else pageNum = Number(page);

    const filter =
      searchTerm || category
        ? {
            $and: [
              {
                $or: [
                  { title: { $regex: searchTerm, $options: "i" } },
                  { description: { $regex: searchTerm, $options: "i" } },
                  { code: { $regex: searchTerm, $options: "i" } },
                ],
              },
              category ? { category: { $regex: category, $options: "i" } } : {},
            ],
          }
        : {};

    const totalPosts = await Posts.countDocuments(filter);
    const posts = await Posts.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageNum * limiter)
      .populate({
        path: "userId",
        select: "email",
      });

    return res
      .status(200)
      .json({ success: true, result: { posts, totalPosts } });
  } catch (error) {
    console.log(error);
  }
};

export const getPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const { error, value } = getSinglePostValidator.validate({ postId });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const post = await Posts.findOne({ _id: postId }).populate({
      path: "userId",
      select: "email",
    });

    if (!post) {
      return res.status(401).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.log(error);
  }
};

export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, description, category, code } = req.body;
  const { userId } = req.user;

  try {
    const { error, value } = updatePostValidator.validate({
      title,
      description,
      postId,
      userId,
      code,
      category,
    });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const currentPost = await Posts.findById(postId);
    if (currentPost.userId.toString() !== userId) {
      console.log(userId);
      console.log(currentPost.userId);

      return res.status(401).json({
        success: false,
        message: "Creator only can edit this post",
      });
    }

    currentPost.title = title;
    currentPost.description = description;
    currentPost.category = category;
    currentPost.code = code;

    await currentPost.save();

    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
      updatedPost: currentPost,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;
  try {
    const { error, value } = deletePostValidator.validate({
      postId,
    });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const currentPost = await Posts.findById(postId);

    if (!currentPost) {
      return res.status(401).json({
        success: false,
        message: "No post found",
      });
    }

    if (currentPost.userId.toString() !== userId) {
      return res.status(401).json({
        success: false,
        message: "Creator only can delete post",
      });
    }

    await Posts.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;

  try {
    const { error, value } = likePostValidator.validate({ postId });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const currentPost = await Posts.findById(postId);

    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: "No post found",
      });
    }

    if (currentPost.likes.includes(userId)) {
      currentPost.likes = currentPost.likes.filter((ele) => ele !== userId);
      currentPost.noOfLikes--;
    } else {
      currentPost.likes.push(userId);
      currentPost.noOfLikes++;
    }

    await currentPost.save();

    return res.status(200).json({
      success: true,
      message: "Like status updated successfully",
      likes: currentPost.likes.length,
    });
  } catch (error) {
    console.error(error);
  }
};
