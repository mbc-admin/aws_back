const jwt = require('jsonwebtoken')
const user  = require('../models').User;
// middleware to validate token (rutas protegidas)
const socketAuth = async token => {
    // Get header token and remove "Bearer" word
    if (!token) new Error("Invalid token");
    token = token.replace("Bearer ", "")
    console.log("socket auth - token is", token)

    try {
        return new Promise(async (resolve, reject) => {
            const verified = jwt.verify(token, "mysecret")
            let userData = await user.findOne({where: {id: verified.id}});
        
            if(userData.dataValues){
                resolve(userData.dataValues);
            } else {
                reject(new Error('Invalid token'))
            }
            });
    } catch (error) {
        console.log("try token error");
        // console.log(error);
        throw new Error(error)
    }
}

module.exports = socketAuth;
