const express = require("express");
require("./db/mongoose");

const app = express();
app.use(express.json()); // automatic convert json into object

const port = process.env.PORT || 8080;

app.get("/login", (req, res) => res.send({ message: "Hey" }));

app.listen(port, () => {
  console.log("Server started on " + port);
});
