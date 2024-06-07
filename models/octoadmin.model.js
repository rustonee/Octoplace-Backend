const mongoose = require("mongoose");

// Define the schema for the Octousers
const OctoadminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
  avatarImage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Octoadmin model
const Octoadmin = mongoose.model("octoadmin", OctoadminSchema);

module.exports = Octoadmin;
