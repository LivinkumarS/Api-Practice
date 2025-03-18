import Joi from "joi";

export const signUpValidator = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "in"] } }),

  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    ),
});

export const signInValidator = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "in"] } }),

  password: Joi.string().required(),
});

export const acceptCodeValidator = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "in"] } }),
  providedCode: Joi.number().required(),
});

export const changePasswordValidator = Joi.object({
  oldPassword: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    ),
  newPassword: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    ),
});

export const FPvalidator = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "in"] } }),
  providedCode: Joi.number().required(),
  newPassword: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    ),
});

export const createPostValidator = Joi.object({
  title: Joi.string().min(6).max(600).required(),
  description: Joi.string().required(),
  userId: Joi.string().required(),
});

export const getSinglePostValidator = Joi.object({
  postId: Joi.string().required(),
});

export const updatePostValidator = Joi.object({
  title: Joi.string().min(6).max(600).required(),
  description: Joi.string().required(),
  userId: Joi.string().required(),
  postId: Joi.string().required(),
});

export const deletePostValidator = Joi.object({
  postId: Joi.string().required(),
});
