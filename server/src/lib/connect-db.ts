import mongoose from "mongoose";
import { logger } from "./logger";

const connectDb = async (connectionString: string) => {
  try {
    await mongoose.connect(connectionString);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

export {connectDb};
