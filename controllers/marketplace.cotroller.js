const db = require("../models");
const MarketItems = db.marketItems;
const Op = db.Sequelize.Op;
const { isAddress } = require("@ethersproject/address");

exports.createNewListing = async (req, res) => {
  const nftContractAddress = req.body.nftContractAddress;
  if (!req.body.nftContractAddress) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  if (isAddress(nftContractAddress)) {
    //valid address

    const item = {
      NFTContractAddress: req.body.nftContractAddress,
      TokenId: req.body.tokenId,
      SellerAddress: req.body.seller,
      OwnerAddress: req.body.owner,
      HighestOffer: req.body.highestOffer,
      BidderAddress: req.body.bidder,
      Category: req.body.category,
      Price: req.body.price,
      IsSold: req.body.isSold,
      CollectionName: req.body.collectionName,
      TokenName: req.body.tokenName,
      Network: req.body.network,
      MarketId: req.body.marketId,
    };
    try {
      let marketItem = await MarketItems.create(item);
      res.send(marketItem);
    } catch (err) {
      res.status(500).send({
        message:
          err.message ||
          "Octoplace API: Some error occurred while creating the market item.",
      });
      return;
    }
  } else {
    res.status(500).send({
      message: "Invalid Collection Address",
    });
    return;
  }
};

exports.updateListingPrice = async (req, res) => {
  const marketId = req.body.marketId;
  const listingId = req.body.listingId;
  const network = req.body.network;
  if (!req.body.marketId) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  const item = {
    Price: req.body.price,
  };
  try {
    let marketItem = await MarketItems.update(item, {
      where: { MarketId: marketId, Id: listingId, Network: network },
    });
    res.send({
      data: marketItem,
      message: "Price Updated Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Octoplace API: Some error occurred while creating the market item.",
    });
    return;
  }
};

exports.executeSale = async (req, res) => {
  const marketId = req.body.marketId;
  const listingId = req.body.listingId;
  const network = req.body.network;
  if (!req.body.marketId) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  const item = {
    OwnerAddress: req.body.owner,
    IsSold: req.body.isSold,
  };
  try {
    let marketItem = await MarketItems.update(item, {
      where: { MarketId: marketId, Id: listingId, Network: network },
    });
    res.send({
      data: marketItem,
      message: "Sale Executed Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Octoplace API: Some error occurred while creating the market item.",
    });
    return;
  }
};

exports.cancelListing = async (req, res) => {
  const marketId = req.body.marketId;
  const listingId = req.body.listingId;
  const network = req.body.network;
  if (!req.body.marketId) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  const item = {
    OwnerAddress: req.body.seller,
    IsSold: req.body.isSold,
    Price: 0,
  };

  try {
    let marketItem = await MarketItems.update(item, {
      where: { MarketId: marketId, Id: listingId, Network: network },
    });
    res.send({
      data: marketItem,
      message: "Sale Cancelled Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Octoplace API: Some error occurred while creating the market item.",
    });
    return;
  }
};


exports.findOne = async (req, res) => {
  const marketId = req.body.marketId;
  const listingId = req.body.listingId;
  const network = req.body.network;
  if (!req.body.marketId) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  try {
    const marketItem = await MarketItems.findOne({where: {MarketId: marketId, Id: listingId, Network: network}});
    res.send(marketItem);
  }catch (err) {
    res.status(500).send({
        message: err.message || "Some error occurred while fetching the market item.",
      });
      return;
  }
};

exports.findAll = async (req, res) => {
    try {
        const marketItem = await MarketItems.findAll({where: {IsSold: false}});
        // console.log(marketItem);
        res.send(marketItem);
      }catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while fetching the market item.",
          });
          return;
      } 
};
