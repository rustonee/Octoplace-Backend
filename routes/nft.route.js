var express = require("express");
var router = express.Router();
const controller = require('../controllers/nft.controller');

require("dotenv").config();

router.get("/:address", controller.getNFTsForCollection);
// router.get("/:address", controller.getNfts);
router.get("/:address/:tokenId", controller.getNFTDetail);

// router.get("/api/nfts/backup", controller.backupNFTs);
// router.get("/get-nft-details/:contractAddress/:tokenId", controller.getNFTDetail);
// router.get("/get-collection-items/:typeId", controller.getCollectionItems);
// // for test
// router.get("/get-collection-items-drop/:typeId", controller.getCollectionItemsBack);

module.exports = router;