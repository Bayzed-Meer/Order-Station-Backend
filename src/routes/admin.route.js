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

module.exports = router;
