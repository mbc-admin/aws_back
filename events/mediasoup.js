
const socketAuth = require('../middlewares/socket-auth');
const user = require('../models').User;

module.exports = (mediasoupIo, mediasoupWorker) => {
    
    let rooms = {}          // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}
    let peers = {}          // { socketId1: { roomName1, socket, transports = [id1, id2,] }, producers = [id1, id2,] }, consumers = [id1, id2,], peerDetails }, ...}
    let transports = []     // [ { socketId1, roomName1, transport, consumer }, ... ]
    let producers = []      // [ { socketId1, roomName1, producer, }, ... ]
    let consumers = []      // [ { socketId1, roomName1, consumer, }, ... ]
    let worker = mediasoupWorker;


    const mediaCodecs = [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind       : "video",
          mimeType: 'video/h264',
          name       : "H264",
          clockRate  : 90000,
          parameters :
          {
            "packetization-mode"      : 1,
            "profile-level-id"        : "42e01f",
            "level-asymmetry-allowed" : 1
          }
        }
      ];

      mediasoupIo.use(async (socket, next) => {
        const token = socket.handshake.query.token;
        console.log("mediasoup token: ", socket.handshake.query.token)
        socketAuth(token)
          .then(res => { 
            console.log("mediasoup socket auth validated");
            // console.log(res);
            socket.user = res;
            socket.user.initials = `${socket.user.name[0]}${socket.user.lastname[0]}`;
            next()})
          .catch(error => {
            console.log("socket auth error")
            // console.log(error)
            next(error)})
        
        }).on('connection', async socket => {
        
          console.log("mediasoup connection: ",socket.id)
          peers[socket.id] = {peerDetails:{}}
        
          // Emit welcome event
          mediasoupIo.to(socket.id).emit('connection-success', {
              socketId: socket.id,
              user: socket.user
          })

          const removeItems = (items, socketId, type) => {
              items.forEach(item => {
                if (item.socketId === socket.id) {
                  item[type].close()
                }
              })
              items = items.filter(item => item.socketId !== socket.id)
          
              return items
            }
    
          socket.once('disconnect', (reason) => {
            // do some cleanup
            currentProducer = producers.filter(producer => producer.socketId === socket.id)[0];
            console.log('peer disconnected: ', socket.id)
            console.log('disconnect reason: ', reason)
            consumers = removeItems(consumers, socket.id, 'consumer')
            producers = removeItems(producers, socket.id, 'producer')
            transports = removeItems(transports, socket.id, 'transport')
           //  const { roomName } = peers[socket.id];
         
           mediasoupIo.emit('producer-left', currentProducer)
           mediasoupIo.emit('web-producer-left', { currentProducer })
         
            if (peers[socket.id]){
             const { roomName } = peers[socket.id];
              delete peers[socket.id];
           
              // remove socket from room
              if(rooms[roomName]){
               rooms[roomName] = {
                 router: rooms[roomName].router,
                 peers: rooms[roomName].peers.filter(socketId => socketId !== socket.id)
               }
              }
            }
           })

           socket.on('mediaDevicesCheck', async ({audio, video}) => {
            peers[socket.id].peerDetails.videoSignal = video;
            peers[socket.id].peerDetails.videoEnabled = video;
            peers[socket.id].peerDetails.audioEnabled = audio;
            // console.log("mediaDevicesCheck for socket ",socket.id, peers[socket.id])
          })

          socket.on('joinRoom', async ({ roomName, user }, callback) => {
            console.log("joinRoom", Date.now())
        
            roomName = roomName
            console.log("room name",roomName)
            console.log("dime user sent",socket.user)
            console.log("socket: ", socket.id)
            // create Router if it does not exist
            // const router1 = rooms[roomName] && rooms[roomName].get('data').router || await createRoom(roomName, socket.id)
           
            console.log("lets create room")
            const router1 = await createRoom(roomName, socket.id)
            console.log("room created")
        
            // peers[socket.id] = {
            //   socket,
            //   roomName,           // Name for the Router this Peer joined
            //   transports: [],
            //   producers: [],
            //   consumers: []
            // }
            peers[socket.id].socket = socket;
            peers[socket.id].roomName = roomName;
            peers[socket.id].transports = [];
            peers[socket.id].consumers = [];
            peers[socket.id].producers = [];
            peers[socket.id].peerDetails.name = `${socket.user.name} ${socket.user.lastname}`;
            peers[socket.id].peerDetails.initials = socket.user.initials;
            peers[socket.id].peerDetails.socketId = socket.id;
        
            // console.log("joinRoom: ", peers[socket.id])
        
            // get Router RTP Capabilities
            const rtpCapabilities = router1.rtpCapabilities
             console.log("rtpCapabilities ok")
           
            // call callback from the client and send back the rtpCapabilities
            callback({ rtpCapabilities })
          })

          socket.on('hangoutCall',  async (socketId) => {
            console.log("hangoutCall for socket ", socketId);
            var socketId = {socketId: socketId.socketId}
            mediasoupIo.emit("res-hangout", socketId);
            // let producer = await getTransport(socketId);
            // if(producer) producer.close();
          });

          const createRoom = async (roomName, socketId) => {
            // worker.createRouter(options)
            // options = { mediaCodecs, appData }
            // mediaCodecs -> defined above
            // appData -> custom application data - we are not supplying any
            // none of the two are required
            let router1
            let peers = []
            if (rooms[roomName]) {
              router1 = rooms[roomName].router
              peers = rooms[roomName].peers || []
              console.log("peers in room for socket id: ", socket.id, peers);
            } else {
              console.log("lets create createRouter")
              router1 = await worker.createRouter({ mediaCodecs, })
            }
        
        
            
            rooms[roomName] = {
              router: router1,
              peers: [...peers, socketId],
            }
        
            console.log("createRoom ok")
            return router1
          }

          // Client emits a request to create server side Transport
  // We need to differentiate between the producer and consumer transports
  socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
    // get Room Name from Peer's properties
    const roomName = peers[socket.id].roomName

    // get Router (Room) object this peer is in based on RoomName
    const router = rooms[roomName].router


    createWebRtcTransport(router).then(
      transport => {
        callback({
          params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          }
        })

        // add transport to Peer's properties
        addTransport(transport, roomName, consumer)
      },
      error => {
        console.log(error)
      })
  })

  const addTransport = (transport, roomName, consumer) => {

    transports = [
      ...transports,
      { socketId: socket.id, transport, roomName, consumer, }
    ] 

    peers[socket.id] = {
      ...peers[socket.id],
      transports: [
        ...peers[socket.id].transports,
        transport.id,
      ]
    }
  }

  const addProducer = (producer, roomName) => {
    console.log("adding producer peersdetail: ", peers[socket.id].peerDetails)
    producers.push({ socketId: socket.id, producer, roomName, user: peers[socket.id].peerDetails});
    if (peers[socket.id].producers.filter(producer => producer.socketId === socket.id).length === 0){
      peers[socket.id] = {
        ...peers[socket.id],
        producers: [
          ...peers[socket.id].producers,
          // {producerId: producer.id, socketId: socket.id},
          producer.id
        ]
      }
    }
  }

  const addConsumer = (consumer, roomName) => {
  // add the consumer to the consumers list
  // consumerExists = peers[socket.id].consumers.filter(consumer => consumer.socketId === socket.id).length;
  // if (!consumerExists){
    consumers = [
      ...consumers,
      { socketId: socket.id, consumer, roomName, user: peers[socket.id].peerDetails}
    ]

    // add the consumer id to the peers list
    
    peers[socket.id] = {
      ...peers[socket.id],
      consumers: [
        ...peers[socket.id].consumers,
        consumer.id,
      ]
    }
  }

  socket.on('getProducers', callback => {
    //return all producer transports
    const { roomName } = peers[socket.id]

    let producerList = []
    producers.forEach(producerData => {
      console.log("LOG producer data: ", producerData)
      if (producerData.socketId !== socket.id && producerData.roomName === roomName) {
          // producerList = [...producerList, producerData.producer.id]
          producerList = [...producerList, {producerId: producerData.producer.id, user: producerData.user}];
        }
      })
      
    // console.log("getProducers: ", producerList)
    // return the producer list back to the client
    console.log("producers list for "+socket.id+":")
    console.log(producerList)
    callback(producerList)
  })

  const informConsumers = (roomName, socketId, id) => {

    // A new producer just joined
    // let all consumers to consume this producer
    producers.forEach(producerData => {
      if (producerData.socketId !== socketId && producerData.roomName === roomName) {
        // if (producerData.socketId !== socketId && producerData.roomName === roomName) {
        const producerSocket = peers[producerData.socketId].socket
        // use socket to send producer id to producer
        console.log("notify new producer id: ", producerData);
        console.log("socket.id: ", socket.id)
        console.log("user.socktId: ", producerData.user.socketId)
        // let userData = producers.find(producer => producer.socketId === socket.id).user
        let userData = peers[socketId].peerDetails;
        console.log("userData ojo: ", userData)
        
        producerSocket.emit('new-producer', {producerId: id, user: userData})
      }
    })
   }

   const getTransport = (socketId) => {
    const [producerTransport] = transports.filter(transport => transport.socketId === socketId && !transport.consumer)
    return producerTransport.transport
  }

  // see client's socket.emit('transport-connect', ...)
  socket.on('transport-connect', ({ dtlsParameters }) => {
    console.log("transport-connect socket", socket.id)
    console.log("dtlsParameters",dtlsParameters)


     getTransport(socket.id).connect({ dtlsParameters })



  })

  // see client's socket.emit('transport-produce', ...)
 socket.on('transport-produce', async ({ kind, rtpParameters, appData }, callback) => {
  console.log("transport-produce: ", socket.id);
  // call produce based on the prameters from the client

  const producer = await getTransport(socket.id).produce({
    kind,
    rtpParameters,
  })

  // console.log("rtpParameters", rtpParameters)
  

  // add producer to the producers array
  const { roomName } = peers[socket.id]
  console.log("transport-produce kind: ", kind)
  console.log("transport-produce room name: ", roomName)
  console.log("transport-produce: ", peers[socket.id].peerDetails)

  addProducer(producer, roomName)

  informConsumers(roomName, socket.id, producer.id)

  producer.on('transportclose', () => {
    console.log("producer closed: ", socket.id)
    producer.close()
  })

  producer.on('score',  (score) => {
    console.log("producer score: ", score)
    
  })

  console.log("producers exists: ", producers.length > 1)

  // Send back to the client the Producer's id
  callback({
    id: producer.id,
    producersExist: producers.length > 1 ? true : false
  })
})

   // see client's socket.emit('transport-recv-connect', ...)
 socket.on('transport-recv-connect', async ({ dtlsParameters, serverConsumerTransportId }) => {
  const consumerTransport = transports.find(transportData => (
    transportData.consumer && transportData.transport.id == serverConsumerTransportId
  )).transport
 
  console.log("consumerTransport.connect")
  await consumerTransport.connect({ dtlsParameters })
  });

  socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
    try {
  
      const { roomName } = peers[socket.id]
      const router = rooms[roomName].router
      let consumerTransport = transports.find(transportData => (
        transportData.consumer && transportData.transport.id == serverConsumerTransportId
      )).transport
  
      // check if the router can consume the specified producer
      if (router.canConsume({
        producerId: remoteProducerId,
        rtpCapabilities
      })) {
        // transport can now consume and return a consumer
        const consumer = await consumerTransport.consume({
          producerId: remoteProducerId,
          rtpCapabilities,
          paused: true,
        })
  
        consumer.on('transportclose', () => {
          console.log('transport close from consumer')
        })
  
        consumer.on('producerclose', () => {
          console.log("producerclose start")
          socket.emit('producer-closed', { remoteProducerId, kind: params.kind })
  
          consumerTransport.close([])
          
          transports = transports.filter(transportData => transportData.transport.id !== consumerTransport.id)
          consumer.close()
          consumers = consumers.filter(consumerData => consumerData.consumer.id !== consumer.id)
          console.log("Test closing producer")
        })
  
        addConsumer(consumer, roomName)
  
        // from the consumer extract the following params
        // to send back to the Client
        const params = {
          id: consumer.id,
          producerId: remoteProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          serverConsumerId: consumer.id,
        }
  
        // send the parameters to the client
        callback({ params })
      }
    } catch (error) {
      console.log(error.message)
      callback({
        params: {
          error: error
        }
      })
    }
  })

  socket.on('consumer-resume', async ({ serverConsumerId }) => {
    console.log('consumer resume', serverConsumerId)
    console.log(consumers.length);
    const { consumer } = consumers.find(consumerData => consumerData.consumer.id === serverConsumerId)
    await consumer.resume()
  });

  socket.on('toggle-video', ({producerId}) => {
 
    const { roomName } = peers[socket.id];
    console.log("toggle-video socket.id: ", socket.id)
    console.log("toggle-video producer: ", peers[socket.id])
    peers[socket.id].peerDetails.videoEnabled = !peers[socket.id].peerDetails.videoEnabled;
    
    rooms[roomName].peers.forEach(peer => {
      if (peer !== socket.id) {
        console.log("emit to peer: ", peer)
        console.log("emit data: ", socket.id)
        // let producersSize = peers[socket.id].producers.length - 1;
        let remoteProducers = peers[socket.id].producers;
        socket.to(peer).emit("toggle-video-producer", {socketId: socket.id, remoteProducers: {audioProducer: remoteProducers[0], videoProducer: remoteProducers[1]}});
      }
    })
  });
    
  });
  const createWebRtcTransport = async (router) => {
    return new Promise(async (resolve, reject) => {
      try {
        // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
        const webRtcTransport_options = {
          listenIps: [
            {
              ip: '82.223.37.251', // replace with relevant IP address
            }
          ],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        }
  
        // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
        let transport = await router.createWebRtcTransport(webRtcTransport_options)
        
  
        transport.on('dtlsstatechange', dtlsState => {
          if (dtlsState === 'closed') {
            transport.close()
          }
        })
  
        transport.on('close', () => {
          console.log('transport closed')
        })
  
        resolve(transport)
  
      } catch (error) {
        reject(error)
      }
    })
  }
}