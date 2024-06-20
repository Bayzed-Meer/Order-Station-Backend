const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const validator = require("validator");

const staffSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          value
        );
      },
      message: (props) =>
        `${props.value} is not a valid password! Password must be at least 8 characters containing at least one letter, one digit, one special character, and one capital letter`,
    },
  },
  role: {
    type: String,
    default: "staff",
  },
});

// Hash the password before saving it to the database
staffSchema.pre("save", async function (next) {
  const staff = this;
  if (!staff.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(staff.password, salt);
    staff.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
