const fs = require("fs");
const path = require("path");
const { default: axios } = require("axios");
const sha256 = require("js-sha256").sha256;
const { connectDB, disconnectDB } = require("../config/db");
const mongoose = require("mongoose");
const Collection = require("../models/collection.model");

require("dotenv").config();

const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

const fetchCollections = async () => {
  try {
    console.log("*************************************");
    console.log("*** Fetching collections...");

    const message = JSON.stringify({
      action: "get_collections",
      limit: 10000,
      page: 1,
    });

    const hmac = sha256.hmac(api_secret, message);
    const params = { api_key: api_key, hmac: hmac, message: message };
    const result = await axios.get(process.env.API_URL, { params: params });

    if (result.data.success) {
      const jsonObject = result.data.collections;
      if (jsonObject) {
        const directoryPath = __basedir + "/public/assets/";
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath);
        }

        fs.writeFileSync(
          directoryPath + "collections.db",
          JSON.stringify(jsonObject)
        );

        // await saveCollections();
      }

      console.log("*** All collections fetched. Total: ", jsonObject.length);
      console.log("*************************************");
    }
  } catch (err) {
    console.log(err);
  }
};

const saveCollections = async () => {
  try {
    let collectionsTempArray = [];
    const jsonArray = readCollectionsFromFile("collections.db");
    for (const collection of jsonArray) {
      const data = {
        typeId: collection.type_id,
        key: collection.collection_id,
        contractAddress: collection.type_id,
        name: collection.collection_name,
        description: "",
        ownerAddr: "",
        site: collection.site,
        projectImage: collection.image_url,
        bannerImage:
          collection.site === "opentheta"
            ? `https://images.opentheta.io/banners/${collection.type_id}.jpg`
            : "",
        creator: {
          name: collection.creator_name,
          image: collection.creator_image_url,
        },
        network: "theta",
        social: {},
        visible: collection.site === "opentheta",
      };

      const existing = collectionsTempArray.find((a) => a.key === data.key);

      if (!existing) {
        collectionsTempArray.push(data);
      }
    }

    let collectionsArray = [];
    for (let collection of collectionsTempArray) {
      const collectionInfo = organizeNftFiles(collection.typeId);

      if (collectionInfo) {
        collection.contractAddress = collectionInfo.contractAddress;
        collection.description = collectionInfo.description;
        collection.ownerAddr = collectionInfo.ownerAddr;
        collection.social = collectionInfo.social;
      }

      collectionsArray.push(collection);
    }

    console.log(collectionsArray.length);

    const bulkOperations = collectionsArray.map((collection) => {
      const { key } = collection;

      return {
        updateOne: {
          filter: { key },
          update: collection,
          upsert: true,
        },
      };
    });

    // await connectDB();

    // Create a new model for the specific collection
    const CollectionModel = mongoose.model("collections", Collection.schema);

    // Perform the bulk write operation
    await CollectionModel.bulkWrite(bulkOperations);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    // await disconnectDB();
  }
};

const organizeNftFiles = (typeId) => {
  const directoryPath = __basedir + "/public/assets/nfts/";
  console.log("Starting...", typeId);
  try {
    // get contract address of collection
    const nftArray = readNFTsFromFile(typeId);
    if (nftArray === null || nftArray.length === 0) {
      return null;
    }

    const defaultNFT = nftArray[0];
    console.log("***** contract address", defaultNFT.contract_address);

    const existingFile = existDbFile(defaultNFT.contract_address);
    if (existingFile) {
      console.log("///////////////////// File exist");
      return null;
    }

    // loop all files and get all nfts for collection
    const files = fs.readdirSync(directoryPath);

    let allNfts = [];
    // Loop through each banner file
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileStats = fs.statSync(filePath);
      if (fileStats.isDirectory()) {
        console.log("************ File is directory", filePath);
        continue;
      }

      const fileName = path.parse(file).name;
      const jsonArray = readNFTsFromFile(fileName);
      if (jsonArray !== null && jsonArray.length > 0) {
        const firstNft = jsonArray[0];
        if (
          firstNft.contract_address.toUpperCase() ===
          defaultNFT.contract_address.toUpperCase()
        ) {
          console.log("************************ Add NFTs", fileName);
          const nfts = getNFTsOnlyOfCollection(
            jsonArray,
            defaultNFT.contract_address
          );
          if (nfts && nfts.length > 0) {
            if (allNfts.length === 0) {
              allNfts = nfts;
            } else {
              for (const nft of nfts) {
                const existingNft = allNfts.find(
                  (a) => a.token_id === nft.token_id
                );

                if (!existingNft) {
                  allNfts.push(nft);
                }
              }
            }
          }
          console.log("************************ Add NFTs", nfts.length);
        }
      }
    }
    console.log("***** All NFTs", allNfts.length);
    if (allNfts.length === 0) {
      return null;
    }

    const saveData = JSON.stringify({ nfts: allNfts });

    // Save data to json file as json format
    const saveDir = directoryPath + "new/";
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir);
    }

    fs.writeFileSync(saveDir + defaultNFT.contract_address + ".db", saveData);

    return getCollectionInfo(defaultNFT);
  } catch (error) {
    console.error("Error at organizeNftFiles:", error);
  }
};

// Get only nfts of collections
const getNFTsOnlyOfCollection = (nfts, contractAddress) => {
  let ret = [];
  for (const nft of nfts) {
    if (nft.contract_address.toUpperCase() === contractAddress.toUpperCase()) {
      ret.push(nft);
    }
  }
  return ret;
};

// Get collection info a file
const getCollectionInfo = (defaultNFT) => {
  const contractAddress = (defaultNFT && defaultNFT.contract_address) || "";
  const description =
    (defaultNFT && defaultNFT.metadata && defaultNFT.metadata.description) ||
    "";
  let ownerAddr =
    (defaultNFT && defaultNFT.metadata && defaultNFT.metadata["wallet-addr"]) ||
    "";
  ownerAddr =
    (defaultNFT &&
      defaultNFT.metadata &&
      defaultNFT.metadata.properties &&
      defaultNFT.metadata.properties.artist &&
      defaultNFT.metadata.properties.artist["wallet-addr"]) ||
    ownerAddr;

  return {
    contractAddress: contractAddress,
    description: description,
    ownerAddr: ownerAddr,
    social: getSocialInfo(defaultNFT),
  };
};

const getSocialInfo = (nft) => {
  let socialsObject = {};
  socialsObject.twiter = (nft.metadata && nft.metadata.twiter) || "";
  socialsObject.website = (nft.metadata && nft.metadata.external_url) || "";

  socialsObject.telegram =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.telegram) ||
    "";
  socialsObject.telegram =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.telegram) ||
    "";

  socialsObject.twitter =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.twitter) ||
    socialsObject.twiter;

  socialsObject.facebook =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.facebook) ||
    "";

  socialsObject.instagram =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.instagram) ||
    "";

  socialsObject.discord =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.discord) ||
    "";

  socialsObject.tiktok =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.tiktok) ||
    "";

  socialsObject.youtube =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.youtube) ||
    "";

  socialsObject.medium =
    (nft.metadata &&
      nft.metadata.properties &&
      nft.metadata.properties.artist &&
      nft.metadata.properties.artist.medium) ||
    "";

  return socialsObject;
};

// Read collections from a file
const readCollectionsFromFile = (filename) => {
  try {
    const directoryPath = __basedir + "/public/assets/";
    const collectionsData = fs.readFileSync(directoryPath + filename, "utf8");
    return JSON.parse(collectionsData);
  } catch (err) {
    console.log(
      `Error readCollectionsFromFile => ${filename} : " ${err.message}`
    );
    return [];
  }
};

// Read nfts from a file
const readNFTsFromFile = (filename) => {
  try {
    const directoryPath = __basedir + "/public/assets/nfts/";
    const nftData = fs.readFileSync(directoryPath + filename, "utf8");
    return JSON.parse(nftData).nfts;
  } catch (err) {
    console.log(`Error readNFTsFromFile => ${filename} : " ${err.message}`);
    return [];
  }
};

const existDbFile = (filename) => {
  try {
    const directoryPath = __basedir + "/public/assets/nfts/new/";
    return fs.existsSync(directoryPath + filename + ".db", "utf8");
    return JSON.parse(nftData).nfts;
  } catch (err) {
    // console.log(`Error readNFTsFromFile => ${filename} : " ${err.message}`);
    return false;
  }
};

/*********************************************************** */
/******************************** Process NFTs ************* */
/*************************************************************/

const fetchNFTs = async (req, res) => {
  try {
    const directoryPath = __basedir + "/public/assets/nfts/";
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    // Get items for current page
    // Get all collections for visible
    const collections = readCollectionsFromFile("collections.db");

    let total = 0;
    for (const collection of collections) {
      console.log("Fetching " + collection.type_id);
      const nfts = await fetchNFTsForCollection(collection.type_id);
      const jsonObject = { nfts: nfts };
      fs.writeFileSync(
        directoryPath + collection.type_id,
        JSON.stringify(jsonObject)
      );

      total += 1;
      // console.log(
      //   collections[i].collectionAddress + " : " + nfts.length + " : " + total
      // );

      // for (let j = 0; j < nfts.length; j++) {
      //   await create(nfts[j]);
      // }
    }

    console.log("NFTs stored Successfully!" + " Total: " + total);
  } catch (err) {
    console.log(err);
  }
};

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

module.exports = {
  fetchCollections,
  saveCollections,
  fetchNFTs,
};
