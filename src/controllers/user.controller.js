const User = require("../models/user.model");
const authenticateUser = require("../utils/auth.utils");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await authenticateUser(req, res, User);

    if (!user) return;

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { contactNumber, SBU, jobTitle, mealPreferences } = req.body;

    const user = await authenticateUser(req, res, User);

    if (!user) return;

    user.contactNumber = contactNumber || user.contactNumber;
    user.SBU = SBU || user.SBU;
    user.jobTitle = jobTitle || user.jobTitle;
    user.mealPreferences = mealPreferences || user.mealPreferences;

    await user.save();
    res
      .status(200)
      .json({ message: "General Info updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const user = await authenticateUser(req, res, User);

    if (!user) return;

    user.profilePicture = req.file.path.replace(/\\/g, "/");

    await user.save();
    res.json({ message: "Profile picture uploaded successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
