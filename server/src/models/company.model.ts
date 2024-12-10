import mongoose from "mongoose";

export interface ICompanyDocument extends mongoose.Document {
  account: mongoose.Schema.Types.ObjectId;
  name?: string;
  industry: string;
  size: string;
  website: string;
  linkedin: string;
  description: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new mongoose.Schema<ICompanyDocument>(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Please add an account"],
    },
    name: {
      type: String,
      required: [true, "Please add a company name"],
      unique: [true, "Company name already exists"],
    },
    industry: {
      type: String,
      required: [true, "Please add a company industry"],
    },
    website: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Please add a company description"],
      max: [500, "Company description cannot be more than 500 characters"],
    },
    logoUrl: {
      type: String,
      required: [true, "Please add a company logo"],
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model<ICompanyDocument>("Company", companySchema);
export default Company;
