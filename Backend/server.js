import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import resumeRoutes from "./routes/resumeRoutes.js";
import featureRoutes from "./routes/featureRoutes.js";

dotenv.config();
const app = express();

// ⚡ CORS configuration for your frontend
app.use(cors({
    origin: "https://resume-builder-sand-two.vercel.app", // frontend URL
    credentials: true // allow cookies/auth headers
}));

// parse JSON requests
app.use(express.json());

// Routes
app.use("/api/resumes", resumeRoutes);
app.use("/api/feature", featureRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(5000, () => console.log("Server running on 5000"));
