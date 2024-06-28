const BeverageOrder = require("../models/berverage-order.model");

exports.createOrder = async (req, res) => {
  try {
    const {
      teaQuantity,
      teaAmount,
      coffeeQuantity,
      coffeeAmount,
      notes,
      roomNumber,
    } = req.body;

    const employeeID = req.user.id;

    const newOrder = new BeverageOrder({
      employeeID,
      teaQuantity,
      teaAmount,
      coffeeQuantity,
      coffeeAmount,
      notes,
      roomNumber,
    });

    await newOrder.save();
    res.status(201).send({ message: "Order successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const employeeID = req.user.id;

    const orders = await BeverageOrder.find({ employeeID }).sort({
      createdAt: -1,
    });

    res.status(200).send(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await BeverageOrder.findByIdAndDelete(id);

    if (!deletedOrder)
      return res.status(404).json({ error: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal erver error" });
  }
};
