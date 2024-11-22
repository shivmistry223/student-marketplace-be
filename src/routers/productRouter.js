const express = require("express");
const Product = require("../model/product");
const upload = require("../utils/uploadFile");
const router = new express.Router();
const fs = require("fs");
const path = require("path");

router.post("/product", upload.single("productImage"), async (req, res) => {
  console.log(req.body);
  const product = new Product(req.body);
  //   const task = new Task({
  //     ...req.body,
  //     owner: req.user._id,
  //   });
  if (!req.file) {
    return res.status(400).json({ error: "Product image is required." });
  }

  product.productimageUrl = `/products/${req.file.filename}`;
  try {
    await product.save();
    res.send(product);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/product/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    // const task = await Task.findOne({ _id, owner: req.user._id });
    const product = await Product.findOne({ _id });
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    // await req.user.populate("tasks");
    // const match = {};
    // const sort = {};

    // if (req.query.completed) {
    //   match.completed = req.query.completed === "true";
    // }

    // if (req.query.sortBy) {
    //   const parts = req.query.sortBy.split("_");
    //   sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    // }

    // await req.user.populate({
    //   path: "tasks",
    //   match,
    //   options: {
    //     limit: parseInt(req.query.limit),
    //     skip: parseInt(req.query.skip),
    //     sort,
    //   },
    // });
    res.send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.patch("/product/:id", async (req, res) => {
  console.log(req.body, "HELloo");

  //   const allowableUpdates = ["description", "completed"];
  //   const updates = Object.keys(req.body);
  //   const isValidUpdates = updates.every((update) =>
  //     allowableUpdates.includes(update)
  //   );

  //   if (!isValidUpdates || !req.body) {
  //     return res.status(400).send({ error: "Invalid Updates" });
  //   }

  try {
    // const product = await Product.findOneAndUpdate(
    //   { _id: req.params.id, owner: req.user._id },
    //   req.body,
    //   {
    //     new: true,
    //     runValidators: true,
    //   }
    // );
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).send();
    }

    res.send(product);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/product/:id", async (req, res) => {
  try {
    // const product = await Product.findOneAndDelete({
    //   _id: req.params.id,
    //   owner: req.user._id,
    // });
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
    });

    if (!product) {
      return res.status(404).send();
    }

    const imagePath = path.join(__dirname, "../..", product.productimageUrl); // Adjust path to match your directory structure

    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    res.send(product);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
