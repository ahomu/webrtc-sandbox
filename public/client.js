(function(win, doc, nav) {
  console.log('ws://'+location.hostname+':3000');

  var ws = new WebSocket('ws://'+location.hostname+':3000');

  ws.onopen = function(a, b, c) {
    console.log(a, b, c);
  };
  ws.onclose = function(a, b, c) {
    console.log(a, b, c);
  };
  ws.onmessage = function(event) {
    var messBody = event.data;
    // ws.send(messBody+' + hoge');
  };
  ws.onerror = function(a, b, c) {
    console.log(a, b, c);
  };

  doc.addEventListener('DOMContentLoaded', function() {
    var startBtn = doc.getElementById('startCamera'),
        showArea = doc.getElementById('output');

    showArea.autoplay = true;

    startBtn.addEventListener('click', function() {
      // WebRTC
      nav.webkitGetUserMedia({
        video: true,
        audio: true
      }, function (stream) {
        // on success
        console.log('success');
        console.log(stream);
        output.src  = webkitURL.createObjectURL(stream);
      }, function () {
        // on error
        console.log('error');
      });
    });

});})(window, document, navigator);
