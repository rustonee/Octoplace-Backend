const mongoose = require("mongoose");

// Define the schema
const attributeSchema = new mongoose.Schema({
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
  value: {
    // type: String,
  },
  type: {
    type: String,
  },
});

// Create the model
const Attribute = mongoose.model("Attribute", attributeSchema);

module.exports = Attribute;
