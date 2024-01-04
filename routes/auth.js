const router = require("express").Router();
const CryptoJs = require("crypto-js");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      user_name: req.body.user_name,
      password: CryptoJs.AES.encrypt(
        req.body.password,
        process.env.CRYPTO_JS_SEC
      ).toString(),
      email: req.body.email,
    });
    const saveUser = await newUser.save();
    const { password, ...others } = saveUser._doc;
    const access_token = jwt.sign(
      {
        id: saveUser._id,
        is_admin: saveUser.is_admin,
      },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );
    return res.status(201).json({ ...others, access_token });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const findUser = await User.findOne({ user_name: req.body.user_name });
    const decryptPassword = CryptoJs.AES.decrypt(
      findUser.password,
      process.env.CRYPTO_JS_SEC
    );
    const password = decryptPassword.toString(CryptoJs.enc.Utf8);
    if (password === req.body.password) {
      const { password, ...others } = findUser._doc;
      const access_token = jwt.sign(
        {
          id: findUser._id,
          is_admin: findUser.is_admin,
        },
        process.env.JWT_KEY,
        { expiresIn: "3d" }
      );
      return res.status(200).json({ ...others, access_token });
    } else {
      return res.status(401).json("Wrong creadentials");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
