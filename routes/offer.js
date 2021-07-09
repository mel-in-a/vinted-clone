// Route Offer

const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const Offer = require("../models/Offer");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});


// Import des models
const User = require("../models/User");


// const compare = (priceMin, priceMax) => {
//     if (priceMin){
//         return "{ $gte: priceMin }";
//     }
//     else if (priceMax) {
//         return "{ $lte: priceMax }";
//     }
//     else if (priceMin && priceMax ) {
//         return "{ $gte: priceMin, $lte: priceMax }";
//     }
//     else {
//         return null;
//     }
// }

// pricecomp.comp = $gte;



router.get("/offers", async (req, res) => {


    const title = req.query.title;
    const priceMin = req.query.priceMin;
    const priceMax = req.query.priceMax;
    let page = parseInt(req.query.page, 10);
    let sort = req.query.sort;
    let limit = 0;
    let params = {};
    let filters = {};
    let skip = 0;
    console.log(page);
    try {

        if (title) {
            filters.product_name = title;
        }

        if (page > 0) {
            limit = 3;
            skip = limit * page;
        }

        if (sort === "price-asc") {
            params.product_price = 1
        } else if (sort === "price-desc") {
            params.product_price = -1
        }

        console.log("filters : " + filters.product_name);
        console.log("params : " + params.title);
        console.log("limit : " + limit);
        console.log("skip : " + skip);

        const offers = await Offer.find(filters).sort(params).limit(limit).skip(skip).select("product_name product_price");
        // const offers = await Offer.find(filters).sort(params).limit(limit).skip(skip);
        console.log("count : " + offers.length);
        // offers = JSON.stringify(offers);
        res.status(200).json(offers);
        // console.log(offers);

        // res.render('home', offers);

    } catch (error) {
        res.status(400).send("Mince ça coince ! ");
    }
})



router.post("/offer/publish", isAuthenticated, async (req, res) => {
    try {

        const {
            title,
            description,
            price,
            condition,
            city,
            brand,
            size,
            color
        } = req.fields;
        const owner = req.user;
        const picture = req.files.picture.path;

        const newOffer = new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [{
                MARQUE: brand,
                TAILLE: size,
                ETAT: condition,
                COULEUR: color,
                EMPLACEMENT: city
            }],
            product_image: picture,
            owner: owner,

        });

        const result = await cloudinary.uploader.upload(picture, {
            folder: "/vinted/offers/" + newOffer._id,
        });

        if (result) {
            newOffer.product_image = result;
            await newOffer.save();
            res.status(200).json(newOffer);
        } else {
            res.status(400).json({
                message: "Probleme upload image"
            });
        }

    } catch (error) {
        res.status(400).json(error.messsage);
    }

});


router.put("/offer/update", isAuthenticated, async (req, res) => {
    try {
        const {
            id,
            title,
            description,
            price,
            condition,
            city,
            brand,
            size,
            color
        } = req.fields;
        // const picture = req.files.picture.path;

        // requete incorrecte /!\ pas de selectio d'id

        // const offerToUpdate = await findById(req.fields.id);


        // voir findByIdAndUpdate
        const updatedOffer = await Offer.updateOne({
            _id: id,
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [{
                MARQUE: brand,
                TAILLE: size,
                ETAT: condition,
                COULEUR: color,
                EMPLACEMENT: city
            }],
            // product_image: picture,

        });
        res.status(200).json(updatedOffer);

    } catch (error) {
        res.status(400).json(error.messsage);
    }
})



router.get("/offer/:id", async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id).populate({
            path: "owner",
            select: "account",
        });
        //   console.log(Object.keys(offer).length);
        res.status(200).json(offer);

        //   res.render('home', {offer: offer});
    } catch (error) {
        res.status(400).send("Mince ça coince!");

    }

})



module.exports = router;