import express from "express";
import { tryCatch } from "../middlewares/try-catch.middleware";
import {
  createAccount,
  signIn,
  signOut,
  refreshToken,
  getAccount,
  updateAccount,
  deleteAccount,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  isonboard
} from "../controllers/auth.controller";
import { withAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/sign-up", tryCatch(createAccount));
router.post("/sign-in", tryCatch(signIn));
router.post("/sign-out", tryCatch(signOut));
router.post("/refresh-token", tryCatch(refreshToken));

router.get("/get-account", withAuth, tryCatch(getAccount));
router.put("/update-account", withAuth, tryCatch(updateAccount));
router.delete("/delete-account", withAuth, tryCatch(deleteAccount));

router.post("/forgot-password", tryCatch(forgotPassword));
router.post("/reset-password", tryCatch(resetPassword));

router.post("/send-verification-email", withAuth, tryCatch(sendVerificationEmail));
router.post("/verify-email", tryCatch(verifyEmail));
router.get("/is-onboard", withAuth, tryCatch(isonboard));
export { router as authRouter };
