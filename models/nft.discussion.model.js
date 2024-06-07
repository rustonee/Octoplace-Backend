const mongoose = require("mongoose");

// Define the schema
const nftDiscussionSchema = new mongoose.Schema({
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
  message: {
    type: String,
    require: true,
    index: true,
  },
  senderAddress: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const NftDiscussion = mongoose.model("Nft-discussions", nftDiscussionSchema);

module.exports = NftDiscussion;
