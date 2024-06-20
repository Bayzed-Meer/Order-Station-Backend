const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyAccessToken } = require("../middlewares/auth.middleware");

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", authController.signout);
router.post("/reset-password", verifyAccessToken, authController.resetPassword);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
