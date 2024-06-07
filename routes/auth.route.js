var express = require("express");
var router = express.Router();
const controller = require("../controllers/auth.controller");
const verifyJWTToken = require("../middleware/authJWT");

require("dotenv").config();

router.post("/login", controller.loginAdmin);
router.post("/update", verifyJWTToken, controller.updateAdmin);
router.get("/profile", verifyJWTToken, controller.getProfile);

module.exports = router;
