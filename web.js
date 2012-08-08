/**
 * require
 */
var express = require('express'),
    app     = express.createServer(),
    ejs     = require('ejs'),
    wsHttp  = require('http').createServer(),
    wsServer= require('websocket').server,
    ws      = new wsServer({
      httpServer : wsHttp,
      autoAcceptConnections : true
    });

/**
 * configure
 */
app.configure(function() {
  // static
  app.use(express.static(__dirname + '/public', { maxAge: 0 }));

  // ejs
  app.set('view engine', 'ejs');
  app.set('view options', { layout: false });
});

/**
 * express
 */
app.get('/', function(req, res) {
    res.render('index');
});

/**
 * WebScoket Server
 */

// `autoAcceptConnections` options alternative
// ws.on('request', function(request) {
//   console.log('request.');
//   console.log(request.origin);
//   console.log(request.requestedProtocols);
//   request.accept(null, null);
// });
 
ws.on('connect', function(connection) {
  console.log('connect.');
  connection.sendUTF('connect succeed!');

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data);
        connection.sendUTF(message.utf8Data);
    }
    else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
    }
  });

  connection.on('close', function(reasonCode, description) {
    console.log(reasonCode);
    console.log(description);
  });
});

/**
 * listen
 */
app.listen(process.env.PORT || 3000);
wsHttp.listen(3000);