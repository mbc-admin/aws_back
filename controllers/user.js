const Sequelize = require('sequelize');
const model  = require('../models').User;
const User = model
const models = require('../models');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mailer = require('../services/mailer');
const findUserByJwt = require('../interactors/findUserByJwt');
const channel = require('../models').Channel;
const userChannel = require('../models').UserChannel;
const message = require('../models').Message;
const working_hour  = require('../models').WorkingHour;
// const speciality = require('../models').Speciality;


module.exports = {

//Index:
 index : function(req, res) {
    model.findAll()
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },

  // Get only users with user_type = 'coach'
  coaches : async function(req, res) {
    model.findAll({where: {user_type: 'coach'}})
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },

  // Get only users with user_type = 'user'
  users_only : async function(req, res) {
    model.findAll({where: {user_type: 'user'}})
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },

  
  //Show:
  show: function (req, res) {
    const { id } = req.params;
    model.findOne({
        where: {
            id: id
        },
        include: [
            {model: models.Department}
        ]
    })
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  
  //Create:
  create: async function (req, res) {

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const newUser = new User(req.body);
    try {
      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);
      // Guardar el usuario

       // Remove user_type from params to prevent secyurity issues
       delete newUser['user_type']
       
       await newUser.save();

       var result = await User.findOne({ where: { email } });
      // Crear y firmar el JWT
      const payload = {
        user: {
          id: newUser.id,
        },
      };
      jwt.sign(
        payload,
        "mysecret",
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          // Mensaje de confirmación


            result = result.toJSON({ versionKey:false });
            delete result['password']
            result.token = token

          res.json({ user: result});
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Error al guardar el usuario");
    }
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

  login: function(req, res) {
    // Buscamos el usuario en la base de datos
    User.findOne({
        where: {
        email: req.body.email
        }
    })
    .then(async user => {
      // Comprobamos que la contraseña es correcta
      if (bcrypt.compareSync(req.body.password, user.password)) {
        // Generamos un token de JWT para el usuario
        const token = await jwt.sign({
          id: user.id
        }, 'mysecret');

        var result = user.toJSON({ versionKey:false });
        delete result['password']
        result.token = token


        // Devolvemos el token al usuario
        res.json({
          user: result
        });

      } else {
        // Si la contraseña no es correcta, devolvemos un error
        res.status(401).json({
          error: 'Usuario o contraseña incorrectos'
        });
      }
    })
    .catch(err => {
      // Si no encontramos el usuario, devolvemos un error
      res.status(401).json({
        error: 'Usuario o contraseña incorrectos'
      });
    });
  },


  logout : function(req, res) {
    let id = req.user.id
    model.update({token: null}, {
        where: {
            id: id
        }
    })
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
  },
  // Profile:
  my_profile: async function (req, res)  {
    let currentUser = await findUserByJwt(req);
    console.log("current user myprofile: ", currentUser)
    model.findOne({
        where: {
            id: currentUser.id
        },
        include: [
            {model: models.Department},
            {model: models.Organization},
            {model: models.Speciality}
        ]
    })
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  coaches : async function(req, res) {
    model.findAll({where: {user_type: 'coach'}})
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  coach : async function(req, res) {
    const { id } = req.params;
    model.findOne({where: {id: id}})
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  my_coaches : async function(req, res) {
    let currentUser = await findUserByJwt(req);
    model.findAll({where: {user_type: 'coach'}, 
    include: {
      model: channel,
      where: {ended_at: null},
      include: [{
        model: userChannel,
        where: {
          user_id: currentUser.id
        }
      }, 
      {model: message}]
    },
  },)
      .then(result => {
        res.status(200).send(result)
      })
      .catch(error => res.status(400).send(error));
  },
  update_profile_image: function (req, res) {
    let id = req.user.id
    let body = {}


    let image = req.files.file

    // Generate random string for image name
    let image_name = generate_random_string(30) + '.' + image.name.split('.').pop()
    body.image = image_name

     // If does not have image mime type prevent from uploading
   // if (/^image/.test(image.mimetype)) return res.sendStatus(400);

     // Move the uploaded image to our upload folder
     image.mv('/home/ubuntu/testing/uploads/' + image_name);

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



  check_token: function (req, res) {
    let id = req.user.id
    model.findOne({
        where: {
            id: id
        }
      })
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  

  add_user_speciality: function (req, res) {
    let id = req.user.id
    let body = req.body
    body.user_id = id
    models.UserSpeciality.create(body)
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },



  delete_user_speciality: function (req, res) {
    let id = req.user.id
    let body = req.body
    models.UserSpeciality.destroy({
      where: {
        user_id: id,
        speciality_id: body.speciality_id
      }
    })
      .then(result => res.status(200).send("deleted"))
      .catch(error => res.status(400).send(error));
  },


  change_user_password: function(req,res){
    let id = req.user.id
    let body = req.body
    User.findOne({
        where: {
        id: id
        }
    })
    .then(async user => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(body.password, salt);
      user.save()
      res.status(200).send("password changed")
    })
    .catch(err => {
      // Si no encontramos el usuario, devolvemos un error
      res.status(401).json({
        error: 'Usuario o contraseña incorrectos'
      });
    });
  },


  send_reset_password_token : function(req,res){
    let body = req.body
    User.findOne({
        where: {
        email: body.email
    }})
    .then(async user => {
      let token = generate_random_string(20)
      user.reset_password_token = token
      user.save()
      mailer.send_reset_password_token(user.email,token)
      res.status(200).send("ok")
    })
    .catch(err => {
      res.status(400).send(err)
    }
    );

  },

  // add working hours
  add_working_hours: function (req, res) {
    let payload = req.body;
    working_hour.create(payload)
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },

  // get working hours
  get_working_hours:  function (req, res) {
    let user_id = req.params.user_id

    // let's find working hours for this user
    working_hour.findAll({
      where: {
          user_id: user_id
      }
    })
      .then(working_hours => {
        let result = []

       
        
        working_hours.forEach(working_hour => {
          let obj = {
            recurring: {
              repeat: "weekly",
              weekDays: working_hour.day,
              start: working_hour.start,
              end: working_hour.end,
              title: "horario"
            }
          }

            result.push(obj)
          })

          res.status(200).send(result)
      })
      .catch(error => res.status(400).send(error));
      
  },

  // delete working hour
  delete_working_hours: function (req, res) {
    let id = req.body.id
      working_hour.destroy({
        where: {
          id: id
        }
      })
      .then(result => res.status(200).send("deleted"))
      .catch(error => res.status(400).send(error));
  },

  
  
};

function  generate_random_string(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  return result;
}