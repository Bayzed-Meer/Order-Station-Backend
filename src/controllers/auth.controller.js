const Admin = require("../models/admin.model");
const Employee = require("../models/employee.model");
const Staff = require("../models/staff.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const tokenUtils = require("../utils/token.utils");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.signup = async (req, res) => {
  try {
    const { username, id, email, password, role } = req.body;

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
        ? new Employee({ username, id, email, password })
        : new Staff({ username, id, email, password });

    await newUser.save();

    const newAppUser = new User({
      username,
      email,
      id,
    });

    await newAppUser.save();

    res.status(201).json({ message: `${role} created successfully` });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

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
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const { id } = req.user;

    const [existingAdmin, existingEmployee, existingStaff] = await Promise.all([
      Admin.findOne({ email }),
      Employee.findOne({ email }),
      Staff.findOne({ email }),
    ]);

    const user = existingAdmin || existingEmployee || existingStaff;

    if (!user) return res.status(400).json({ message: "User doesn't exist" });

    if (user.id !== id)
      return res.status(403).json({ message: "Unauthorized access" });

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;

    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!token) return res.status(400).json({ message: "Token is required" });

    let decodedToken;
    try {
      decodedToken = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        });
      });
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res
          .status(401)
          .json({ message: "Token has expired. Please request again!" });
      }
      return res.status(403).json({ message: "Invalid access token" });
    }

    const [existingAdmin, existingEmployee, existingStaff] = await Promise.all([
      Admin.findOne({ email }),
      Employee.findOne({ email }),
      Staff.findOne({ email }),
    ]);

    const user = existingAdmin || existingEmployee || existingStaff;

    if (!user) return res.status(400).json({ message: "User doesn't exist" });

    user.password = password;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [existingAdmin, existingEmployee, existingStaff] = await Promise.all([
      Admin.findOne({ email }),
      Employee.findOne({ email }),
      Staff.findOne({ email }),
    ]);

    const user = existingAdmin || existingEmployee || existingStaff;

    if (!user) return res.status(400).json({ message: "User doesn't exist" });

    const resetToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔒 Password Reset Request",
      text: `
Hi there,
    
We received a request to reset your password. You can reset your password by clicking the link below:
    
${resetLink}
    
⏳ This link will expire in 5 minutes. 
    
If you did not request a password reset, no action is needed. Your account remains secure. 😊
    
Thank you,
The Order Station Team

📧 For any query, contact us at support@example.com.
      `,
    });

    return res.status(200).json({
      message: `A password reset link has been sent to your email (${user.email}) address`,
    });
  } catch (error) {
    console.error("Error sending password reset link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({ accessToken });
  });
};
