const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const { body, check, validationResult } = require("express-validator");
const flash = require("connect-flash");
require("dotenv").config();
// User defind module

// connect to mongodb
require("./utils/db.js");
const User = require("./model/Users");
const Example_Data = require("./model/example_data");

const app = express();
const port = process.env.PORT;

// to override methods
app.use(methodOverride("_method"));
// view engine setup
app.set("view engine", "ejs");
app.use(expressLayouts);
//Middleware
app.use(express.static("public"));
app.use(
  session({
    secret: "verygoodsecret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, result) {
  result(null, user.id);
});

passport.deserializeUser(function (id, result) {
  User.findById(id, function (err, user) {
    result(err, user);
  });
});

passport.use(
  new localStrategy(function (username, password, result) {
    User.findOne({ username: username }, function (err, user) {
      if (err) return result(err);
      if (!user) return result(null, false, { message: "Incorrect username." });
      bcrypt.compare(password, user.password, function (err, res) {
        if (err) return result(err);
        if (res === false) return result(null, false, { message: "Incorrect password." });

        return result(null, user);
      });
    });
  })
);

// Function login & logout
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect("/");
}

// Routes
app.get("/", isLoggedIn, (req, res) => {
  res.render("index.ejs", {
    title: "Home",
    layout: "layouts/main-layout-after-login",
  });
});

app.get("/login", isLoggedOut, (req, res) => {
  const response = {
    title: "Login",
    layout: "layouts/main-layout",
    error: req.query.error,
  };
  res.render("login", response);
});

app.get("/about", isLoggedIn, (req, res) => {
  res.render("about.ejs", {
    title: "About",
    layout: "layouts/main-layout-after-login",
  });
});

app.get("/setting", isLoggedIn, (req, res) => {
  res.render("setting.ejs", {
    title: "Setting",
    layout: "layouts/main-layout-after-login",
  });
});

app.post(
  "/login",
  isLoggedOut,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?error=true",
  })
);
// ========================== TABLES ========================
// halaman data tabel
app.get("/example-data", isLoggedIn, async (req, res) => {
  const example_datas = await Example_Data.find();
  res.render("example-data", {
    title: "Halaman data tabel",
    layout: "layouts/main-layout-after-login",
    example_datas,
    msg: req.flash("msg"),
  });
});

// halaman tambah data
app.get("/example-data/add", isLoggedIn, (req, res) => {
  res.render("add-example-data", {
    title: "halaman tambah data tabel",
    layout: "layouts/main-layout-after-login",
    add: "add-example-data",
  });
});

// proses tambah data
app.post(
  "/example-data",
  isLoggedIn,

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
        layout: "layouts/main-layout-after-login",
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
app.delete("/example-data", isLoggedIn, (req, res) => {
  Example_Data.deleteOne({ nama_lengkap: req.body.nama_lengkap }).then((result) => {
    req.flash("msg", "Data tabel berhasil dihapus!!");
    res.redirect("/example-data");
  });
});

// form ubah data
app.get("/example-data/edit/:nama_lengkap", isLoggedIn, async (req, res) => {
  const example_data = await Example_Data.findOne({ nama_lengkap: req.params.nama_lengkap });
  res.render("edit-example-data", {
    title: "Form ubah data tabel",
    layout: "layouts/main-layout-after-login",
    example_data,
  });
});
// proses ubah data
app.put(
  "/example-data",
  isLoggedIn,
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
        layout: "layouts/main-layout-after-login",
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
app.get("/example-data/:nama_lengkap", isLoggedIn, async (req, res) => {
  //   const contact = findContact(req.params.nama);
  const example_data = await Example_Data.findOne({ nama_lengkap: req.params.nama_lengkap });
  res.render("detail", {
    title: "Halaman detail nama",
    layout: "layouts/main-layout-after-login",
    example_data,
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// get setup our admin user
app.get("/setup", async (req, res) => {
  const exists = await User.exists({ username: "admin" });

  if (exists) {
    res.redirect("/login");
    return;
  }
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash("pass", salt, function (err, hash) {
      if (err) return next(err);

      const newAdmin = new User({
        username: "admin",
        password: hash,
      });
      newAdmin.save();
      res.redirect("/login");
    });
  });
});

// Listening port
app.listen(port, () => {
  console.log(`server success running on port`);
});

module.exports = app;
