const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/upload");

router.get("/profile", verifyAccessToken, userController.getUserProfile);

router.patch(
  "/updateProfile",
  verifyAccessToken,
  userController.updateUserProfile
);

router.post("/checkIn", verifyAccessToken, userController.dailyCheckIn);

router.get(
  "/checkIn-status",
  verifyAccessToken,
  userController.getCheckInStatus
);

router.post(
  "/upload/profile-picture",
  verifyAccessToken,
  upload,
  userController.uploadProfilePicture
);

module.exports = router;
