const Sequelize = require('sequelize');
const findUserByJwt = require('../interactors/findUserByJwt');
const model  = require('../models').Device;


module.exports = {

  //Create:
  create: async function (req, res) {
    const currentUser = await findUserByJwt(req);
    let payload = req.body;
    payload.user_id = currentUser.id;
    console.log("devices payload: ",req.body)
    console.log("devices mod payload: ",payload)
    model.create(payload)
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  

  //Update:
   update: function (req, res) {
    const { id } = req.params;
    let body = req;
    delete body['user_id']

    model.update(body, {
      where: {
        id: id
      }
    })
      .then( async result => {
        let response =  await model.findByPk(id);   
        res.status(200).send(response)
    })
      .catch(error => res.status(400).send(error));
  },
  

  
};