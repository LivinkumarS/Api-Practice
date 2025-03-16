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

  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    ),
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
