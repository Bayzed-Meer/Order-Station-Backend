const mongoose = require("mongoose");
const Admin = require("../models/admin.model");

mongoose.connect(
  "mongodb+srv://bayzedmeer7:ETj2EUM5fJc9gLax@cluster0.ebulgt9.mongodb.net/order-station"
);

const newAdmin = new Admin({
  username: "admin",
  email: "admin@gmail.com",
  password: "Admin123$",
});

newAdmin
  .save()
  .then((savedAdmin) => {
    console.log("Admin saved successfully:", savedAdmin);
  })
  .catch((error) => {
    console.error("Error saving admin:", error);
  });
