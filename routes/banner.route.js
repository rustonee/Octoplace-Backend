const express = require("express");
const router = express.Router();
const homecontroller = require("../controllers/home.banner.controller");
const collectioncontroller = require("../controllers/collection.banner.controller");
const verifyJWTToken = require("../middleware/authJWT");

router.post("/home/upload", verifyJWTToken, homecontroller.upload);
router.get("/home/lists", homecontroller.getListFiles);
router.get("/home/get/:name", homecontroller.getFile);

router.post("/collection/upload", verifyJWTToken, collectioncontroller.upload);
router.get("/collection/lists", collectioncontroller.getListFiles);
router.get("/collection/get/:name", collectioncontroller.getFile);

module.exports = router;
