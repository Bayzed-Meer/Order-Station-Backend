const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

router.post("/create-order", verifyAccessToken, orderController.createOrder);
router.get(
  "/get-current-orders",
  verifyAccessToken,
  orderController.getCurrentOrders
);

router.delete(
  "/delete-order/:id",
  verifyAccessToken,
  orderController.deleteOrder
);
router.patch("/cancel-order", verifyAccessToken, orderController.cancelOrder);
router.patch("/approve-order", verifyAccessToken, orderController.approveOrder);
router.patch(
  "/complete-order",
  verifyAccessToken,
  orderController.completeOrder
);

module.exports = router;
