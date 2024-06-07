const util = require("util");
const multer = require("multer");
const path = require('path');

const maxSize = 10 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/public/assets/banners/");
  },
  filename: (req, file, cb) => {
    const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
// }).single("file");
});//.array("bannerImage");

const cpUploadFile = uploadFile.fields([
  { name: 'bannerImage', maxCount: 1 },
  { name: 'avatarImage', maxCount: 1 },
]);

let uploadFileMiddleware = util.promisify(cpUploadFile);
module.exports = uploadFileMiddleware;