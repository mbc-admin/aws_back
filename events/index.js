module.exports = (mediasoupIo, mediasoupWorker, chatIo, eventIo) => {
    require('./mediasoup')(mediasoupIo, mediasoupWorker);
    // require('./event')(eventIo);
    require('./chat')(chatIo);
}