const mongoose = require("mongoose");

// Setup mongodb schema
mongoose
  .connect("", {
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

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});
const User = mongoose.model("User", UserSchema);

module.exports = User;
