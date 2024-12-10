import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config";
import { RoleTypes } from "../lib/enums";
import { ICompanyDocument } from "./company.model";
interface IAccountDocument extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider?: string;
  isOnboarded?: boolean;
  compaines: ICompanyDocument[];
  role: RoleTypes;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  comparePassword(password: string): Promise<boolean>;
  generateTokens(): Promise<{ accessToken: string; refreshToken: string }>;
  generatePasswordResetToken(): Promise<string>;
  generateVerificationToken(): Promise<string>;
}

interface IAccountModel extends mongoose.Model<IAccountDocument> {
  findByEmail(email: string): Promise<IAccountDocument | null>;
  findByVerificationToken(token: string): Promise<IAccountDocument | null>;
  findByPasswordResetToken(token: string): Promise<IAccountDocument | null>;
  findByCredentials(
    email: string,
    password: string
  ): Promise<IAccountDocument | null>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  updatePassword(password: string): Promise<IAccountDocument>;
}

const accountSchema = new mongoose.Schema<IAccountDocument, IAccountModel>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(RoleTypes),
      default: RoleTypes.CANDIDATE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

accountSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
  next();
});

accountSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

accountSchema.methods.generateTokens = async function () {
  const accessToken = jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRATION }
  );
  const refreshToken = jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRATION }
  );
  return { accessToken, refreshToken };
};

accountSchema.methods.generatePasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

accountSchema.methods.generateVerificationToken = async function () {
  const verificationToken = crypto.randomBytes(20).toString("hex");
  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  return verificationToken;
};

accountSchema.statics.findByEmail = async function (email: string) {
  return await this.findOne({ email });
};

accountSchema.statics.findByVerificationToken = async function (token: string) {
  return await this.findOne({
    verificationToken: crypto.createHash("sha256").update(token).digest("hex"),
    verificationTokenExpiry: { $gt: Date.now() },
  });
};

accountSchema.statics.findByPasswordResetToken = async function (
  token: string
) {
  return await this.findOne({
    resetPasswordToken: crypto.createHash("sha256").update(token).digest("hex"),
    resetPasswordTokenExpiry: { $gt: Date.now() },
  });
};

accountSchema.statics.findByCredentials = async function (
  email: string,
  password: string
) {
  const account = await this.findByEmail(email);
  if (!account) {
    return null;
  }
  const isPasswordValid = await account.comparePassword(password);
  if (!isPasswordValid) {
    return null;
  }
  return account;
};

const Account = mongoose.model<IAccountDocument, IAccountModel>(
  "Account",
  accountSchema
);
export default Account;
