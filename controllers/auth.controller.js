const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const OctoAdmin = require("../models/octoadmin.model");

// Admin login
exports.loginAdmin = async (req, res) => {
  const secretKey = process.env.TOKEN_SECRET;

  const username = req.body.username;
  const password = req.body.password;

  try {
    console.log(await bcrypt.hash("octoadmin", 10));
    const user = await OctoAdmin.findOne({ username: username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username, role: user.role };
      const expiresIn = "1h"; // Token expiration time

      const accessToken = jwt.sign(payload, secretKey, { expiresIn });

      res.json({
        accessToken,
        user: { username: user.username, role: user.role },
      });

      return;
    }

    res.status(401).json({
      message:
        "Please make sure to enter your username and password correctly.",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error getting collection: " + error.message });
  }
};

exports.getProfile = async (req, res) => {
  const user = await OctoAdmin.findOne();
  res.json({ user: { username: user.username, role: user.role } });
};

// Admin login
exports.updateAdmin = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await OctoAdmin.findOne({ username: username });
    if (user) {
      user.password = await bcrypt.hash(password, 10);

      await OctoAdmin.updateOne({ username: username }, user);

      // const payload = { username: user.username, role: user.role };
      // const expiresIn = "1h"; // Token expiration time

      // const accessToken = jwt.sign(payload, secretKey, { expiresIn });

      res.json({
        user: { username: user.username, role: user.role },
      });

      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error saving user: " + error.message });
  }
};
