const app = require("../app");
const connectDB = require("../db");

module.exports = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "JWT_SECRET is not configured",
      });
    }

    if (!process.env.MONGO_URI) {
      return res.status(500).json({
        success: false,
        message:
          "MONGO_URI is not configured",
      });
    }

    await connectDB();

    return app(req, res);
  } catch (error) {
    console.error(
      "SERVERLESS HANDLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server failed to start",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};