const express = require("express");
const User = require("../model/user");
// const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const router = new express.Router();

router.post("/register", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    // const token = await user.getAuthToken();

    // res.send({ user, token });
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.userName,
      req.body.password
    );
    // const token = await user.getAuthToken();
    // res.send({ user, token });
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/user/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
