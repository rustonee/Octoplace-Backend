const mongoose = require("mongoose");

// Define the schema
const collectionDiscussionSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    require: true,
    index: true,
  },
  message: {
    type: String,
    require: true,
  },
  senderAddress: {
    type: String,
    require: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const collectionDiscussion = mongoose.model(
  "Collection-discussions",
  collectionDiscussionSchema
);

module.exports = collectionDiscussion;
