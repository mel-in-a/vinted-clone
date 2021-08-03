// Bootstrap
require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
// var hbs  = require('express-handlebars')

// database
const mongoose = require("mongoose");
// cloudinary
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// middleware
const isAuthenticated = require("./middleware/isAuthenticated");

// /crypto toto
// const uid2 = require('uid2')
// const SHA256 = require('crypto-js/sha256')
// const encBase64 = require('crypto-js/enc-base64')

const app = express();
app.use(formidable());
app.use(morgan("dev"));
app.use(cors());

// params template
// view engine setup
// app.engine('hbs', hbs({extname: 'hbs'}))
// app.set('views', 'views')
// app.set('view engine', 'hbs')
// app.use(express.static('views'))

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

app.use(userRoutes);
app.use(offerRoutes);

// fonctionne youpi
app.post("/upload", isAuthenticated, async (req, res) => {
  console.log(Object.keys(req));
  try {
    // console.log('On rentre dans la route...')
    // console.log(req.user)
    // //   Comment on récupère une image ?
    // console.log(req.fields)
    // console.log(req.files.picture.path)
    // uploader l'image sur cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: "/vinted",
    });

    // mettre à jour la fiche user avec les infos du

    console.log(result);
    res.status(200).json("Image uploaded !");
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

app.post("/pay", async (req, res) => {
  // Réception du token créer via l'API Stripe depuis le Frontend
  const stripeToken = req.fields.stripeToken;
  // Créer la transaction
  const response = await stripe.charges.create({
    amount: 2000,
    currency: "eur",
    description: title,
    // On envoie ici le token
    source: stripeToken,
  });
  console.log(response.status);

  // TODO
  // Sauvegarder la transaction dans une BDD MongoDB

  res.json(response);
});

app.all("*", (req, res) => {
  res.status(404).json({
    message: "Page not found !",
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
