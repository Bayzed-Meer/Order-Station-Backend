const Employee = require("../models/employee.model");
const Staff = require("../models/staff.model");
const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const tokenUtils = require("../utils/token.utils");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (role !== "employee" && role !== "staff")
      return res.status(400).json({ message: "Invalid role" });

    const [existingEmployee, existingStaff] = await Promise.all([
      Employee.findOne({ email }),
      Staff.findOne({ email }),
    ]);

    const existingUser = existingEmployee || existingStaff;

    if (existingUser)
      return res
        .status(400)
        .json({ message: `User already exists as an ${existingUser.role}` });

    const newUser =
      role === "employee"
        ? new Employee({ username, email, password })
        : new Staff({ username, email, password });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [employee, staff, admin] = await Promise.all([
      Employee.findOne({ email }),
      Staff.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    const user = employee || staff || admin;

    if (!user) return res.status(400).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = tokenUtils.generateAccessToken(user);
    const refreshToken = tokenUtils.generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "User signed in successfully",
      accessToken,
    });
  } catch (error) {
    console.error("Error signing in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.signout = (req, res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    expires: new Date(0),
  });
  res.status(200).json({ message: "User signed out successfully" });
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    return res.status(403).json({ message: "Refresh token not provided" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const accessToken = tokenUtils.generateAccessToken(user);
    const refreshToken = tokenUtils.generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.json({ accessToken });
  });
};
