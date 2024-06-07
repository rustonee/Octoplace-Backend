const fs = require("fs");
const path = require("path");

const upload = async (req, res) => {
  try {
    let bannerObj = req.body.bannerData;
    const index = bannerObj.name;

    const directoryPath = __basedir + "/public/assets/banners/";
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    let data = await readFile(directoryPath, index);
    if (data === null) {
      data = {
        name: index,
        url: "",
        bannerImage: "",
      };
    }

    // save url
    data.url = bannerObj.url;

    // save banner file name if exist
    if (bannerObj.bannerSrc) {
      if (data.filename && fs.existsSync(directoryPath + data.filename)) {
        fs.unlinkSync(directoryPath + data.filename);
      }
      const imageData = bannerObj.bannerSrc;
      data.bannerImage = saveImageFIle("homebanner_", imageData);
    }

    const saveData = JSON.stringify(data);

    // Save data to json file as json format
    fs.writeFileSync(directoryPath + index + ".txt", saveData);
    res.status(200).send({
      message: "File uploaded and data saved successfully",
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.filename}. ${err}`,
    });
  }
};

const getListFiles = async (req, res) => {
  const directoryPath = __basedir + "/public/assets/banners/";

  try {
    const files = fs.readdirSync(directoryPath);

    // Filter only banner files
    const bannerFiles = files.filter((file) => path.extname(file) === ".txt");

    let fileInfos = [];
    // Loop through each banner file
    for (const file of bannerFiles) {
      const fileName = path.parse(file).name;
      if (!fileName.startsWith("banner")) {
        continue;
      }

      const data = await readFile(directoryPath, fileName);
      if (data === null) {
        fileInfos.push({
          name: fileName,
          url: "",
          bannerImage: "",
        });
      }

      fileInfos.push(data);
    }

    res.status(200).send(fileInfos);
  } catch (error) {
    console.error("Unable to get banners:", err);
    res.status(500).send({ message: "Unable to get banners!" });
  }
};

const getFile = async (req, res) => {
  const directoryPath = __basedir + "/public/assets/banners/";
  const index = req.params.name;

  // Read the content of the banner file
  let data = await readFile(directoryPath, index);
  if (data === null) {
    data = {
      name: index,
      url: "",
      bannerImage: "",
    };
  }

  res.status(200).send(data);
};

const readFile = async (path, index) => {
  // Read the content of the banner file
  try {
    const data = await fs.promises.readFile(path + index + ".txt", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/public/assets/banners/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/public/assets/banners/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not delete the file. " + err,
      });
    }

    res.status(200).send({
      message: "File is deleted.",
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/public/assets/banners/";

  try {
    fs.unlinkSync(directoryPath + fileName);

    res.status(200).send({
      message: "File is deleted.",
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete the file. " + err,
    });
  }
};

const saveImageFIle = (name, imageData) => {
  // const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const matches = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/i);
  const type = matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  const fileName = name + "-" + Date.now() + "." + type;
  const directoryPath = __basedir + "/public/assets/banners/";
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  fs.writeFileSync(directoryPath + fileName, buffer);

  return fileName;
};

module.exports = {
  upload,
  getListFiles,
  getFile,
  remove,
  removeSync,
};
