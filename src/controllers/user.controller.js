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
    const { id } = req.user;
    const { mealPreference, workLocation } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkIn = await CheckIn.findOne({ id, date: today });

    if (checkIn) {
      checkIn.mealPreference = mealPreference;
      checkIn.workLocation = workLocation;
      await checkIn.save();
      res.status(200).send({ message: "Check-in updated successfully" });
    } else {
      checkIn = new CheckIn({
        id,
        date: today,
        mealPreference,
        workLocation,
      });
      await checkIn.save();
      res.status(201).send({ message: "Check-in created successfully" });
    }
  } catch (error) {
    console.error("Error creating/updating check in", error);
    res.status(500).send({ message: "Internal server error", error });
  }
};

exports.getCheckInStatus = async (req, res) => {
  try {
    const { id } = req.user;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = await CheckIn.findOne({ id, date: today });

    res.status(200).send(checkIn);
  } catch (error) {
    res.status(500).send({ message: "Internal server error", error });
  }
};
