import express from "express";
import {
  signUp,
  signIn,
  signOut,
  sendVerificationCode,
  verifyVerificationCode,
  changePassword,
  sendFPVerificationCode,
  verifyFPVerificationCode,
} from "../controllers/authController.js";
import identifyUser from "../middlewares/identifier.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", identifyUser, signOut);
router.patch("/send-verification-code", identifyUser, sendVerificationCode);
router.patch("/verify-verification-code", identifyUser, verifyVerificationCode);
router.patch("/change-password", identifyUser, changePassword);
router.patch("/send-forgotpassword-code", sendFPVerificationCode);
router.patch("/verify-forgotpassword-code", verifyFPVerificationCode);

export default router;
