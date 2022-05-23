const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASSWORD_SECRET
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN 1
router.post("/login", async (req, res) => {
  try {
    //User is model in here
    const user = await User.findOne({
      username: req.body.username,
    });

    if (!user) return res.status(404).json("there is no user");

    //şifrelenmiş passwordu burada geri döndürüyoruz
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET
    );

    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json("wrong password");

      const accessToken = jwt.sign({
          id:user._id, 
          isAdmin:user.isAdmin,

      }, process.env.JWT_SECRET,
      {expiresIn:"3d"})

    const { password, ...others } = user._doc;

    res.status(200).json({...others,accessToken});
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
