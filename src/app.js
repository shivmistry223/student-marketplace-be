const express = require("express");
require("./db/mongoose");
const cors = require("cors");
const productRouter = require("./routers/productRouter");
const userRouter = require("./routers/userRouter");

const app = express();
app.use(express.json()); // automatic convert json into object

app.use(cors()); // Enable CORS

app.use("/products", express.static("products"));

const port = process.env.PORT || 8080;

app.use(productRouter);
app.use(userRouter);

app.listen(port, () => {
  console.log("Server started on " + port);
});
