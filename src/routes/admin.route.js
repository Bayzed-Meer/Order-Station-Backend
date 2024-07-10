const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyAdmin } = require("../middlewares/auth.middleware");

router.get(
  "/employees/getAllEmployees",
  verifyAdmin,
  adminController.getAllEmployees
);
router.delete(
  "/employees/deleteEmployee/:id",
  verifyAdmin,
  adminController.deleteEmployee
);
router.get("/staffs/getAllStaffs", verifyAdmin, adminController.getAllStaffs);
router.delete(
  "/staffs/deleteStaff/:id",
  verifyAdmin,
  adminController.deleteStaff
);

router.get("/getMealSummary", verifyAdmin, adminController.mealSummary);
router.get(
  "/getBeverageSummary",
  verifyAdmin,
  adminController.getBeverageSummary
);

module.exports = router;
