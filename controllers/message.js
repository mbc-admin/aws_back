const Sequelize = require('sequelize');
const model  = require('../models').Message;
const user  = require('../models').User;
const findUserByJwt = require('../interactors/findUserByJwt');

function messageController(chatIo){
const methods = {

  //Index:
 index : function(req, res) {
  model.findAll({include: [{
    model: user,
    required: false,
}]})
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
},

//Show:
show: function (req, res) {
  const { id } = req.params;
  model.findByPk(id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
},

//Create:
create: async function (req, res) {
  // let currentUser = await findUserByJwt(req);
  console.log("create message")
  console.log(req.body)
  model.create(req.body)
    .then(result => {
        // channel_id
        console.log("POST message: ", result);
        console.log("emit to channel: "+result.channel_id)
       
      chatIo.to("channel_"+result.channel_id).emit('message-published', result);
      res.status(200).send(result);
    })
    .catch(error => res.status(400).send(error));
},

//Update:
 update: function (req, res) {
  const { id } = req.params;
  const { body } = req;
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

//Destroy:
 destroy: function(req, res) {
  const { id } = req.params;
  model.destroy({
    where: {
      id: id
    }
  })
    .then(result => res.sendStatus(200).send(result))
    .catch(error => res.sendStatus(400).send(error));
}  

  
}
return methods;
}
module.exports = messageController;