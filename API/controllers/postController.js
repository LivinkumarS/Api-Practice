import transport from "../middlewares/sendMail.js";
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

    const currentPost = await Posts.findById(postId).populate({
      path: "userId",
      select: "email",
    });

    if (!currentPost) {
      return res.status(401).json({
        success: false,
        message: "No post found",
      });
    }

    if (
      currentPost.userId._id.toString() !== userId &&
      userId !== process.env.ADMIN_USER_ID
    ) {
      return res.status(401).json({
        success: false,
        message: "Creator only can delete post",
      });
    }

    await Posts.findByIdAndDelete(postId);

    if (
      userId === process.env.ADMIN_USER_ID &&
      currentPost.userId._id.toString() !== process.env.ADMIN_USER_ID
    ) {
      const info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: currentPost.userId.email,
        subject: "❌ Your Post Has Been Deleted",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #d9534f;">❌ Post Deleted</h2>
            <p style="text-align: center; color: #555; font-size: 16px;">
              Your post <strong>"${currentPost.title}"</strong> has been deleted by the admin.
            </p>
            <p style="color: #777; font-size: 14px; text-align: center;">
              If you believe this was a mistake or have any questions, you can contact the admin.
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 16px; font-weight: bold; color: #d9534f; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                Admin Email: <a href="mailto:slivinkumarkrr@gmail.com" style="text-decoration: none; color: #d9534f;">slivinkumarkrr@gmail.com</a>
              </span>
            </div>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="text-align: center; color: #777; font-size: 12px;">
              If you did not create this post or no longer need assistance, you can ignore this email.
            </p>
          </div>
        `,
      });

      if (info.accepted[0] === currentPost.userId.email) {
        return res
          .status(201)
          .json({ success: true, message: "Message  sent!" });
      }
    }

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
