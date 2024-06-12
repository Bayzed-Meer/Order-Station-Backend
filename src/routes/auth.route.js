const express = require("express");
const router = express.Router();
const authContoller = require("../controllers/auth.controller");

router.post("/signup", authContoller.signup);

module.exports = router;
