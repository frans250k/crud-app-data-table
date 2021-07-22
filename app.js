const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, check, validationResult } = require("express-validator");
const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Example_Data = require("./model/example_data");

const app = express();
const port = 3000;

// setup method override
app.use(methodOverride("_method"));
// view engine setup (templating view engine)
app.set("view engine", "ejs");
app.use(expressLayouts);
// use Built-in middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// config flash
app.use(cookieParser("secret"));
app.use(session({ cookie: { maxAge: 6000 }, secret: "secret", resave: true, saveUninitialized: true }));
app.use(flash());

// halaman home
app.get("/", (req, res) => {
  res.render("index", {
    title: "halaman home",
    layout: "layouts/main-layout",
  });
});

// halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    title: "halaman about",
    layout: "layouts/main-layout",
  });
});

// halaman data tabel
app.get("/example-data", async (req, res) => {
  const example_datas = await Example_Data.find();
  res.render("example-data", {
    title: "Halaman data tabel",
    layout: "layouts/main-layout",
    example_datas,
    msg: req.flash("msg"),
  });
});

// halaman tambah data
app.get("/example-data/add", (req, res) => {
  res.render("add-example-data", {
    title: "halaman tambah data tabel",
    layout: "layouts/main-layout",
    add: "add-example-data",
  });
});
// proses tambah data
app.post(
  "/example-data",
  [
    body("nama_lengkap").custom(async (value) => {
      const duplikat = await Example_Data.findOne({ nama_lengkap: value });
      if (duplikat) {
        throw new Error("Nama sudah digunakan!");
      }
      return true;
    }),
    check("email").isEmail().withMessage("Email tidak valid!"),
    check("no_hp").isMobilePhone("id-ID").withMessage("No handphone tidak valid!"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-example-data", {
        title: "Form tambah data tabel",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Example_Data.insertMany(req.body, (error, result) => {
        // kirimkan flash message
        req.flash("msg", "Data tabel berhasil ditambahkan!!");
        res.redirect("/example-data");
      });
    }
  }
);

// hapus data
app.delete("/example-data", (req, res) => {
  Example_Data.deleteOne({ nama_lengkap: req.body.nama_lengkap }).then((result) => {
    req.flash("msg", "Data tabel berhasil dihapus!!");
    res.redirect("/example-data");
  });
});

// form ubah data
app.get("/example-data/edit/:nama_lengkap", async (req, res) => {
  const example_data = await Example_Data.findOne({ nama_lengkap: req.params.nama_lengkap });
  res.render("edit-example-data", {
    title: "Form ubah data tabel",
    layout: "layouts/main-layout",
    example_data,
  });
});
// proses ubah data
app.put(
  "/example-data",
  [
    body("nama_lengkap").custom(async (value, { req }) => {
      const duplikat = await Example_Data.findOne({ nama_lengkap: value });
      if (value !== req.body.oldName && duplikat) {
        throw new Error("Nama sudah digunakan!");
      }
      return true;
    }),
    check("email").isEmail().withMessage("Email tidak valid!"),
    check("no_hp").isMobilePhone("id-ID").withMessage("No handphone tidak valid!"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-example-data", {
        title: "Form ubah data tabel",
        layout: "layouts/main-layout",
        errors: errors.array(),
        example_data: req.body,
      });
    } else {
      Example_Data.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama_lengkap: req.body.nama_lengkap,
            nama_panggilan: req.body.nama_panggilan,
            tempat_lahir: req.body.tempat_lahir,
            tanggal_lahir: req.body.tanggal_lahir,
            golongan_darah: req.body.golongan_darah,
            no_hp: req.body.no_hp,
            email: req.body.email,
            keterangan: req.body.keterangan,
          },
        }
      ).then((result) => {
        // kirimkan flash message
        req.flash("msg", "Data tabel berhasil diubah!");
        res.redirect("/example-data");
      });
    }
  }
);

// halaman detail data nama
app.get("/example-data/:nama_lengkap", async (req, res) => {
  //   const contact = findContact(req.params.nama);
  const example_data = await Example_Data.findOne({ nama_lengkap: req.params.nama_lengkap });
  res.render("detail", {
    title: "Halaman detail nama",
    layout: "layouts/main-layout",
    example_data,
  });
});

app.listen(3000, () => {
  console.log(`server running on port:${port}`);
});
