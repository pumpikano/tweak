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

function _getTemplate(type) {
    return '<input type="range" name="{{name}}" min="{{low}}" max="{{high}}" value="{{value}}" onchange="sliderChange(this)">';
}

function _renderBinding(binding) {
    var template = _getTemplate(binding.type);
    var html = Mustache.render(template, binding);
    $(html).appendTo('body');
    // console.log(node);
}

$(function () {
    _renderBinding({
        'type': 'int', 
        'name': 'max',
        'low': 0,
        'high': 900,
        'value': 600
    });
});






