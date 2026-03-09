import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";

// Route imports
import authRoutes from "./routes/authRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import questionRoutes from "./routes/questionRoutes";
import assessmentRoutes from "./routes/assessmentRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://assesment-platform.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ---------- Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "Assessment Platform API is running" });
});

// ---------- Start Server ----------
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
