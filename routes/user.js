// Route User

const express = require("express");
const {
    appendFile
} = require("fs");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();

// Import des models
const User = require("../models/User");


router.post("/user/signup", async (req, res) => {

    // generate encrypted password
    const password = req.fields.password;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);


    // vérifier que l'email n'exite pas déja
    // vérifier username rempli

    // /!\ implémenter l'upload d'avatear
    try {
        if (!req.fields.username){
            res.status(400).json({
                error: "Veuillez renseigner votre nom d'utilisateur !"
            });
        } else {
            
            const emailExists = await User.findOne({ email: req.fields.email});
            if (emailExists) {
                res.status(409).json({
                    error: "Cette adresse email est déja présente en base"
                });
            }
        }
        const newUser = new User({
            email: req.fields.email,
            account: {
                username: req.fields.username,
                phone: req.fields.phone,
                avatar: {}
            },
            token: token,
            hash: hash,
            salt: salt

        })

        await newUser.save();
        res.status(200).json(newUser);

    } catch (error) {
        res.status(400).json(error.messsage);
    }

});

router.post("/user/login", async (req, res) => {

    try {
        const submittedPassword = req.fields.password;
        const submittedEmail = req.fields.email;
        const user = await User.findOne({ email: submittedEmail });
        // recupére les champs du formulaires et compare le password au hachage

        // const hash = SHA256(password + salt).toString(encBase64);
        const hash = SHA256(submittedPassword + user.salt).toString(encBase64);

        if (hash === user.hash) {
         let resultat = {
                "_id": user.id,
                "token": user.token,
                "account": {
                    "username": user.account.username,
                    "phone": user.account.phone
                }
            }
            res.status(200).json(resultat);
        }
        else {
            res.status(200).json("Accès non autorisé");
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(400).json(error.messsage);
    }
})









module.exports = router;