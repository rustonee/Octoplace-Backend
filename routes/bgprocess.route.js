var express = require("express");
var router = express.Router();
const controller = require("../controllers/background.controller");

router.get("/collections/fetch", controller.fetchCollections);
router.get("/collections/save", controller.saveCollections);

router.get("/nfts/fetch", controller.fetchNFTs);

module.exports = router;
