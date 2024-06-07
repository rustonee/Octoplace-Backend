const jwt = require("jsonwebtoken");
require("dotenv").config();

const config = process.env;

const verifyJWTToken = (req, res, next) => {
  const secretKey = process.env.TOKEN_SECRET;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
  } catch (err) {
    console.log(err);
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyJWTToken;
