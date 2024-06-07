const mongoose = require("mongoose");

// Define the schema for the collections
const collectionSettingSchema = new mongoose.Schema({
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
    required: true,
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
  social: {},
  visible: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Create the Collection model
const CollectionSetting = mongoose.model(
  "Collection-Settings",
  collectionSettingSchema
);

module.exports = CollectionSetting;
