const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const { mongodbConfig } = require("./config/db.config");

const db = require("./models/index");

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth.route");
const bannersRouter = require("./routes/banner.route");
const collectionRouter = require("./routes/collection.route");
const nftRouter = require("./routes/nft.route");
const usersRouter = require("./routes/users.route");
const marketplaceRouter = require("./routes/market.route");
const collectionSettingsRouter = require("./routes/collection.setting");
const analyticsRouter = require("./routes/analyze.route");
const discussionsRouter = require("./routes/discussion.route");

const bgController = require("./controllers/background.controller");

const app = express();

global.__basedir = __dirname;

// Connect to MongoDB
mongoose
  .connect(mongodbConfig.connectionUrl, mongodbConfig.connectionOptions)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Connect to Mysql
db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/banners", bannersRouter);
app.use("/collections", collectionRouter);
app.use("/items", nftRouter);
app.use("/users", usersRouter);
app.use("/marketplace", marketplaceRouter);
app.use("/collection-setting", collectionSettingsRouter);
app.use("/discussions", discussionsRouter);
app.use("/analytics", analyticsRouter);

let bgProcessRunning = false;

app.get("/bgprocess/status", (req, res) => {
  // Check if the background process is already running
  if (bgProcessRunning) {
    res.send("Background process is still running");
  } else {
    // Send response to the client
    res.send("Background process finished");
  }
});

app.get("/bgprocess/collections/fetch", (req, res) => {
  // Check if the background process is already running
  if (bgProcessRunning) {
    res.send("Background process is still running");
  } else {
    // Call the background process function
    processFetchCollections();

    // Set the flag to indicate the process is running
    bgProcessRunning = true;

    // Send response to the client
    res.send("Background process initiated");
  }
});

app.get("/bgprocess/collections/save", (req, res) => {
  // Check if the background process is already running
  if (bgProcessRunning) {
    res.send("Background process is still running");
  } else {
    // Call the background process function
    processSaveCollections();

    // Set the flag to indicate the process is running
    bgProcessRunning = true;

    // Send response to the client
    res.send("Background process initiated");
  }
});

app.get("/bgprocess/nfts/fetch", (req, res) => {
  // Check if the background process is already running
  if (bgProcessRunning) {
    res.send("Background process is still running");
  } else {
    // Call the background process function
    processFetchNfts();

    // Set the flag to indicate the process is running
    bgProcessRunning = true;

    // Send response to the client
    res.send("Background process initiated");
  }
});

const processFetchCollections = async () => {
  await bgController.fetchCollections();

  // Set the flag to indicate the process has finished
  bgProcessRunning = false;
};

const processSaveCollections = async () => {
  await bgController.saveCollections();

  // Set the flag to indicate the process has finished
  bgProcessRunning = false;
};

const processFetchNfts = async () => {
  await bgController.fetchNFTs();

  // Set the flag to indicate the process has finished
  bgProcessRunning = false;
};

module.exports = app;
