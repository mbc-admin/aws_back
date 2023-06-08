const express       = require('express');
const logger        = require('morgan');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const SocketIO = require('socket.io');
const mediasoup = require('./config/mediasoup');
const bodyParser    = require('body-parser');// This will be our application entry. We'll setup our server here.
const http = require('http');// Set up the express app
const app = express();// Log requests to the console.
const httpServer = http.createServer(app);
app.use(express.static("uploads"));
app.use(logger('dev'));
app.use(fileUpload());
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));// Setup a default catch-all route that sends back a welcome message in JSON format.
const port = parseInt(process.env.PORT, 10) || 8001;
app.set('port', port);

// Initalize SocketIO
const io = SocketIO(httpServer, {
     allowEIO3: true,
     transports: ['polling'],
     cors:{
          origin: '*',
     },
     pingInterval: 1000 * 60 * 5,
     pingTimeout: 1000 * 60 * 3
});

const chatIo = io.of('/nsp-io-chat');
const mediasoupIo = io.of('/nsp-io-mediasoup');

require('./routes')(app, chatIo);
app.get('*', (req, res) => res.status(200).send({
     message: 'Welcome to the beginning of nothingness.',
}));

(async () => {
     const msw = await await mediasoup();
     // Import socket io namespaces
     require('./events')(mediasoupIo, msw, chatIo);
 })().catch(e => {
     // Deal with the fact the chain failed
     console.log("error in await worker: ", e)
 });

httpServer.listen(port);
httpServer.on("listening", () => {
     console.log(`Server running on port ${port}`)
   });


module.exports = app;
