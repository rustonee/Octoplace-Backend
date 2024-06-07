const express = require("express");
const router = express.Router();
const controller = require("../controllers/discussion.controller");

require("dotenv").config();

router.get("/collection", controller.getCollectionDiscussions);
router.post("/collection", controller.createCollectionDiscussions);
router.get("/nft", controller.getNftDiscussions);
router.post("/nft", controller.createNftDiscussions);

module.exports = router;
