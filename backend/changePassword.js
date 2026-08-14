const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Employee = require("./models/Employee");

const changeAdminCredentials = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");

    // ==========================================
    // CHANGE THESE THREE VALUES
    // ==========================================

    const oldEmail = "admin@hrm.com";
    const newEmail = "admin@hrmsystem.com";
    const newPassword = "Admin@12345";

    // ==========================================
    // FIND EXISTING ADMIN
    // ==========================================

    const employee = await Employee.findOne({
      email: oldEmail.toLowerCase().trim(),
    });

    if (!employee) {
      console.log("❌ Admin account not found.");
      console.log("Email searched:", oldEmail);

      await mongoose.connection.close();
      return;
    }

    console.log("✅ Admin account found.");
    console.log("Employee ID:", employee.employeeId);

    // ==========================================
    // HASH NEW PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // ==========================================
    // UPDATE EMAIL + PASSWORD
    // ==========================================

    employee.email = newEmail.toLowerCase().trim();
    employee.password = hashedPassword;
    employee.role = "admin";
    employee.status = "Active";

    await employee.save();

    console.log("");
    console.log("=================================");
    console.log("✅ ADMIN CREDENTIALS UPDATED");
    console.log("=================================");
    console.log("New Email:", newEmail);
    console.log("New Password:", newPassword);
    console.log("Role:", employee.role);
    console.log("Status:", employee.status);
    console.log("=================================");

    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("❌ Credential update error:", error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore close error
    }
  }
};

changeAdminCredentials();

