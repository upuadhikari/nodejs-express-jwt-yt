import express from "express";
import {
  signup,
  signin,
  verifyUser,
  forgotPassword,
  verifyToken,
  resetPassword,
  refreshToken,
} from "../controllers/user.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", signin);
router.post("/verify", verifyUser);
router.post("/verify-token", verifyToken);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
