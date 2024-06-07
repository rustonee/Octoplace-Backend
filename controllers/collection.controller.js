const { Contract, JsonRpcProvider, formatUnits } = require("ethers");
const fs = require("fs");
const { default: axios } = require("axios");
const { isAddress } = require("@ethersproject/address");
const { market } = require("../abis/marketplace");
const sha256 = require("js-sha256").sha256;
const Collection = require("../models/collection.model");
const CollectionSetting = require("../models/collection.setting.model");
const CollectionDiscussion = require("../models/collection.discussion.model");
const Asset = require("../models/asset.model");
const NFT = require("../models/nft.model");
const { add } = require("lodash");
const { async } = require("@firebase/util");

exports.updateVisible = async (req, res) => {
  const address = req.body.address;
  const visible = req.body.visible;
  try {
    const existingCollection = await Collection.findOne({
      contractAddress: address,
    });

    if (existingCollection) {
      existingCollection.visible = visible;
      await existingCollection.save();
    }

    res.send({
      data: true,
      message: "Collection Updated Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message:
        error.message ||
        "Some error occurred while updating the collection visible.",
    });
    return;
  }
};

exports.getCollections = async (req, res) => {
  try {
    let {
      page = 0,
      limit = 24,
      name,
      site = "all",
      sort = { site: 1 },
      visible,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = { site: { $ne: "" } };

    if (visible) {
      query.visible = true;
      sort = { _id: 1 };
    }

    if (name) {
      query.name = { $regex: new RegExp(name, "i") };
    }

    if (site && site !== "all") {
      query.site = site;
    }

    const totalCollections = await Collection.count(query);
    const totalPages = Math.ceil(totalCollections / limit);

    const collections = await Collection.find(query)
      .sort(sort)
      .skip(page * limit)
      .limit(limit);

    /*
    const collections = await Collection.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "collection-settings",
          localField: "contractAddress",
          foreignField: "contractAddress",
          as: "setting",
        },
      },
      {
        $addFields: {
          fetched: { $gt: [{ $size: "$setting" }, 0] },
        },
      },
    ])
      .sort(sort)
      .skip(page * limit)
      .limit(limit);
*/
    res.json({
      collections,
      totalPages,
      currentPage: page,
      totalCounts: totalCollections,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error getting collections: " + error.message });
  }
};

exports.getCollectionsGroup = async (req, res) => {
  try {
    const result = await Collection.find(
      { visible: true },
      "contractAddress name"
    ).sort({ name: 1 });

    res.json({
      categories: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error getting categories: " + error.message });
  }
};

exports.getCollection = async (req, res) => {
  const address = req.params.address.toString();
  try {
    // const nftCounts = await NFT.count({
    //   contractAddress: address,
    // });
    const nftCounts = getNftsCountOfCollection(address);

    let collection = await Collection.findOne({
      contractAddress: address,
    });

    // const discussions = await CollectionDiscussion.find({
    //   contractAddress: address,
    // })
    //   .sort({ _id: "desc" })
    //   .limit(3);
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
    ])
      .sort({ _id: "desc" })
      .limit(3);

    const asset = await Asset.findOne({ contractAddress: address }).sort({
      tokenId: 1,
    });

    res.json({
      collection,
      discussions,
      asset: asset || {
        contractAddress: address,
        tokenId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        name: "",
        description: "",
        video: "",
      },
      nftCounts,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error getting collection: " + error.message });
  }
};

exports.saveCollection = async (req, res) => {
  let collectionObj = req.body.collection;
  let assetObj = req.body.asset;
  const address = collectionObj.contractAddress;
  try {
    if (collectionObj.bannerSrc) {
      const imageData = collectionObj.bannerSrc;
      const fileName = "banner_" + address;
      collectionObj.bannerImage = saveImageFIle(fileName, imageData);
    }
    if (collectionObj.projectSrc) {
      const imageData = collectionObj.projectSrc;
      const fileName = "project_" + address;
      collectionObj.projectImage = saveImageFIle(fileName, imageData);
    }

    await Collection.updateOne({ contractAddress: address }, collectionObj);

    // Save asset info
    await saveAsset(assetObj);

    res.send({
      data: true,
      message: "Collection Updated Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message:
        error.message || "Some error occurred while updating the collection.",
    });
    return;
  }
};

exports.getCollectionOwner = async (req, res) => {
  try {
    const address = req.body.address;
    const network = req.body.network;
    const result = await getMarketPlaceDefinedOwner(address, network);
    res.send({ ownerAddress: result });
  } catch (err) {
    res.status(500).send({ message: "Error reading the owner address.", err });
  }
};

const getMarketPlaceDefinedOwner = async (address, network) => {
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  try {
    let contract = {};
    const provider = new JsonRpcProvider(process.env.THETA_RPC);
    contract = new Contract(process.env.THETA_MARKETPLACE, market, provider);
    let result = await contract.getCreatorFeeBasisPoints(address);
    if (result[0].toString() === zeroAddress) {
      result = await contract.getContractOwner(address);
      if (result === zeroAddress) {
        const nftContract = new Contract(address, ownnableAbi, provider);
        const owner = await nftContract.owner();
        return owner;
      }
      return result;
    } else {
      return result[0];
    }
  } catch (err) {
    console.log(err);
    return zeroAddress;
  }
};

const saveAsset = async (asset) => {
  const existingAsset = await Asset.findOne({
    contractAddress: asset.contractAddress,
    tokenId: asset.tokenId,
  });

  if (existingAsset) {
    existingAsset.name = asset.name;
    existingAsset.description = asset.description;
    existingAsset.video = asset.video;
    await existingAsset.save();
  } else {
    const newAsset = new Asset(asset);
    await newAsset.save();
  }
};

const saveImageFIle = (address, imageData) => {
  // const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const matches = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/i);
  const type = matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  const fileName = address + "." + type;
  const directoryPath = __basedir + "/public/assets/collections/";
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  fs.writeFileSync(directoryPath + fileName, buffer);

  return "/assets/collections/" + fileName + "?id=" + Math.random();
};

// Read JSON object from a file
const getNftsCountOfCollection = (filename) => {
  try {
    const directoryPath = __basedir + "/public/assets/nfts/new/";
    const nftData = fs.readFileSync(directoryPath + filename + ".db", "utf8");
    const jsonArray = JSON.parse(nftData).nfts;
    return jsonArray.length;
  } catch (err) {
    console.log(
      `Error getNftsCountOfCollection => ${filename} : " ${err.message}`
    );
    return 0;
  }
};
