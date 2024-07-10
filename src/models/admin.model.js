const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const validator = require("validator");

const adminSchema = new Schema({
  username: {
    type: String,
    unique: true,
    default: "",
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
    default: "admin",
  },
});

// Hash the password before saving it to the database
adminSchema.pre("save", async function (next) {
  const admin = this;
  if (!admin.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin.password, salt);
    admin.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
