const Sequelize = require('sequelize');
const model  = require('../models').Post;
const UserPost  = require('../models').UserPost;
const models = require('../models');
const sequelize = models.sequelize;
const { QueryTypes } = require('sequelize');


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
  },
  


  create_user_post: function(req,res){
    let {user_id, post_id} = req.body;
    UserPost.findOne({where: {user_id, post_id}})
        .then(result => {
            if(result){
                res.status(400).send("user has access to this post");
            }else{

                console.log("lets find post")
                models.Post.findOne({where: {id: post_id}})
                .then(result => {
                    if(result){
                        console.log("lets find user")
                        models.User.findOne({where: {id: user_id}})
                        .then(post => {
                            if(post){
                                console.log("lets create user post")
                                UserPost.create({user_id, post_id})
                                .then(user_post => res.status(200).send(user_post))
                                .catch(error => res.status(400).send(error));
                            }else{
                                res.status(400).send("user not found");
                            }
                        })
                .catch(error => res.status(400).send(error));
            }
        }).catch(error => res.status(400).send(error));
       
}

        }).catch(error => res.status(400).send(error));
  },



  delete_user_post: function(req,res){
    let {user_id, post_id} = req.body;
    UserPost.destroy({where: {user_id, post_id}})
        .then(result => res.status(200).send("OK"))
        .catch(error => res.status(400).send("KO"));
  },

  get_user_posts: async function(req,res){
    let user_id = req.user.id

    sequelize.query(
        'SELECT * FROM Posts WHERE id IN (SELECT post_id FROM UserPosts WHERE user_id = ?)',
        {
            replacements: [user_id],
            type: QueryTypes.SELECT
        }
    ).then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
    },
  
  
};