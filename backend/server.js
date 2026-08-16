const app = require("./app");
const connectDB = require("./db");

// ============================================================
// LOCAL DEV SERVER
// Not used on Vercel — see api/index.js for the serverless entry.
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      process.exit(1);
    }

    await connectDB();

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`HRM server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();
