const { Contract, JsonRpcProvider, formatUnits } = require("ethers");
const CollectionDiscussion = require("../models/collection.discussion.model");
const NftDiscussion = require("../models/nft.discussion.model");
const NFT = require("../models/nft.model");

const { default: axios } = require("axios");
const sha256 = require("js-sha256").sha256;
const _ = require("lodash");

const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

exports.getPopularCollections = async (req, res) => {
  try {
    const results = await CollectionDiscussion.aggregate([
      {
        $lookup: {
          from: "collections",
          localField: "contractAddress",
          foreignField: "contractAddress",
          as: "collection",
        },
      },
      {
        $group: {
          _id: "$contractAddress",
          name: { $first: { $arrayElemAt: ["$collection.name", 0] } },
          image: { $first: { $arrayElemAt: ["$collection.projectImage", 0] } },
          amount: { $sum: 1 },
        },
      },
      {
        $sort: { amount: -1 }, // Sort the result by the 'amount' field in descending order
      },
      {
        $limit: 12, // Limit the result to 12 documents
      },
      {
        $project: {
          _id: 0,
          contractAddress: "$_id",
          name: "$name",
          projectImage: "$image",
          network: "theta",
          amount: "$amount",
        },
      },
    ]);

    res.status(200).send(results);
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

exports.getPopularNFTs = async (req, res) => {
  try {
    const results = await NftDiscussion.aggregate([
      {
        $group: {
          _id: { contractAddress: "$contractAddress", tokenId: "$tokenId" },
          amount: { $sum: 1 },
        },
      },
      {
        $sort: { amount: -1 },
      },
      {
        $project: {
          _id: 0,
          contractAddress: "$_id.contractAddress",
          tokenId: "$_id.tokenId",
          amount: 1,
        },
      },
    ]);

    let conditions = [];
    results.forEach((item, index) => {
      conditions.push({
        contractAddress: item.contractAddress,
        tokenId: "0x" + Number(item.tokenId).toString(16).padStart(64, "0"),
      });
    });

    const nfts = await NFT.find({ $or: conditions.slice(0, 15) });

    res.status(200).send(nfts.slice(0, 12));
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error: error.message });
  }
};
