const express = require("express");
const Product = require("../model/product");
const upload = require("../utils/uploadFile");
const router = new express.Router();
const fs = require("fs");
const path = require("path");
const User = require("../model/user");

router.post("/product", upload.single("productImage"), async (req, res) => {
  console.log(req.body);
  const product = new Product(req.body);

  if (!req.file) {
    return res.status(400).json({ error: "Product image is required." });
  }

  product.productimageUrl = `/products/${req.file.filename}`;
  try {
    console.log(product, "last step");
    await product.save();
    res.send(product);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/product/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const product = await Product.findOne({ _id })
      .populate("productOwner")
      .exec();
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
    const { category, ownerId } = req.query;
    let query = {};
    if (category !== "all") {
      query = { productCatagory: category };
    }

    if (ownerId) {
      console.log(ownerId);
      query = { productOwner: ownerId };
    }

    const products = await Product.find(query).populate("productOwner").exec();
    console.log(products);
    res.send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.patch("/product/:id", async (req, res) => {
  console.log(req.body, "HELloo");

  try {
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
