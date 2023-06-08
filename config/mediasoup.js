const mediasoup = require('mediasoup');
module.exports = async () => {
    worker = await mediasoup.createWorker({
      rtcMinPort: 4000,
      rtcMaxPort: 5000,
    })
    console.log(`worker pid ${worker.pid}`)
  
    worker.on('died', error => {
      // This implies something serious happened, so kill the application
      console.error('mediasoup worker has died')
      setTimeout(() => process.exit(1), 2000) // exit in 2 seconds
    })
  
    return worker
  }