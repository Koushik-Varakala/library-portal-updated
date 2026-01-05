const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api", bookRoutes);
app.use("/api", borrowRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Library Portal API is running...",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      books: "/api",
      admin: "/api/admin",
    },
  });
});
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Library Portal Backend Server        ║
║   Running on port ${PORT}                 ║
║   Environment: ${process.env.NODE_ENV || "development"}              ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
