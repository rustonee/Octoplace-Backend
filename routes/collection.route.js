var express = require("express");
var router = express.Router();
const controller = require("../controllers/collection.controller");
const verifyJWTToken = require("../middleware/authJWT");

router.get("/", controller.getCollections);
router.get("/categories", controller.getCollectionsGroup);
router.post("/updateVisible", verifyJWTToken, controller.updateVisible);
router.post("/:address", verifyJWTToken, controller.saveCollection);
router.get("/:address", controller.getCollection);

router.get("/setting/owner", controller.getCollectionOwner);

// require("dotenv").config();

// router.get("/backup", controller.backupCollections);
// router.post("/update", controller.update);
// router.get("/listAll", controller.findAll);
// router.get("/listAllVisible", controller.findAllForVisible);
// router.get("/listOne/:network/:address", controller.findOne);
// router.get("/download/:name", controller.download);

module.exports = router;
