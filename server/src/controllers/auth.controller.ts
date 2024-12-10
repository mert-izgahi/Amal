import { Request, Response } from "express";
import { ApiError } from "../lib/api-error";
import jwt from "jsonwebtoken";
import Account from "../models/account.model";
import config from "../config";
import mailSender from "../lib/mail-sender";

const setTokens = async (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
};

export const createAccount = async (req: Request, res: Response) => {
  const { email, role } = req.body;
  const exsistingAccount = await Account.findByEmail(email);
  if (exsistingAccount) {
    throw ApiError.conflict("Account already exists");
  }

  const account = await Account.create({ ...req.body });

  if (!account) {
    throw ApiError.internal("Something went wrong");
  }
  const { accessToken, refreshToken } = await account.generateTokens();

  await setTokens(res, accessToken, refreshToken);

  const createdAccount = await Account.findById(account._id);
  if (!createdAccount) {
    throw ApiError.notFound("Account not found");
  }
  return res.status(201).json(createdAccount);
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const account = await Account.findByCredentials(email, password);
  if (!account) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  const { accessToken, refreshToken } = await account.generateTokens();
  await setTokens(res, accessToken, refreshToken);
  return res.status(200).json(account);
};

export const signOut = async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Signed out successfully" });
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw ApiError.unauthorized("Unauthorized");
  }
  const decoded = jwt.verify(
    refreshToken,
    config.JWT_REFRESH_SECRET!,
    (err: any, decoded: any) => {
      if (err) {
        return null;
      }
      if (!decoded) {
        return null;
      }
      return decoded;
    }
  ) as any;

  if (!decoded) {
    throw ApiError.unauthorized("Unauthorized");
  }

  const account = await Account.findById(decoded._id);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  const { accessToken, refreshToken: newRefreshToken } =
    await account.generateTokens();

  await setTokens(res, accessToken, newRefreshToken);

  return res.status(200).json(account);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const account = await Account.findByEmail(email);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  const resetToken = await account.generatePasswordResetToken();
  await account.save();
  mailSender.sendPasswordResetEmail(email, resetToken);
  return res.status(200).json({ message: "Password reset email sent" });
};

export const sendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  const account = await Account.findByEmail(email);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  const verificationToken = await account.generateVerificationToken();
  await account.save();
  await mailSender.sendVerificationEmail(email, verificationToken);
  return res.status(200).json({ message: "Verification email sent" });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  const account = await Account.findByVerificationToken(token);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  account.isVerified = true;
  account.verificationToken = undefined;
  account.verificationTokenExpiry = undefined;
  await account.save();
  return res.status(200).json({ message: "Email verified successfully" });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const account = await Account.findByPasswordResetToken(token);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  account.password = password;
  account.resetPasswordToken = undefined;
  account.resetPasswordTokenExpiry = undefined;
  await account.save();
  return res.status(200).json({ message: "Password reset successfully" });
};

export const getAccount = async (req: Request, res: Response) => {
  const account = await Account.findById(res.locals.userId);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  return res.status(200).json(account);
};

export const updateAccount = async (req: Request, res: Response) => {
  const account = await Account.findById(res.locals.userId);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  const updatedAccount = await Account.findByIdAndUpdate(
    res.locals.userId,
    { ...req.body },
    { new: true }
  );
  return res.status(200).json(updatedAccount);
};

export const deleteAccount = async (req: Request, res: Response) => {
  const account = await Account.findById(res.locals.userId);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  await Account.findByIdAndDelete(res.locals.userId);
  return res.status(200).json({ message: "Account deleted successfully" });
};


