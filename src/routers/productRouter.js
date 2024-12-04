const express = require("express");
const Product = require("../model/product");
const upload = require("../utils/uploadFile");
const router = new express.Router();
const fs = require("fs");
const path = require("path");
const User = require("../model/user");

router.post("/product", upload.single("productImage"), async (req, res) => {
  const product = new Product(req.body);

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
    const { category, ownerId, page = 1, limit = 10 } = req.query;
    console.log(req.query);

    let query = {};

    if (category && category !== "all") {
      query.productCatagory = category;
    }

    if (ownerId) {
      query.productOwner = ownerId;
    }

    // Parse `page` and `limit` to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const products = await Product.find(query)
      .populate("productOwner")
      .skip((pageNumber - 1) * limitNumber) // Skip documents for the current page
      .limit(limitNumber) // Limit the number of documents
      .exec();

    // Get the total count for the query
    const totalCount = await Product.countDocuments(query);
    console.log(products.length, pageNumber, totalCount, Math.ceil(totalCount / limitNumber));
    res.send({
      products,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      totalCount,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.patch("/product/:id", async (req, res) => {
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

router.get("/products/search", async (req, res) => {
  const { category, name,page, limit = 10 } = req.query;
  let pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  try {
    let products = [];
    const query = {};

    if (category && category !== "all") {
      query.productCatagory = category;
    }
    if (name) {
      query.productName = { $regex: name, $options: "i" };
    }
    const totalCount = await Product.countDocuments(query);
    const totalPage = Math.ceil(totalCount / limitNumber);
    if (pageNumber > totalPage) {
      pageNumber = 1;
    }
    products = await Product.find(query)
      .skip((pageNumber - 1) * limitNumber) 
      .limit(limitNumber) 
      .populate("productOwner")
      .exec();
    res.send({
      products,
      totalPages: totalPage,
      currentPage: pageNumber,
      totalCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
