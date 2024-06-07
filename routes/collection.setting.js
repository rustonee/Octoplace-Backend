var express = require("express");
var router = express.Router();
const controller = require('../controllers/collection.settings.controller');

require("dotenv").config();

router.post("/create-collection-setting", controller.create);
router.post("/update-collection-avatar", controller.updateAvatar);
router.post("/update-collection-banner", controller.updateBanner);
router.post("/update-collection-settings", controller.update);
router.get("/get-all-collection-setting", controller.findAll);
router.post("/get-collection-setting", controller.findOne);
router.post("/collection-owner", controller.getCollectionOwner);
router.post("/get-royalty-info", controller.getRoyaltyInfo);
module.exports = router;