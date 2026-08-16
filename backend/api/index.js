const app = require("../app");
const connectDB = require("../db");

module.exports = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
      return;
    }

    await connectDB();

    return app(req, res);
  } catch (error) {
    console.error("Serverless handler error:", error);

    res.status(500).json({
      success: false,
      message: "Server failed to start",
      error: error.message,
    });
  }
};
