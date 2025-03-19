import {
  acceptCodeValidator,
  changePasswordValidator,
  FPvalidator,
  signInValidator,
  signUpValidator,
} from "../middlewares/validator.js";
import User from "../models/userModel.js";
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing.js";
import jwt from "jsonwebtoken";
import transport from "../middlewares/sendMail.js";

export const checkSign = async (req, res) => {
  const { email } = req.user;
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const token = jwt.sign(
        {
          userId: existingUser._id,
          email: existingUser.email,
          verified: existingUser.verified,
        },
        process.env.TOKEN_SECRET
      );

      return res
        .cookie("Authorization", `Bearer ${token}`, {
          expires: new Date(Date.now() + 8 * 36000000),
          httpOnly: process.env.NODE_ENV === "production", 
          secure: process.env.NODE_ENV === "production",
        })
        .status(201)
        .json({
          success: true,
          message: "Loggedin successfully",
          user: {
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,
          },
        });
    }
    return res
      .status(401)
      .json({ success: false, message: "User does not exist" });
  } catch (error) {
    console.log(error);
  }
};

export const signUp = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signUpValidator.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ message: error.details[0].message, success: false });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exist" });
    }

    const hashedPassword = await doHash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();
    result.password = undefined;

    res.status(201).json({
      success: true,
      message: "Your account is created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signInValidator.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }

    const result = await doHashValidation(password, existingUser.password);

    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credintials" });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET
    );

    res
      .cookie("Authorization", `Bearer ${token}`, {
        expires: new Date(Date.now() + 8 * 36000000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .status(201)
      .json({
        success: true,
        message: "Loggedin successfully",
        user: {
          userId: existingUser._id,
          email: existingUser.email,
          verified: existingUser.verified,
        },
      });
  } catch (error) {
    console.log(error);
  }
};

export const signOut = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "Loggedout Successfully" });
};

export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: true, message: "You are already verified" });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();

    const info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: email,
      subject: "🔐 Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #333;">🔐 Verify Your Account</h2>
          <p style="text-align: center; color: #555; font-size: 16px;">
            Use the verification code below to complete your sign-up process:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 22px; font-weight: bold; color: #007BFF; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              ${codeValue}
            </span>
          </div>
          <p style="color: #777; font-size: 14px; text-align: center;">
            This code is valid for **5 minutes**. Do not share it with anyone.
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="text-align: center; color: #777; font-size: 12px;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_SECRET_KEY
      );
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(201).json({ success: true, message: "Code sent!" });
    }

    res.status(401).json({ success: false, message: "Code send failed" });
  } catch (error) {
    console.log(error);
  }
};

export const verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;

  try {
    const { error, value } = acceptCodeValidator.validate({
      email,
      providedCode,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();

    const currentUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (currentUser.verified) {
      return res
        .status(200)
        .json({ success: true, message: "You are already verified" });
    }

    if (
      !currentUser.verificationCode ||
      !currentUser.verificationCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Something wrong with the code" });
    }

    if (Date.now() - currentUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "Code Expired" });
    }

    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_SECRET_KEY);

    if (hashedCodeValue === currentUser.verificationCode) {
      currentUser.verified = true;
      currentUser.verificationCode = undefined;
      currentUser.verificationCodeValidation = undefined;
      await currentUser.save();

      return res
        .status(200)
        .json({ success: true, message: "Your account is verified!" });
    } else {
      return res.status(400).json({ success: false, message: "Wrong code!" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const changePassword = async (req, res) => {
  const { userId, email, verified } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    const { error, value } = changePasswordValidator.validate({
      oldPassword,
      newPassword,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    if (!verified) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Verified" });
    }

    const existingUser = await User.findOne({ _id: userId }).select(
      "+password"
    );
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const result = await doHashValidation(oldPassword, existingUser.password);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credintials" });
    }

    const hashedPassword = await doHash(newPassword, 10);
    existingUser.password = hashedPassword;

    await existingUser.save();

    return res
      .status(200)
      .json({ success: true, message: "Password Changed!" });
  } catch (error) {
    console.log(error);
  }
};

export const sendFPVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();

    const info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: email,
      subject: "🔐 Forget Password Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #333;">🔐 Verify Your Account</h2>
          <p style="text-align: center; color: #555; font-size: 16px;">
            Use the verification code below to complete your sign-up process:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 22px; font-weight: bold; color: #007BFF; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              ${codeValue}
            </span>
          </div>
          <p style="color: #777; font-size: 14px; text-align: center;">
            This code is valid for **5 minutes**. Do not share it with anyone.
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="text-align: center; color: #777; font-size: 12px;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_SECRET_KEY
      );
      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(201).json({ success: true, message: "Code sent!" });
    }

    res.status(401).json({ success: false, message: "Code send failed" });
  } catch (error) {
    console.log(error);
  }
};

export const verifyFPVerificationCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;

  try {
    const { error, value } = FPvalidator.validate({
      email,
      providedCode,
      newPassword,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();

    const currentUser = await User.findOne({ email }).select(
      "+forgotPasswordCode +forgotPasswordCodeValidation"
    );

    if (
      !currentUser.forgotPasswordCode ||
      !currentUser.forgotPasswordCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Something wrong with the code" });
    }

    if (Date.now() - currentUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "Code Expired" });
    }

    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_SECRET_KEY);

    if (hashedCodeValue === currentUser.forgotPasswordCode) {
      const resultPass = await doHash(newPassword, 10);
      currentUser.password = resultPass;
      currentUser.forgotPasswordCode = undefined;
      currentUser.forgotPasswordCodeValidation = undefined;
      await currentUser.save();

      return res
        .status(200)
        .json({ success: true, message: "Password Changed!" });
    } else {
      return res.status(400).json({ success: false, message: "Wrong code!" });
    }
  } catch (error) {
    console.log(error);
  }
};
