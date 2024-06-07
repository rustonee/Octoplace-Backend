const fs = require("fs");
const { isAddress } = require("@ethersproject/address");
const Octouser = require("../models/octouser.model");

// Create and Save a new octouser
exports.create = async (req, res) => {
  const address = req.address;
  if (!address) {
    res.status(500).send({ message: "Content can not be empty!" });
    return;
  }
  if (isAddress(address)) {
    try {
      const user = await Octouser.findOne({ walletAddress: address });
      if (user) {
        res.send(user);
      } else {
        const newUser = new Octouser({
          walletAddress: address,
          title: "",
          description: "",
          bannerImage: "",
          avatarImage: "",
        });

        await newUser.save();
        res.send(newUser);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  } else {
    res.status(500).send({ message: "Invalid Address" });
  }
};

// Find all Octouser
exports.findAll = async (req, res) => {
  try {
    const users = await Octouser.find();
    res.send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

// Find a single Octouser with address
exports.findOne = async (req, res) => {
  const address = req.params.address;
  if (!address) {
    res.status(500).send({ message: "Content can not be empty!" });
    return;
  }

  try {
    const query = { walletAddress: { $regex: new RegExp(address, "i") } };
    const user = await Octouser.findOne(query);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

exports.update = async (req, res) => {
  const address = req.address;
  let userObj = req.body.user;
  try {
    if (userObj.bannerImage) {
      const imageData = userObj.bannerImage;
      const name = "banner_" + address;
      userObj.bannerImage = saveImageFIle(name, imageData);
    }
    if (userObj.avatarImage) {
      const imageData = userObj.avatarImage;
      const name = "avatar_" + address;
      userObj.avatarImage = saveImageFIle(name, imageData);
    }

    const result = await Octouser.updateOne(
      { walletAddress: address },
      userObj
    );

    res.send({
      message: "User setting Updated Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

exports.updateTopNfts = async (req, res) => {
  const address = req.address;
  const topNFT = req.body.topNFT;
  console.log(topNFT);
  try {
    let user = await Octouser.updateOne({ walletAddress: address }, topNFT);
    res.send({
      data: user,
      message: "User's top NFT Updated Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

const saveImageFIle = (address, imageData) => {
  // const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const matches = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/i);
  const type = matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  const fileName = address + "." + type;
  const directoryPath = __basedir + "/public/assets/users/";
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  fs.writeFileSync(directoryPath + fileName, buffer);

  return "/assets/users/" + fileName + "?id=" + Math.random();
};
/*const fs = require("fs");
const db = require("../models");
const Octouser = db.octousers;
const TopNfts = db.octousersTopNfts;
const Op = db.Sequelize.Op;
const { isAddress } = require("@ethersproject/address");

// Create and Save a new octouser
exports.create = async (req, res) => {
  const address = req.body.address;
  if (!req.body.address) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  if (isAddress(address)) {
    try {
      let user = await Octouser.findOne({ where: { walletAddress: address } });
      if (user === null) {
        await TopNfts.create({ walletAddress: address });
        user = await Octouser.create({ walletAddress: address });
        res.send(user);
      } else {
        res.send(user);
      }
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the user.",
      });
      return;
    }
  } else {
    res.status(500).send({
      message: "Invalid Address",
    });
    return;
  }
};

exports.createTopNFTs = async (req, res) => {
  const userId = req.body.userId;
  if (!req.body.userId) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  const top = {
    NftAddress1: req.body.nftAddress1,
    NftAddress2: req.body.nftAddress2,
    NftAddress3: req.body.nftAddress3,
    TokenId1: req.body.tokenId1,
    TokenId2: req.body.tokenId2,
    TokenId3: req.body.tokenId3,
    UserId: req.body.userId,
  };
  try {
    let nfts = await TopNfts.findOne({ where: { UserId: userId } });
    if (nfts === null) {
      nfts = await TopNfts.create(top);
      res.send(nfts);
    } else {
      res.send(nfts);
    }
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the user top nfts.",
    });
    return;
  }
};

exports.update = async (req, res) => {
  let userObj = req.body.user;
  try {
    if (userObj.bannerImage) {
      const imageData = userObj.bannerImage;
      const address = "banner_" + userObj.walletAddress;
      userObj.bannerImage = saveImageFIle(address, imageData);
    }
    if (userObj.avatarImage) {
      const imageData = userObj.avatarImage;
      const address = "avatar_" + userObj.walletAddress;
      userObj.avatarImage = saveImageFIle(address, imageData);
    }

    let user = Octouser.update(userObj, {
      where: {
        walletAddress: userObj.walletAddress,
      },
    });

    res.send({
      data: user,
      message: "User setting Updated Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while updating the user setting.",
    });
    return;
  }
};

exports.updateTopNfts = async (req, res) => {
  const topNFT = req.body.topNFT;

  try {
    let topNFTs = TopNfts.update(topNFT, {
      where: { walletAddress: topNFT.walletAddress },
    });
    res.send({
      data: topNFTs,
      message: "User's top NFT Updated Successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while updating the user top nfts.",
    });
    return;
  }
};
// Retrieve all Tutorials from the database.
exports.findAll = async (req, res) => {
  try {
    let users = await Octouser.findAll();
    res.send(users);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retreiving the users.",
    });
    return;
  }
};

// Find a single Octouser with address
exports.findOne = async (req, res) => {
  const address = req.params.address;
  if (!address) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  try {
    let user = await Octouser.findOne({ where: { walletAddress: address } });
    res.send(user);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the user.",
    });
    return;
  }
};

exports.findUserTopNfts = async (req, res) => {
  const address = req.params.address;
  if (!address) {
    res.status(400).send({
      message: "User can not be empty!",
    });
    return;
  }

  try {
    let nfts = await TopNfts.findOne({ where: { walletAddress: address } });
    res.send(nfts);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while fetching the user nfts.",
    });
    return;
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await Octouser.destroy({
      where: { walletAddress: req.body.address },
    });
    if (result == 1) {
      res.send({ message: "User deleted successfully!" });
    } else {
      res.status(404).send({ message: "User not found!" });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while deleting the user.",
    });
    return;
  }
};

const saveImageFIle = (address, imageData) => {
  // const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const matches = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/i);
  const type = matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  const fileName = address + "." + type;
  const directoryPath = __basedir + "/public/assets/users/";
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  fs.writeFileSync(directoryPath + fileName, buffer);

  return "/assets/users/" + fileName + "?id=" + Math.random();
};
*/
