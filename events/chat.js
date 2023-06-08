const socketAuth = require('../middlewares/socket-auth');
const sequelize = require('sequelize');
const Channel = require('../models').Channel;
const UserChannel = require('../models').UserChannel;
const Message = require('../models').Message;
const { v4: uuidv4 } = require('uuid');

module.exports = (chatIo) => {
    chatIo.use(async (socket, next) => {
      console.log("handshake: ")
      console.log(socket.handshake.query)
    // const token = socket.handshake.query.token;
    const token = socket.handshake.query.token;
    console.log("token: ", socket.handshake.query.token)
    socketAuth(token)
      .then(res => { 
        console.log("socket auth validated");
        // console.log(res);
        socket.user = res;
        next()})
      .catch(error => {
        console.log("socket auth error")
        // console.log(error)
        next(error)})
    
    })
    .on('connection', async socket => {
    console.log("new chat socket connection: ",socket.id)
    // Emit welcome event
    chatIo.to(socket.id).emit('welcome', {id: socket.id});

    socket.once('disconnect', async () => {
      await Channel.update({last_read_message: sequelize.fn('NOW')}, {
        where: {
          id: Number(socket.lastChannelId),
          user_id: socket.user.id
        }
      })
      console.log('Chat socket disconnected for user: ', socket.user.id)
      console.log("on disconnect last channel id: ", socket.lastChannelId)
      socket.disconnect();
    });

    // Event: join to chat
    socket.on('join', async data => {
      console.log(data)
      console.log("user data: ", socket.user)
      if(data.channelId !== null){
        socket.join("channel_"+data.channelId);
      } else {
        const channelsByUser = await Channel.getAllActiveChannelsForUser(socket.user.id);
        channelsByUser.map(channel => {
          console.log("joining user "+socket.user.id+" to channel"+channel.id)
          socket.join("channel_"+channel.id);
        })
        // Join user to all active chats
      }
      // Get current user
      // 
        // Expected object
        // {channelId: "CHX", userId: 1}
    
        // log.info(`User: ${data.email} | userId: ${data.userId} | Channel: ${data.channelId} | App version: ${data.appVersion} | Platform: ${data.platform}`);
       
    });    
    // Event: join to chat
    socket.on('coach-last-channel', async data => {
      const {channel_prev_id, channel_next_id} = data;
      socket.lastChannelId = channel_next_id;
      console.log(new Date())
      console.log("coach-last-channel")
      console.log("coach prev channel id: ", channel_prev_id)
      console.log("coach next channel id: ", channel_next_id)
      console.log("coach saved next channel id: ", socket.lastChannelId)
      let channelsToUpdate = [channel_next_id];
      if(channel_prev_id !== null) channelsToUpdate.push(channel_prev_id);
      channelsToUpdate.map(async (c) => {
        await Channel.update({last_read_message: sequelize.fn('NOW')}, {
          where: {
            id: Number(c),
            user_id: socket.user.id
          }
        })
      })     
       
    });    

    socket.on('user-last-channel', async data => {
      const {channel_id} = data;
      
      if(socket.user.user_type === 'user') return;

      {
        await UserChannel.update({last_read_message: sequelize.fn('NOW')}, {
          where: {
            channel_id: Number(channel_id),
            user_id: socket.user.id
          }
        })
      }
       
    });    


    socket.on('initVideochat', async data => {
      const {channelId} = data;
      console.log("channelID UUId: ", data)
      if(socket.user.user_type === 'user') return;
      const channel = await Channel.findByPk(channelId);
      console.log("channel for init: ", channel)
      if(channel.user_id !== socket.user.id) return;
      const videocall_uuid = uuidv4();
      channel.update({videocall_started_at: sequelize.fn('NOW'), videocall_uuid: videocall_uuid}, {
          where: {
            channel_id: Number(channelId),
            user_id: socket.user.id
          }
        }).then(async _ => {
                      Message.create({
                        channel_id: channelId,
                        user_id: socket.user.id,
                        content: "videocall_started",
                        message_type: "event"
                      }).then(message => chatIo.to("channel_"+channelId).emit('message-published', message));
                      chatIo.to(`channel_${channel.id}`).emit("videocall-started", {videocall_uuid: videocall_uuid})
        })
    })

    socket.on('endedVideochat', async data => {
      const {channelId} = data;
      if(socket.user.user_type === 'user') return;
      const channel = await Channel.findByPk(channelId);
      if(channel.user_id !== socket.user.id) return;
      const videocall_uuid = uuidv4();
      channel.update({videocall_started_at: sequelize.fn('NOW'), videocall_uuid: videocall_uuid}, {
          where: {
            channel_id: Number(channelId),
            user_id: socket.user.id
          }
        }).then(async _ => {
                      Message.create({
                        channel_id: channelId,
                        user_id: socket.user.id,
                        content: "videocall_ended",
                        message_type: "event"
                      }).then(message => { 
                        chatIo.to("channel_"+channelId).emit('message-published', message)
                      });
                      chatIo.to(`channel_${channel.id}`).emit("videocall-started", {videocall_uuid: videocall_uuid})
        })
    })
    });
    
}
