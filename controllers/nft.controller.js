const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const { default: axios } = require("axios");
const sha256 = require("js-sha256").sha256;
const Collection = require("../models/collection.model");
const NFT = require("../models/nft.model");
const Attribute = require("../models/attribute.model");

// const db = require("../models");
// const collectionInstance = db.collection;
// const nftInstance = db.nft;
// const Op = db.Sequelize.Op;

require("dotenv").config();

const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

/*
exports.getNFTsForCollection = async (req, res) => {
  try {
    const address = req.params.address.toString();
    let { page = 1, limit = 24, name, sort = { tokenId: -1 } } = req.query;
    let query = { contractAddress: address };

    page = parseInt(page);
    limit = parseInt(limit);

    if (name) {
      query.name = { $regex: new RegExp(name, "i") };
    }

    const totalNFTs = await NFT.countDocuments(query);
    const totalPages = Math.ceil(totalNFTs / limit);

    const nfts = await NFT.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalAttributes = await Attribute.aggregate([
      { $match: { contractAddress: address } },
      {
        $group: {
          _id: "$name",
          type: { $first: "$type" },
          value: { $addToSet: "$value" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
          type: 1,
        },
      },
    ]);

    const selAttr = [
      { name: "Background", value: ["Chakrapool", "Graygradient"] },
      { name: "Head", value: ["Skeletor", "Theta Green"] },
    ];
    const attributes = await Attribute.aggregate([
      {
        $match: {
          $and: [
            { contractAddress: address },
            {
              $and: selAttr.map(({ name, value }) => ({
                name,
                value: { $in: value },
              })),
            },
          ],
        },
      },
      {
        $group: {
          _id: { name: "$name", value: "$value" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.name",
          values: {
            $addToSet: {
              value: "$_id.value",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          trait_type: "$_id",
          values: 1,
        },
      },
    ]);

    res.json({
      attributes,
      nfts,
      totalPages,
      currentPage: page,
      totalCounts: totalNFTs,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error getting collections: " + error.message });
  }
};
*/

exports.getNfts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 24,
      name,
      sort = { fetched: -1 },
      visible,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = {};
    query.contractAddress = "0xe48f6e05c119bae8e2a30f7637264c29255b061c";

    if (visible) {
      query.visible = true;
      sort = { _id: 1 };
    }

    if (name) {
      query.name = { $regex: new RegExp(name, "i") };
    }

    // const totalCollections = await Collection.countDocuments(query);
    // const totalPages = Math.ceil(totalCollections / limit);

    // const collections = await Collection.find(query)
    //   .sort(sort)
    //   .skip((page - 1) * limit)
    //   .limit(limit);

    const nfts = await NFT.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "attributes",
          localField: "tokenId",
          foreignField: "tokenId",
          as: "attributes",
        },
      },
      // {
      //   $addFields: {
      //     fetched: { $gt: [{ $size: "$attributes" }, 0] },
      //   },
      // },
    ])
      // .sort(sort)
      // .skip((page - 1) * limit)
      .limit(10);

    const totalAttributes = await Attribute.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$name",
          type: { $first: "$type" },
          value: { $addToSet: "$value" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
          type: 1,
        },
      },
    ]);

    res.json({
      count: nfts.length,
      totalAttributes,
      nfts,
      // totalPages,
      // currentPage: page,
      // totalCounts: totalCollections,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error getting collections: " + error.message });
  }
};

exports.getNFTsForCollection = async (req, res, next) => {
  try {
    const contractAddress = req.params.address.toString();
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const searchValue = req.query.name || "";
    const attributes = req.query.attributes || "";

    let selTraits = [];
    if (attributes) {
      selTraits = JSON.parse(attributes);
    }

    const startIndex = page * limit;
    const endIndex = startIndex + limit;

    const collectionNfts = readJSONFromFile(contractAddress);
    let filteredNfts = [];
    if (collectionNfts && collectionNfts.length > 0) {
      let searchedNfts = collectionNfts;
      if (searchValue.length > 0) {
        searchedNfts = collectionNfts.filter((item) => {
          if (item.metadata && item.metadata.name) {
            const name = item.metadata.name.toLowerCase();
            return name.includes(searchValue.toLowerCase());
          }
          return false;
        });
      }

      if (selTraits.length > 0) {
        filteredNfts = searchedNfts.filter((item) =>
          selTraits.every(
            (selAttr) =>
              item.metadata &&
              item.metadata.attributes &&
              item.metadata.attributes.some(
                (attr) =>
                  attr.trait_type === selAttr.trait_type &&
                  selAttr.value.includes(attr.value)
              )
          )
        );
      } else {
        filteredNfts = searchedNfts;
      }
    }

    // const uniqueNfts = [
    //   ...new Map(
    //     filteredNfts.map((item) => [item.metadata && item.metadata.name, item])
    //   ).values(),
    // ];
    // console.log(uniqueNfts);
    // console.log(startIndex);

    const slicedNfts = filteredNfts.slice(startIndex, endIndex);
    let nfts = [];
    slicedNfts.forEach((item) => {
      const nft = {
        contractAddress: item.contract_address,
        tokenId: item.token_id,
        name: (item.metadata && item.metadata.name) || "",
        description: (item.metadata && item.metadata.description) || "",
        imageUrl: (item.metadata && item.metadata.image) || "",
        creator: (item.metadata && item.metadata.creator) || "",
      };

      nfts.push(nft);
    });

    const totalCount = collectionNfts.length;
    const filteredCount = filteredNfts.length;

    let traits = [];
    if (page === 0) {
      traits = getCollectionAttribues(collectionNfts);
      setCollectionAttributes(filteredNfts, traits);
    }

    res.json({
      attributes: traits,
      nfts,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      filtered: filteredCount,
      totalCounts: totalCount,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error getting collections: " + error.message });
  }
};

const getCollectionAttribues = (nfts) => {
  const result = nfts.reduce((acc, item) => {
    if (item.metadata && item.metadata.attributes) {
      item.metadata.attributes.forEach((attr) => {
        const existingAttr = acc.find((a) => a.trait_type === attr.trait_type);
        if (existingAttr) {
          if (!existingAttr.value.find((v) => v.value === attr.value)) {
            existingAttr.value.push({ value: attr.value, count: 0 });
          }
        } else {
          acc.push({
            trait_type: attr.trait_type,
            value: [{ value: attr.value, count: 0 }],
          });
        }
      });
    }

    acc.sort((a, b) => {
      if (a.trait_type < b.trait_type) {
        return -1;
      }
      if (a.trait_type > b.trait_type) {
        return 1;
      }
      return 0;
    });

    return acc;
  }, []);

  return result;
};

const setCollectionAttributes = (nfts, unionAttributes) => {
  nfts.forEach((item) => {
    if (item.metadata && item.metadata.attributes) {
      item.metadata.attributes.forEach((attr) => {
        const existingAttr = unionAttributes.find(
          (a) => a.trait_type === attr.trait_type
        );
        if (existingAttr) {
          const existingValue = existingAttr.value.find(
            (v) => v.value === attr.value
          );
          if (existingValue) {
            existingValue.count++;
          }
        }
      });
    }
  });
};

// Read JSON object from a file
const readJSONFromFile = (filename) => {
  try {
    const directoryPath = __basedir + "/public/assets/nfts/new/";
    const nftData = fs.readFileSync(directoryPath + filename + ".db", "utf8");
    return JSON.parse(nftData).nfts;
  } catch (err) {
    console.log(`Error readJSONFromFile => ${filename} : " ${err.message}`);
    return [];
  }
};

exports.getNFTDetail = async function (req, res, next) {
  const contractAddress = req.params.address.toString();
  const tokenId = req.params.tokenId.toString();
  try {
    const message = JSON.stringify({
      action: "get_nft_details",
      contract_address: contractAddress,
      token_id: Number(tokenId),
    });

    const hmac = sha256.hmac(api_secret, message);
    const params = { api_key: api_key, hmac: hmac, message: message };
    const result = await axios.get(process.env.API_URL, { params: params });

    if (!result.data.success) {
      // next(JSON.stringify({ success: false, message: result.data.message }));
      res.send({ success: false, message: result.data.message });
    } else {
      let tokenInfo = result.data.nft;

      tokenInfo = { ...tokenInfo, network: "theta" };

      res.send({ success: true, nft: tokenInfo }).status(200);
    }
  } catch (error) {
    console.log(error);
    // next(JSON.stringify({ success: false, message: result.data.message }));
    res.send({ success: false, message: error.message });
  }
};

/////////////////////////////////////////

exports.backupNFTs = async () => {
  try {
    console.log("*************************************");
    console.log("*** Fetching collections...");

    const directoryPath = __basedir + "/public/assets/nfts/";

    const message = JSON.stringify({
      action: "get_collections",
      limit: 10000,
      page: 1,
    });

    const hmac = sha256.hmac(api_secret, message);
    const params = { api_key: api_key, hmac: hmac, message: message };
    const result = await axios.get(process.env.API_URL, { params: params });

    if (result.data.success) {
      const collections = result.data.collections;
      if (collections) {
        let total = 0;
        for (const collection of collections) {
          const collectionNfts = readJSONFromFile(collection.type_id);
          if (collectionNfts.length > 0) {
            const nft = collectionNfts[0];
            const contractAddress = nft.contract_address;
            if (!fs.existsSync(directoryPath + contractAddress)) {
              copyRealNFTFile(collection.type_id, contractAddress);
              console.log(
                "Saving " + collection.type_id + " to " + contractAddress
              );
            }
          }

          total += 1;
        }

        console.log("NFTs stored Successfully!" + " Total: " + total);
      }

      console.log("*** All collections fetched. Total: ", collections.length);
      console.log("*************************************");
    }
  } catch (err) {
    console.log(err);
  }
};

// exports.backupNFTs = async (req, res) => {
//   try {
//     const directoryPath = __basedir + "/public/assets/nfts/";
//     if (!fs.existsSync(directoryPath)) {
//       fs.mkdirSync(directoryPath);
//     }

//     // Get all collections from file
//     const collections = readJSONFromFile("collections");

//     let total = 0;
//     for (const collection of collections) {
//       const collectionNfts = readJSONFromFile(collection.contractAddress);
//       if (collectionNfts.length > 0) {
//         const nft = collectionNfts[0];
//         const contractAddress = nft.contract_address;
//         if (!fs.existsSync(directoryPath + contractAddress)) {
//           copyRealNFTFile(collection.contractAddress, contractAddress);
//         }
//       }

//       total += 1;
//     }

//     console.log("NFTs stored Successfully!" + " Total: " + total);
//   } catch (err) {
//     console.log(err);
//   }
// };

// Copy nfts file to real address file
const copyRealNFTFile = (sourceFilePath, destinationFilePath) => {
  try {
    const directoryPath = __basedir + "/public/assets/nfts/";
    fs.copyFileSync(
      directoryPath + sourceFilePath,
      directoryPath + destinationFilePath
    );
  } catch (err) {
    console.log(`Error copyRealNFTFile => : " ${err.message}`);
    return [];
  }
};

// exports.backupNFTs = async (req, res) => {
//   try {
//     const directoryPath = __basedir + "/public/assets/nfts/";
//     if (!fs.existsSync(directoryPath)) {
//       fs.mkdirSync(directoryPath);
//     }

//     // Get items for current page
//     // Get all collections for visible
//     const collections = await Collection.find();

//     let total = 0;
//     for (const collection of collections) {
//       if (collection.site === "opentheta") {
//         continue;
//       }
//       console.log("Fetching " + collection.contractAddress);
//       const nfts = await fetchNFTsForCollection(collection.contractAddress);
//       const jsonObject = { nfts: nfts };
//       fs.writeFileSync(
//         directoryPath + collection.contractAddress,
//         JSON.stringify(jsonObject)
//       );

//       total += 1;
//       // console.log(
//       //   collections[i].collectionAddress + " : " + nfts.length + " : " + total
//       // );

//       // for (let j = 0; j < nfts.length; j++) {
//       //   await create(nfts[j]);
//       // }
//     }

//     console.log("NFTs stored Successfully!" + " Total: " + total);
//   } catch (err) {
//     console.log(err);
//   }
// };

const fetchNFTsForCollection = async (collectionAddress) => {
  try {
    let pagenumber = 1;
    result = await getNftItemsFromAPI(collectionAddress, pagenumber, 0);

    if (result.data && result.data.success) {
      let nftItems = result.data.nfts;
      //check multiple pages
      if (nftItems.length === 1000) {
        let newItems = [];
        do {
          pagenumber += 1;
          const newResult = await getNftItemsFromAPI(
            collectionAddress,
            pagenumber,
            0
          );
          newItems = newResult.data.nfts;
          nftItems = [...nftItems, ...newItems];
        } while (newItems.length === 1000);
      }
      return nftItems;
    }
    return [];
  } catch (err) {
    console.log(
      `Error getNFTsForCollection => ${collectionAddress} : " ${err.message}`
    );
    return [];
  }
};

const getNftItemsFromAPI = async (typeId, pageNumber, limits) => {
  const message = {
    action: "get_collection_nfts",
    type_id: typeId,
    page: pageNumber,
  };

  if (limits > 0) {
    message.limit = limits;
  }

  const paramMsg = JSON.stringify(message);

  const hmac = sha256.hmac(api_secret, paramMsg);
  const params = { api_key: api_key, hmac: hmac, message: paramMsg };
  const result = await axios.get(process.env.API_URL, { params: params });
  return result;
};

/*
// Read JSON object from a file
const readJSONFromFile = (filename) => {
  try {
    const directoryPath = __basedir + "/public/assets/nfts/";
    const nftData = fs.readFileSync(directoryPath + filename, "utf8");
    return JSON.parse(nftData).nfts;
  } catch (err) {
    console.log(`Error readJSONFromFile => ${filename} : " ${err.message}`);
    return [];
  }
};

const getNFTsForCollection = async (collectionAddress) => {
  try {
    let pagenumber = 1;
    result = await getNftItems(collectionAddress, pagenumber, 0);

    if (result.data && result.data.success) {
      let nftItems = result.data.nfts;
      //check multiple pages
      if (nftItems.length === 1000) {
        let newItems = [];
        do {
          pagenumber += 1;
          const newResult = await getNftItems(collectionAddress, pagenumber, 0);
          newItems = newResult.data.nfts;
          nftItems = [...nftItems, ...newItems];
        } while (newItems.length === 1000);
      }
      return nftItems;
    }
    return [];
  } catch (err) {
    console.log(
      `Error getNFTsForCollection => ${collectionAddress} : " ${err.message}`
    );
    return [];
  }
};

// Create and Save a new nft on the database
const create = async (nftObj) => {
  try {
    let nft = await nftInstance.findOne({
      where: {
        contractAddress: nftObj.contract_address,
        tokenId: nftObj.token_id,
      },
    });

    if (nft === null) {
      const newNft = {
        contractAddress: nftObj.contract_address,
        name:
          nftObj.metadata && nftObj.metadata.name
            ? nftObj.metadata.name
            : nftObj.token_id,
        description:
          nftObj.metadata && nftObj.metadata.description
            ? nftObj.metadata.description
            : "",
        imageUrl:
          nftObj.metadata && nftObj.metadata.image ? nftObj.metadata.image : "",
        attributes:
          nftObj.metadata && nftObj.metadata.attributes
            ? JSON.stringify(nftObj.metadata.attributes)
            : "",
        network: "theta",
        tokenId: nftObj.token_id,
        metadata: nftObj.metadata ? JSON.stringify(nftObj.metadata) : "",
      };

      await nftInstance.create(newNft);
    }
  } catch (err) {
    console.log(
      `Error create => ${nftObj.contract_address} : " ${err.message}`
    );
    return;
  }
};

const getNftItems = async (typeId, pageNumber, limits) => {
  const message = {
    action: "get_collection_nfts",
    type_id: typeId,
    page: pageNumber,
  };

  if (limits > 0) {
    message.limit = limits;
  }

  const paramMsg = JSON.stringify(message);

  const hmac = sha256.hmac(api_secret, paramMsg);
  const params = { api_key: api_key, hmac: hmac, message: paramMsg };
  const result = await axios.get(process.env.API_URL, { params: params });
  return result;
};

exports.getCollectionItems = async (req, res, next) => {
  try {
    const contractAddress = req.params.typeId.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchValue = req.query.search || "";
    const attributes = req.query.attributes || "";

    let selTraits = [];
    if (attributes) {
      selTraits = JSON.parse(attributes);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const collectionNfts = readJSONFromFile(contractAddress);
    let filteredNfts = [];
    if (collectionNfts && collectionNfts.length > 0) {
      const searchedNfts = collectionNfts.filter((item) => {
        if (item.metadata && item.metadata.name) {
          const name = item.metadata.name.toLowerCase();
          return name.includes(searchValue.toLowerCase());
        }
        return false;
      });

      if (selTraits.length > 0) {
        filteredNfts = searchedNfts.filter((item) =>
          selTraits.every(
            (selAttr) =>
              item.metadata &&
              item.metadata.attributes &&
              item.metadata.attributes.some(
                (attr) =>
                  attr.trait_type === selAttr.trait_type &&
                  selAttr.value.includes(attr.value)
              )
          )
        );
      } else {
        filteredNfts = searchedNfts;
      }
    }

    const slicedNfts = filteredNfts.slice(startIndex, endIndex);

    const totalCount = collectionNfts.length;
    const filteredCount = filteredNfts.length;

    const traits = getCollectionAttribues(collectionNfts);
    setCollectionAttributes(filteredNfts, traits);

    res.json({
      items: slicedNfts,
      attributes: traits,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      filtered: filteredCount,
      total: totalCount,
    });
  } catch (err) {
    console.log(JSON.stringify(err));
    next(err.message);
  }
};

const getCollectionAttribues = (nfts) => {
  const result = nfts.reduce((acc, item) => {
    if (item.metadata && item.metadata.attributes) {
      item.metadata.attributes.forEach((attr) => {
        const existingAttr = acc.find((a) => a.trait_type === attr.trait_type);
        if (existingAttr) {
          if (!existingAttr.value.find((v) => v.value === attr.value)) {
            existingAttr.value.push({ value: attr.value, count: 0 });
          }
        } else {
          acc.push({
            trait_type: attr.trait_type,
            value: [{ value: attr.value, count: 0 }],
          });
        }
      });
    }
    return acc;
  }, []);

  return result;
};

const setCollectionAttributes = (nfts, unionAttributes) => {
  nfts.forEach((item) => {
    if (item.metadata && item.metadata.attributes) {
      item.metadata.attributes.forEach((attr) => {
        const existingAttr = unionAttributes.find(
          (a) => a.trait_type === attr.trait_type
        );
        if (existingAttr) {
          const existingValue = existingAttr.value.find(
            (v) => v.value === attr.value
          );
          if (existingValue) {
            existingValue.count++;
          }
        }
      });
    }
  });
};

exports.getNFTDetail = async function (req, res, next) {
  try {
    const message = JSON.stringify({
      action: "get_nft_details",
      contract_address: req.params.contractAddress.toString(),
      token_id: Number(req.params.tokenId),
    });
    const hmac = sha256.hmac(api_secret, message);
    const params = { api_key: api_key, hmac: hmac, message: message };
    const result = await axios.get(process.env.API_URL, { params: params });

    if (!result.data.success) {
      next(JSON.stringify({ success: false, message: result.data.message }));
    } else {
      let tokenInfo = result.data.nft;

      tokenInfo = { ...tokenInfo, network: "theta" };

      res.send({ success: true, nft: tokenInfo }).status(200);
    }
  } catch (err) {
    console.log(JSON.stringify(err));
    next(err.message);
  }
};

////////////////////// test /////////////////////////////

// const getUnionArrayAttributes = (jsonArray) => {
//   const result = jsonArray.reduce((acc, item) => {
//     item.metadata.attributes.forEach((attr) => {
//       const existingAttr = acc.find((a) => a.trait_type === attr.trait_type);
//       if (existingAttr) {
//         const existingValue = existingAttr.value.find(
//           (v) => v.value === attr.value
//         );
//         if (existingValue) {
//           existingValue.count++;
//         } else {
//           existingAttr.value.push({ value: attr.value, count: 1 });
//         }
//       } else {
//         acc.push({
//           trait_type: attr.trait_type,
//           value: [{ value: attr.value, count: 1 }],
//         });
//       }
//     });
//     return acc;
//   }, []);

//   return { attributes: result };
// };

// const getCollectionTraits = (nfts) => {
//   let unionTraits = [];
//   if (nfts) {
//     const traits = [];

//     // Loop through each object in the array
//     for (let i = 0; i < nfts.length; i++) {
//       const metadata = nfts[i].metadata;

//       if (!metadata.attributes) {
//         continue;
//       }

//       // Loop through each attribute in the metadata object
//       for (let j = 0; j < metadata.attributes.length; j++) {
//         const attribute = metadata.attributes[j];

//         // Check if the trait_type already exists in the traits array
//         const index = traits.findIndex(
//           (t) => t.trait_type === attribute.trait_type
//         );

//         // If it does, add the value to the existing object only if it doesn't already exist
//         if (index !== -1) {
//           const valueIndex = traits[index].value.findIndex(
//             (v) => v.value === attribute.value
//           );

//           if (valueIndex !== -1) {
//             traits[index].value[valueIndex].count++;
//           } else {
//             traits[index].value.push({ value: attribute.value, count: 1 });
//           }

//           traits[index].count++;
//         } else {
//           // If it doesn't, create a new object with the trait_type, value and count
//           traits.push({
//             trait_type: attribute.trait_type,
//             value: [{ value: attribute.value, count: 1 }],
//             count: 1,
//           });
//         }
//       }
//     }
//     // return traits;
//     unionTraits = [];

//     // Loop through each object in the traits array
//     for (let i = 0; i < traits.length; i++) {
//       const trait = traits[i];

//       // Check if the trait_type value already exists in the unionTraits array
//       const index = unionTraits.findIndex(
//         (t) => t.trait_type === trait.trait_type
//       );

//       // If it does, merge the value arrays only if they don't overlap
//       if (index !== -1) {
//         const mergedValues = unionTraits[index].value.concat(
//           trait.value.filter(
//             (v) => !unionTraits[index].value.some((u) => u.value === v.value)
//           )
//         );
//         unionTraits[index].value = mergedValues;
//         unionTraits[index].count += trait.count;
//       } else {
//         // If it doesn't, create a new object with the trait_type and merged values
//         unionTraits.push({
//           trait_type: trait.trait_type,
//           value: trait.value,
//           count: trait.count,
//         });
//       }
//     }
//   }

//   return unionTraits;
// };

exports.getCollectionItemsBack = async (req, res, next) => {
  try {
    let pagenumber = 1;
    const limit = 0;
    result = await getNftItems(req.params.typeId.toString(), pagenumber, limit);

    if (!result.data.success) {
      next(JSON.stringify({ success: false, message: result.data.message }));
    } else {
      if (result.data) {
        let nftItems = result.data.nfts;
        //check multiple pages
        if (nftItems.length === 1000) {
          let newItems = [];

          do {
            pagenumber += 1;
            const newResult = await getNftItems(
              req.params.typeId.toString(),
              pagenumber,
              limit
            );
            newItems = newResult.data.nfts;
            nftItems = [...nftItems, ...newItems];
          } while (newItems.length === 1000);
        }
        let nfts = nftItems.map((item) => ({ ...item, network: "theta" }));
        res.send({ nfts, items: nfts.length });
      } else {
        next("No collections available");
      }
    }
  } catch (err) {
    console.log(JSON.stringify(err));
    next(err.message);
  }
};

// const getCollectionAttribues = (nfts) => {
//   const result = nfts.reduce((acc, item) => {
//     item.metadata.attributes.forEach((attr) => {
//       const existingAttr = acc.find((a) => a.trait_type === attr.trait_type);
//       if (existingAttr) {
//         if (!existingAttr.value.find((v) => v.value === attr.value)) {
//           existingAttr.value.push({ value: attr.value, count: 0 });
//         }
//       } else {
//         acc.push({
//           trait_type: attr.trait_type,
//           value: [{ value: attr.value, count: 0 }],
//         });
//       }
//     });
//     return acc;
//   }, []);

//   return result;
// };
*/
