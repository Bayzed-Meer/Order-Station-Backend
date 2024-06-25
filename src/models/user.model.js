const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    default: "",
  },
  profilePicture: {
    type: String,
    default: "uploads/default-photo.png",
  },
  contactNumber: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
  SBU: {
    type: String,
    default: "",
  },
  jobTitle: {
    type: String,
    default: "",
  },
  mealPreferences: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
