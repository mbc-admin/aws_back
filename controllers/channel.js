const sequelize = require('sequelize');
const Op = sequelize.Op;
const model  = require('../models').Channel;
const Message  = require('../models').Message;
const User  = require('../models').User;
const userChannel  = require('../models').UserChannel;
const message  = require('../models').Message;
const findUserByJwt = require('../interactors/findUserByJwt');
const moment = require('moment');

module.exports = {
  test: async function(req,res) {
    const { id } = req.params;
    const currentUser = await findUserByJwt(req);
    try{
      let channel = await model.findByPk(id).addCoach();
      res.status(200).send(channel)
    }catch(e){
      res.status(400).send(e);
    }
  },
  //Index:
 index : async function (req, res) {
   try {
    const status = req.query.status;
    console.log("status: ",status)
    let currentUser = await findUserByJwt(req);
   
    let coach = await User.findOne({where: {id: currentUser.id, user_type: 'coach'}});
    console.log("coach data: ", coach)
    // Return error if coach_id is not a user type coach
    if(coach === null) return res.status(400).send('not a coach');
    
    let opt = status == 1 ? null : {[sequelize.Op.not]: null};
    // let channels = await model.scope({method: ['byUser', currentUser.id]}).scope({ method: ['status', status]}).findAll({include: [{
      let channels = await model.findAll({where:{user_id: currentUser.id, ended_at: opt},include: [{
      model: Message,
      required: false,
      include: {
        model: User
      }
      },
      {
        model: userChannel,
        required: false,
        include: {
          model: User,
          required: true
        }
      },
      {
        model: User,
        required: true,
      }
    ]
    });
    // console.log("currentUser: ", currentUser.id);
    // console.log("channels: ", channels)
    channels = JSON.stringify(channels)
   
    // console.log(channels)
    channels = await Promise.all(JSON.parse(channels).map(async (channel) => {
      channel.unreadMessages = [];
      channel.channelUsers = {coach: channel.User, user: channel.UserChannels[0].User}
      
        if(channel.last_read_message !== null){
          const lastReadMessageString = channel.last_read_message;
          const formatString = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
          channel.unreadMessages = await message.findAll({
            where: {
              createdAt: {
                [Op.gt]: moment(lastReadMessageString, formatString)
              },
              channel_id: channel.id
            }
          });
        }

      console.log("unread messages: ", channel.unreadMessages)
      
      // delete channel.User;
      // delete channel.channel.UserChannels;
      channel.Messages.map(message => {
        // console.log("message user: ", message)
      if(message.User.id === currentUser.id){
        message.User.isSender = true;
      }else{
        message.User.isSender = false;
      }
      return message;
      })
      return channel;
    }
 ) );

  channels = await channels;
    res.status(200).send(channels);
  } catch (error) {
    res.status(400).send(error)
  }
},

//Show:
show: async function (req, res) {
  const { id } = req.params;
  try {
    
    let channel = await model.findByPk(id, {include: [{
      model: Message,
      required: false,
      include: {
        model: User
      }
      },
      {
        model: userChannel,
        required: false,
        include: {
          model: User,
          required: true
        }
      },
      {
        model: User,
        required: true,
      }
    ]
    });
    let currentUser = await findUserByJwt(req);
    console.log("currentUser channel show: ", currentUser.id);
    channel = JSON.stringify(channel)
    channel = JSON.parse(channel)
    channel.unreadMessages = [];
    if(channel.last_read_message !== null){
      const lastReadMessageString = channel.last_read_message;
      const formatString = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
      channel.unreadMessages = await message.findAll({
        where: {
          createdAt: {
            [Op.gt]: moment(lastReadMessageString, formatString)
          },
          channel_id: channel.id
        }
      });
    }
    channel.channelUsers = {coach: channel.User, user: channel.UserChannels[0].User}
    console.log("channelUsers: ", channel.channelUsers)
    console.log(channel)
    channel.Messages = channel.Messages.map(message => {
      console.log("Message id: ", message.id);
      console.log("Author id: ", message.user_id);

      if(message.User.id === currentUser.id){
        message.User.isSender = true;
      }else{
        message.User.isSender = false;
      }
      return message;
 
    });
    res.status(200).send(channel);
  } catch (error) {
    res.status(400).send(error)
  }
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
//Start conversation:
start_conversation: async function (req, res) {
  try {
    let currentUser = await findUserByJwt(req);
    const coachId = req.body.coach_id;
    let coach = await User.findOne({where: {id: coachId, user_type: 'coach'}});

    // Return error if coach_id is not a user type coach
    if(coach === null) res.status(400).send(error)

    let allUserChannels = JSON.stringify(await userChannel.findAll({where:{user_id: currentUser.id}}));
    let allUserChannelIds = [];
    JSON.parse(allUserChannels).map(channel => allUserChannelIds.push(channel.channel_id));
    let allStartedChannelsWithCoach = await model.findAll({where:{id: allUserChannelIds, user_id: coachId, ended_at: null}})
    // If there is NO open channel with coach
    if(allStartedChannelsWithCoach.length === 0){
        // Create new channel with coach
        model.create({user_id: coachId}).then(result => {
          let channel = JSON.stringify(result);
          channel = JSON.parse(channel);
          channel.current_user_id = currentUser.id;
          userChannel.create({user_id: currentUser.id, channel_id: channel.id})
            .then(_ => res.status(200).send(channel))
            .catch(error =>  res.status(400).send(error));        
        })
      }else{
      res.status(400).send(error)
    
    }
  } catch (error) {
    res.status(400).send(error)
  }
},
finalize_conversation: async function (req, res) {
  // TO DO: Validate current user has role greater than user
  const currentUser = findUserByJwt(req);
  const { id } = req.params;
  console.log("id: ", id)
  // channel = await model.findByPk(parseInt(id));
  // channel.ended_at = "2023-02-28T14:52:46.000Z"
  model.update({ended_at: sequelize.fn('NOW')}, {
    where: {
      id: parseInt(id)
    }
  }).then(result => res.status(200).send('OK')
   ).catch (error => res.status(400).send(error))
},

  
};