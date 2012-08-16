(function(win, doc, nav) {
  console.log('ws://'+location.hostname+':3000');

  doc.addEventListener('DOMContentLoaded', function() {
    var startBtn    = doc.getElementById('startCamera'),
        localVideo  = doc.getElementById('localVideo'),
        remoteVideo = doc.getElementById('remoteVideo'),
        enterRoom   = doc.getElementById('enterRoom');

    var p2p, localStream, remoteStream;

    //--------------------------------------------------------------------------
    // peerConnection's function
    function receiveRemoteStream(e) {
      console.log('receive Remote!');
      remoteStream = e.stream;
      remoteVideo.src = webkitURL.createObjectURL(e.stream);
    }

    function signalingCallback(a, b) {
      // console.log('signaling');
      // console.log(a,b);
    }

    //--------------------------------------------------------------------------
    // getUserMedia's function
    function receiveLocalStream(stream) {
      localStream = stream;
      localVideo.src = webkitURL.createObjectURL(stream);
    }

    function receiveLocalError() {
      console.log('error');
    }

    //----------------------------------------------------------------------
    // video
    localVideo.autoplay = true;
    nav.webkitGetUserMedia({
      video: true,
      audio: true
    }, receiveLocalStream, receiveLocalError);

    //--------------------------------------------------------------------------
    // Connect WebScoket & Enter Room
    enterRoom.addEventListener('submit', function(e) {

      //------------------------------------------------------------------------
      // p2p
      var offer, answer;
      p2p = new webkitPeerConnection00("STUN stun.ekiga.net", signalingCallback);
      p2p.onaddstream = receiveRemoteStream;
      p2p.onconnecting = function(e) {
        console.log('connecting...');
      };
      p2p.onopen = function(e) {
        console.log('open!');
      };
      p2p.addStream(localStream);

      //------------------------------------------------------------------------
      // ws
      var ws = new WebSocket('ws://'+location.hostname+':3000'),
          roomName = enterRoom.querySelector('[name="roomName"]').value;

      ws.sendData = function(call, dataObj) {
        ws.send(JSON.stringify({
          call: call,
          raw : dataObj
        }));
      };

      ws.onopen = function(e) {
        ws.sendData('roomName', {room:roomName});
      };

      ws.onmessage = function(message) {
        var dataObj  = JSON.parse(message.data),
            callType = dataObj.call,
            data     = dataObj.raw;

        console.log(dataObj);

        switch (callType) {
          case 'doOffer' :
            offer = p2p.createOffer({has_audio:true, has_video:true});
            p2p.setLocalDescription(p2p.SDP_OFFER, offer);
            ws.sendData('offer', {room: roomName, sdp: offer.toSdp()});
            p2p.startIce();
          break;
          case 'doAnswer' :
            p2p.setRemoteDescription(p2p.SDP_OFFER, new SessionDescription(data.sdp));
            offer = p2p.remoteDescription;
            answer = p2p.createAnswer(offer.toSdp(), {has_audio:true, has_video:true});
            p2p.setLocalDescription(p2p.SDP_ANSWER, answer);
            ws.sendData('answer', {room: roomName, sdp: answer.toSdp()});
            p2p.startIce();
          break;
          case 'established':
            p2p.setRemoteDescription(p2p.SDP_ANSWER, new SessionDescription(data.sdp));
          break;
        }
      };

      ws.onclose = function(e) {
        console.log('ws close...');
      };
      ws.onerror = function(e) {
        console.log('error!');
      };

      e.preventDefault();
    });
  });
})(window, document, navigator);
