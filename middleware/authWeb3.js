const Web3Token = require("web3-token");
const { isAddress } = require("@ethersproject/address");

const verifyWeb3Token = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).send("A token is required for authentication");
  }

  try {
    const { address } = await Web3Token.verify(token, {
      domain: "octoplace.io",
    });

    if (!isAddress(address)) {
      return res.status(401).send("A token is required for authentication");
    }

    res.header("Access-Control-Expose-Headers", "x-token");

    req.address = address;

    // Send the token in each request
    res.setHeader("x-token", token);
  } catch (err) {
    console.log(err);
    return res.status(401).send("Invalid Token");
  }

  return next();
};

module.exports = verifyWeb3Token;
