import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const environment = process.env.ENVIRONMENT;
const database_url =
  environment === "dev" ? process.env.MONGODB_LOCAL : process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(database_url);
    console.log(`MongoDB connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
