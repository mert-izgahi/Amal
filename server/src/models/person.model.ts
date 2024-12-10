import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
    },
    motherName: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    loasingDate: {
      type: Date,
    },
    gender: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Person = mongoose.model("Person", personSchema);
export default Person;
