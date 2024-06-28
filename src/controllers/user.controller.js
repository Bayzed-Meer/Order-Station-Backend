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
    const { contactNumber, SBU, jobTitle, mealPreference } = req.body;

    const user = await authenticateUser(req, res, User);

    if (!user) return;

    user.contactNumber = contactNumber || user.contactNumber;
    user.SBU = SBU || user.SBU;
    user.jobTitle = jobTitle || user.jobTitle;
    user.mealPreference = mealPreference || user.mealPreference;

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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(0, 0, 0, 0);

    let checkIn = await CheckIn.findOne({ employeeID, date: tomorrow });

    if (checkIn) {
      checkIn.meal = meal;
      checkIn.workLocation = workLocation;
      checkIn.snacks = snacks;
      await checkIn.save();
      res.status(200).send({ message: "Check-in updated successfully" });
    } else {
      checkIn = new CheckIn({
        employeeID,
        date: tomorrow,
        meal,
        snacks,
        workLocation,
      });
      await checkIn.save();
      res.status(201).send({ message: "Check-in successful" });
    }
  } catch (error) {
    console.error("Error creating/updating check in", error);
    res.status(500).send({ message: "Internal server error", error });
  }
};

exports.getCheckInStatus = async (req, res) => {
  try {
    const employeeID = req.user.id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(0, 0, 0, 0);
    const checkIn = await CheckIn.findOne({ employeeID, date: tomorrow });

    res.status(200).send(checkIn);
  } catch (error) {
    res.status(500).send({ message: "Internal server error", error });
  }
};
