const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

router.post("/create-order", verifyAccessToken, orderController.createOrder);
router.get("/get-orders", verifyAccessToken, orderController.getOrders);
router.delete(
  "/delete-order/:id",
  verifyAccessToken,
  orderController.deleteOrder
);

module.exports = router;
