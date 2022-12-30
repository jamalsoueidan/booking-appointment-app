import mongoose from "mongoose";

export default async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
    console.log("Connecting to MongoDB Atlas cluster...");
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
  }
};
