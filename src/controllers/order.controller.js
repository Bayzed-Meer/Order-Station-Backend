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
    const { username } = req.user;

    const newOrder = new BeverageOrder({
      employeeID,
      username,
      teaQuantity,
      teaAmount,
      coffeeQuantity,
      coffeeAmount,
      notes,
      roomNumber,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCurrentOrders = async (req, res) => {
  try {
    const { id, role } = req.user;

    let query = {};
    if (role === "employee") {
      query = {
        employeeID: id,
        orderStatus: { $in: ["applied", "in progress"] },
      };
    } else if (role === "staff" || role === "admin") {
      query = {
        orderStatus: { $in: ["applied", "in progress"] },
      };
    }

    const orders = await BeverageOrder.find(query).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await BeverageOrder.findByIdAndDelete(id);

    if (!deletedOrder)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal erver error" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.body;
    const { role } = req.user;

    if (role !== "staff" && role !== "admin")
      res.status(401).json({ message: "Access forbiden" });

    const updatedOrder = await BeverageOrder.findByIdAndUpdate(
      id,
      { orderStatus: "cancelled" },
      { new: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ message: "Internal erver error" });
  }
};

exports.approveOrder = async (req, res) => {
  try {
    const { id } = req.body;
    const { role } = req.user;

    if (role !== "staff" && role !== "admin")
      res.status(401).json({ message: "Access forbiden" });

    const updatedOrder = await BeverageOrder.findByIdAndUpdate(
      id,
      { orderStatus: "in progress" },
      { new: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ message: "Order approved successfully" });
  } catch (error) {
    console.error("Error approving order:", error);
    res.status(500).json({ message: "Internal erver error" });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const { id } = req.body;
    const { role } = req.user;

    if (role !== "staff" && role !== "admin")
      res.status(401).json({ message: "Access forbiden" });

    const updatedOrder = await BeverageOrder.findByIdAndUpdate(
      id,
      { orderStatus: "completed" },
      { new: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ message: "Order completed successfully" });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Internal erver error" });
  }
};
