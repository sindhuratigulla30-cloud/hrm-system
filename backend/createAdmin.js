const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Employee = require("./models/Employee");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@hrm.com";
    const password = "admin@HRM123";

    const existingAdmin = await Employee.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists.");

      existingAdmin.password = await bcrypt.hash(password, 10);
      existingAdmin.role = "admin";
      existingAdmin.status = "Active";

      await existingAdmin.save();

      console.log("Existing account converted to admin.");
      console.log("Email:", email);
      console.log("Password:", password);

      process.exit(0);
    }

    const admin = await Employee.create({
      employeeId: "ADMIN001",
      firstName: "HR",
      lastName: "Administrator",
      email,
      phone: "",
      department: "HR",
      position: "HR Administrator",
      salary: 0,
      status: "Active",
      address: "",
      password: await bcrypt.hash(password, 10),
      role: "admin",
    });

    console.log("Admin account created successfully.");
    console.log("Email:", email);
    console.log("Password:", password);

    console.log("Admin ID:", admin._id);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();