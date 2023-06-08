const jwt = require('jsonwebtoken');
const user = require('../models').User;

module.exports = async (req) => {
    const token = req.headers.authorization.replace("Bearer ", "");
    console.log("this is the token: ", token)
    const decoded = jwt.verify(token, "mysecret");
    console.log("decoded: ", decoded)
    const currentUser = await user.findOne({ where: { id: decoded.id } });
//   user.findOne({ where: { id: decoded.id } }).
//         then(result => {
//             console.log("user: ", result)
//             return result;
//         });

    return currentUser.dataValues;
}
