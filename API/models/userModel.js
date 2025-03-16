import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is Required"],
      trim: true,
      unique: [true, "Email must be unique"],
      minLength: [5, "Email must have 5 charectors"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
