var express = require("express");
var router = express.Router();
const controller = require('../controllers/marketplace.cotroller');

require("dotenv").config();

router.post("/new-listing", controller.createNewListing);
router.post("/update-listing-price", controller.updateListingPrice);
router.post("/execute-sale", controller.executeSale);
router.post("/cancel-sale", controller.cancelListing);
router.get("/get-all", controller.findAll);
router.post("/get-market-item", controller.findOne);

module.exports = router;