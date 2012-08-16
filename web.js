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
    }),
    roomList = {},
    sdpList  = {};

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
 
ws.on('connect', function(conn) {
  console.log('connect.');

  conn.sendMsg = function(call, dataObj) {
    console.log(call);
    conn.sendUTF(JSON.stringify({
      call: call,
      raw : dataObj
    }));
  };

  conn.on('message', function(message) {
    var dataObj  = JSON.parse(message.utf8Data),
        callType = dataObj.call,
        data     = dataObj.raw,
        room;

    switch (callType) {
      case 'roomName' :
        room = roomList[data.room] || (roomList[data.room] = []);
        switch (room.length) {
          case 0 :
            conn.sendMsg('doOffer');
          break;
          case 1 :
            conn.sendMsg('doAnswer', {sdp: getSDP(room[0])});
          break;
          default :
            // if is full room force empty and new offering.
            roomList[data.room] = [];
            conn.sendMsg('doOffer');
          break;
        }
      break;
      case 'offer' :
        room = enterRoom(data.room, conn);
        setSDP(conn, data.sdp);
      break;
      case 'answer' :
        room = enterRoom(data.room, conn);
        room[0].sendMsg('established', {sdp: data.sdp});
      break;
    }
  });

  conn.on('close', function(reasonCode, description) {
    console.log(reasonCode);
    console.log(description);
  });
});

/**
 * Room Action
 */
function setSDP(conn, sdp) {
  sdpList[conn] = sdp;
}

function getSDP(conn) {
  return sdpList[conn];
}

function enterRoom(roomName, conn) {
  var room = roomList[roomName] || (roomList[roomName] = []);

  room.push(conn);

  return room;
}

// function notifyRoom(roomName, message) {
//   var room = roomList[roomName] || (roomList[roomName] = []);

//   room.forEach(function(conn) {
//     conn.sendUTF(message);
//   });
// }

/**
 * listen
 */
app.listen(process.env.PORT || 3000);
wsHttp.listen(3000);