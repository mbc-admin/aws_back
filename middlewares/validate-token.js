const jwt = require('jsonwebtoken')
const user  = require('../models').User;
// middleware to validate token (rutas protegidas)
const verifyToken = (roles) => (req, res, next) => {

    // Get header token and remove "Bearer" word
    var token = req.header('authorization')
    if (!token) return res.status(401).json({ error: 'Access denied' })

    // token = token.substring(7, token.length);
    token = token.replace("Bearer ", "");

    console.log("token is", token)

    try {
        const decoded = jwt.verify(token, "mysecret")
        // req.user = verified
       
        user.findOne({where: {id: decoded.id}}).
        then(result => {
            if(result){
                console.log("middleware result: ", result)
                if (!roles.includes(result.dataValues.user_type)) {
                    return res.status(403).send('Access denied');
                  } 
                next()
            }else{
                res.status(402).json({error: 'Invalid token'})
            }
        })
    } catch (error) {
        res.status(405).json({error: 'Invalid token'})
    }
}

module.exports = verifyToken;
