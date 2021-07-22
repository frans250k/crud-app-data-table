const mongoose = require("mongoose");

const Example_Data = mongoose.model("Example_Data", {
  nama_lengkap: {
    type: String,
    required: true,
  },
  nama_panggilan: {
    type: String,
    required: true,
  },
  tempat_lahir: {
    type: String,
    required: true,
  },
  tanggal_lahir: {
    type: String,
    required: true,
  },
  golongan_darah: {
    type: String,
    required: true,
  },
  no_hp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  keterangan: {
    type: String,
  },
});

module.exports = Example_Data;
