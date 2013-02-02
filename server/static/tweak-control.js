var _settings = {
    domain: '0.0.0.0',
    port: '8888'
};

// Setup websocket
var _ws;
if ('WebSocket' in window) {
    _ws = new WebSocket('ws://' + _settings.domain + ':' + _settings.port + '/control');
    // _ws.onopen = _onOpen;
    _ws.onmessage = _receiveMessage;
} else {
    alert('WebSocket not supported');                                
}

// $(window).unload(function(event) {
//     _ws.close();
// });

/* Communication */

function _receiveMessage(msg) {
    var data = JSON.parse(msg.data);
    console.log(data);
}

function _sendMessage(data) {

    _ws.send(JSON.stringify(data));

    
    // if (_ws.readyState === 0) {
    //     _messageBuffer.push(data);
    // } else if (_ws.readyState === 1) {
    //     _ws.send(JSON.stringify(data));
    // }
}



function sliderChange(slider) {

    _sendMessage({
        'command': {
            'name': slider.name,
            'value': slider.value
        }
    });
}










