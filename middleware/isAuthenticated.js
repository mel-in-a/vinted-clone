// Import des models
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {

    // check if user authenticated
    console.log(req.headers.authorization); // "Bearer 12345"
    //sanitize token
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({
        token: token
    });

    if (user) {
        // ajouter à l'objet req, une clé user qui a pour valeur le user trouvé
        req.user = user;
        next();
    } else {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};

module.exports = isAuthenticated;