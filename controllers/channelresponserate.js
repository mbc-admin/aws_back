const Sequelize = require('sequelize');
const model  = require('../models').ChannelResponseRate;


module.exports = {

  //Index:
 index : function(req, res) {
  model.findAll()
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
create: function (req, res) {
  model.create(req.body)
    .then(result => res.status(200).send(result))
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

  
};