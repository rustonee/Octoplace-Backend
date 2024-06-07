const mongoose = require("mongoose");

// Define the schema for the collections
const collectionSchema = new mongoose.Schema({
  typeId: {
    // type_id
    type: String,
    required: true,
    index: true,
  },
  key: {
    // collection_id
    type: String,
    required: true,
    index: true,
  },
  contractAddress: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
  },
  ownerAddr: {
    type: String,
  },
  projectImage: {
    type: String,
  },
  bannerImage: {
    type: String,
  },
  creator: {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  site: {
    type: String,
    // required: true,
  },
  network: {
    type: String,
    required: true,
  },
  social: {},
  visible: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Create the Collection model
const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;

/*
const mongoose = require("mongoose");

// Define the schema for the collections
const collectionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    index: true,
  },
  contractAddress: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
  },
  site: {
    type: String,
    // required: true,
  },
  network: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    // required: true,
  },
  totalSupply: {
    type: Number,
  },
  maxSupply: {
    type: Number,
  },
  market: {
    supply: {
      type: Number,
    },
    launchTimestamp: {
      type: Date,
      default: null,
    },
    volume30d: {
      type: Number,
    },
    lowestPriceTfuel: {
      type: Number,
    },
  },
  mint: {
    mintable: {
      type: Boolean,
    },
    mintableSoon: {
      type: Boolean,
    },
    startTimestamp: {
      type: Date,
      default: null,
    },
    endTimestamp: {
      type: Date,
      default: null,
    },
  },
  creator: {
    name: {
      type: String,
      // required: true,
    },
    image: {
      type: String,
      // required: true,
    },
  },
  visible: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Create the Collection model
const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;
*/
