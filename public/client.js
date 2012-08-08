(function(win, doc) {
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
    var startBtn = doc.getElementById('startCamera');

    startBtn.addEventListener('click', function() {
      console.log('click');
    });

});})(window, document);
