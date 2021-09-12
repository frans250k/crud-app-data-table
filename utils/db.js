const mongoose = require("mongoose");

// read environment varible from .env
require("dotenv").config({ path: ".env" });

mongoose
  .connect(process.env?.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((_) => {
    console.log("🤩 Mongo connected.");
  })
  .catch((err) => {
    console.log("😡 Mongo error.");
    console.log(String(err));
  });
