const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: Date, required: true },
  mealPreference: { type: String, enum: ["regular", "diet", ""] },
  workLocation: {
    type: String,
    enum: ["wfh", "leave", "mirpur", "mohakhali"],
    required: true,
  },
});

const CheckIn = mongoose.model("CheckIn", checkInSchema);

module.exports = CheckIn;
