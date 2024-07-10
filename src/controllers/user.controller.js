const User = require("../models/user.model");
const CheckIn = require("../models/daily-checkIn");
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
    const { contactNumber, SBU, jobTitle, meal } = req.body;

    const user = await authenticateUser(req, res, User);

    if (!user) return;

    user.contactNumber = contactNumber || user.contactNumber;
    user.SBU = SBU || user.SBU;
    user.jobTitle = jobTitle || user.jobTitle;
    user.meal = meal || user.meal;

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

exports.dailyCheckIn = async (req, res) => {
  try {
    const employeeID = req.user.id;
    const { meal, snacks, workLocation } = req.body;

    const now = new Date();
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );

    let checkIn = await CheckIn.findOne({
      employeeID,
      date: tomorrow.getTime(),
    });

    if (checkIn) {
      checkIn.meal = meal;
      checkIn.workLocation = workLocation;
      checkIn.snacks = snacks;
      await checkIn.save();
      res.status(200).json({ message: "Check-in updated successfully" });
    } else {
      checkIn = new CheckIn({
        employeeID,
        date: tomorrow.getTime(),
        meal,
        snacks,
        workLocation,
      });
      await checkIn.save();
      res.status(201).json({ message: "Check-in successful" });
    }
  } catch (error) {
    console.error("Error creating/updating check in", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.getCheckInStatus = async (req, res) => {
  try {
    const employeeID = req.user.id;

    const now = new Date();
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );

    const checkIn = await CheckIn.findOne({
      employeeID,
      date: tomorrow.getTime(),
    });

    res.status(200).json(checkIn);
  } catch (error) {
    console.error("Error fetching check-in status", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
