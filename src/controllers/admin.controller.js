const Admin = require("../models/admin.model");
const Employee = require("../models/employee.model");
const Staff = require("../models/staff.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const tokenUtils = require("../utils/token.utils");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}).select("-password");
    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.findOneAndDelete({ id });

    const deletedEmployee = await User.findOneAndDelete({ id });

    if (!deletedEmployee)
      return res.status(404).json({ message: "Employee not found" });

    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      deletedEmployee.profilePicture
    );

    if (deletedEmployee.profilePicture !== "default-photo.png") {
      if (deletedEmployee.profilePicture && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find({}).select("-password");
    return res.status(200).json(staffs);
  } catch (error) {
    console.error("Error fetching staffs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStaff = await Staff.findOneAndDelete({ id });

    if (!deletedStaff)
      return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
