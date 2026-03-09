import mongoose from "mongoose";

/**
 * Connect to MongoDB using the URI from environment variables.
 * Exits the process if connection fails.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/assessment_platform";
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
