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

router.put("/user", async (req, res) => {
  const allowableUpdates = [
    "firstName",
    "lastName",
    "courseCode",
    "termNo",
    "phoneNumber",
  ];

  try {
    const user = await User.findById(req.body.id);
    allowableUpdates.forEach((key) => (user[key] = req.body[key]));
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  const { id, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send({ error: "Passwords do not match!" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.send({ message: "Password reset successful!" });
  } catch (err) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});
module.exports = router;
