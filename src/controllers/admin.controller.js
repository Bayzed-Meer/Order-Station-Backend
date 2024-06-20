const Admin = require("../models/admin.model");
const Employee = require("../models/employee.model");
const Staff = require("../models/staff.model");
const bcrypt = require("bcrypt");
const tokenUtils = require("../utils/token.utils");
const jwt = require("jsonwebtoken");

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
    const deletedEmployee = await Employee.findOneAndDelete({ id });

    if (!deletedEmployee)
      return res.status(404).json({ message: "Employee not found" });

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
