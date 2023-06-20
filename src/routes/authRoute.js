const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/glogin", authController.glogin);

module.exports = router;
