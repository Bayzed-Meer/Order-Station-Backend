const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BeverageOrderSchema = new Schema({
  employeeID: { type: String, required: true },
  teaQuantity: { type: Number, required: true },
  teaAmount: { type: String, enum: ["half", "full"], required: true },
  coffeeQuantity: { type: Number, required: true },
  coffeeAmount: { type: String, enum: ["half", "full"], required: true },
  notes: { type: String, default: "" },
  roomNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  orderStatus: {
    type: String,
    enum: ["applied", "in progress", "completed", "cancelled"],
    default: "applied",
  },
});

const BeverageOrder = mongoose.model("BeverageOrder", BeverageOrderSchema);

module.exports = BeverageOrder;
