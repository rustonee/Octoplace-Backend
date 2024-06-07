const CollectionDiscussion = require("../models/collection.discussion.model");
const NftDiscussion = require("../models/nft.discussion.model");
const { isAddress } = require("@ethersproject/address");

exports.getCollectionDiscussions = async (req, res) => {
  const address = req.query.address;
  const owner = req.query.owner;
  const limits = req.query.limits;

  try {
    // const discussions = await CollectionDiscussion.find({
    //   contractAddress: address,
    //   // senderAddress: owner,
    // }).sort({ _id: "asc" });

    const discussions = await CollectionDiscussion.aggregate([
      { $match: { contractAddress: address } },
      {
        $lookup: {
          from: "octousers",
          localField: "senderAddress",
          foreignField: "walletAddress",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true, // Preserve documents even if there is no matching user
        },
      },
    ]).sort({ _id: "asc" });

    res.status(200).send(discussions.slice(-9));
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message, error: error });
  }
};

exports.createCollectionDiscussions = async (req, res) => {
  const address = req.body.address;
  const sender = req.body.sender;
  const network = req.body.network;
  const message = req.body.message;

  try {
    const discussion = new CollectionDiscussion({
      contractAddress: address,
      senderAddress: sender,
      message: message,
    });

    const result = await discussion.save();
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

exports.getNftDiscussions = async (req, res) => {
  const address = req.query.contract;
  const tokenId = req.query.tokenId;
  const network = req.query.network;

  try {
    const discussions = await NftDiscussion.find({
      contractAddress: address,
      tokenId: tokenId,
    }).sort({ _id: "asc" });

    res.status(200).send(discussions.slice(-9));
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message, error: error });
  }
};

exports.createNftDiscussions = async (req, res) => {
  const address = req.body.contract;
  const sender = req.body.sender;
  const tokenId = req.body.tokenId;
  const network = req.body.network;
  const message = req.body.message;

  try {
    const discussion = new NftDiscussion({
      contractAddress: address,
      tokenId: tokenId,
      senderAddress: sender,
      message: message,
    });

    const result = await discussion.save();
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};
