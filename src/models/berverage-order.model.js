const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BeverageOrderSchema = new Schema({
  employeeID: { type: String, required: true },
  username: { type: String, required: true },
  teaQuantity: { type: Number, required: true },
  teaAmount: { type: String },
  coffeeQuantity: { type: Number, required: true },
  coffeeAmount: { type: String },
  notes: { type: String, default: "" },
  roomNumber: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  orderStatus: {
    type: String,
    default: "applied",
  },
});

const BeverageOrder = mongoose.model("BeverageOrder", BeverageOrderSchema);

module.exports = BeverageOrder;
