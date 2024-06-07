const mongoose = require("mongoose");

// Define the schema
const assetSchema = new mongoose.Schema({
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
  },
  description: {
    type: String,
  },
  video: {
    type: String,
  },
  videoId: {
    type: String,
  },
});

// Create the model
const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;
