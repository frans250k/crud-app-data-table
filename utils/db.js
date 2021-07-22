const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// 1. buat Skema
// const Example_Data = mongoose.model("Example_Data", {
//   nama_lengkap: {
//     type: String,
//     required: true,
//   },
//   // nama_panggilan: {
//   //   type: String,
//   //   required: true,
//   // },
//   // tempat_lahir: {
//   //   type: String,
//   //   required: true,
//   // },
//   // tanggal_lahir: {
//   //   type: String,
//   //   required: true,
//   // },
//   // golongan_darah: {
//   //   type: String,
//   //   required: true,
//   // },
//   no_hp: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//   },
//   // keterangan: {
//   //   type: String,
//   // },
// });

// // 2. tambah data
// const example_data = new Example_Data({
//   nama_lengkap: "Salmon Kbarek",
//   no_hp: "082247440519",
//   email: "amon@yahoo.com",
// });

// // 3. save
// example_data.save().then((data) => console.log(data));