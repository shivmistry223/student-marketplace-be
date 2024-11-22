const express = require("express");
require("./db/mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const productRouter = require("./routers/productRouter");

const app = express();
app.use(express.json()); // automatic convert json into object

app.use(cors()); // Enable CORS

app.use("/products", express.static("products"));

const port = process.env.PORT || 8080;

app.use(productRouter);

app.listen(port, () => {
  console.log("Server started on " + port);
});
