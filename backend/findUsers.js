const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
require("dotenv").config();

const Employee = require("./models/Employee");

const findUsers = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");
    console.log("");

    const employees = await Employee.find(
      {},
      {
        firstName: 1,
        lastName: 1,
        email: 1,
        role: 1,
        status: 1,
      }
    );

    if (employees.length === 0) {
      console.log("❌ No employees found in the database.");
    } else {
      console.log("========== USERS IN DATABASE ==========");

      employees.forEach((employee, index) => {
        console.log(`User ${index + 1}`);
        console.log("Name:", employee.firstName, employee.lastName);
        console.log("Email:", employee.email);
        console.log("Role:", employee.role);
        console.log("Status:", employee.status);
        console.log("--------------------------------------");
      });
    }

    await mongoose.connection.close();

    console.log("");
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("❌ Error:", error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {}
  }
};

findUsers();