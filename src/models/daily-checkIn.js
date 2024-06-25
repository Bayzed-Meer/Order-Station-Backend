const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: Date, required: true },
  mealPreference: { type: String, enum: ["regular", "diet"], required: true },
  workLocation: {
    type: String,
    enum: ["wfh", "mirpur", "mohakhali"],
    required: true,
  },
});

const CheckIn = mongoose.model("CheckIn", checkInSchema);

module.exports = CheckIn;
