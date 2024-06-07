const mongoose = require("mongoose");

// Define the schema for the Octousers
const OctouserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  bannerImage: {
    type: String,
  },
  avatarImage: {
    type: String,
  },
  telegram: {
    type: String,
  },
  facebook: {
    type: String,
  },
  twitter: {
    type: String,
  },
  instagram: {
    type: String,
  },
  discord: {
    type: String,
  },
  tictok: {
    type: String,
  },
  youtube: {
    type: String,
  },
  medium: {
    type: String,
  },
  nft1: {
    contractAddress: {
      type: String,
    },
    tokenId: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
  },
  nft2: {
    contractAddress: {
      type: String,
    },
    tokenId: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
  },
  nft3: {
    contractAddress: {
      type: String,
    },
    tokenId: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Octouser model
const Octouser = mongoose.model("octouser", OctouserSchema);

module.exports = Octouser;
