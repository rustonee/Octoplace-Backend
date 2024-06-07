const mongoose = require("mongoose");

// Define the schema
const nftSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    require: true,
    index: true,
  },
  tokenId: {
    type: String,
    require: true,
    index: true,
  },
  name: {
    type: String,
    require: true,
    index: true,
  },
  description: {
    type: String,
    require: true,
  },
  creator: {
    type: String,
    require: true,
  },
  imageUrl: {
    type: String,
    require: true,
  },
  listedPrice: {
    type: Number,
  },
  total: {
    type: Number,
  },
  offers: {
    type: Number,
  },
  maxListedPrice: {
    type: Number,
  },
  metadataID: {
    type: Number,
  },
  rank: {
    type: Number,
  },
  auctionEnd: {
    type: Number,
  },
  metadata: {},
});

// Create the model
const NFT = mongoose.model("NFT", nftSchema);

module.exports = NFT;
