var _config = {
    domain: '0.0.0.0',
    port: '8888'
};

/* Setup connection */

var _ws = null;
(function _initConnection() {
    if ('WebSocket' in window) {
        _ws = new WebSocket('ws://' + _config.domain + ':' + _config.port + '/control');
        // _ws.onopen = _onOpen;
        _ws.onmessage = _receiveMessage;
    } else {
        alert('Cannot run Tweak because WebSocket is not supported');
    }
})();

$(window).unload(function(event) {
    _ws.close();
});

/* Communication */

function _receiveMessage(msg) {
    var data = JSON.parse(msg.data);
    console.log(data);

    if (_has(data, 'binding')) {
        _storeBindingRecord(data['binding']);
        _renderBinding(data['binding']);
    }
}

function _sendMessage(data) {
    _ws.send(JSON.stringify(data));
}

/* Data */

var _bindingRecords = {};
window.bv = _bindingRecords;
function _storeBindingRecord(record) {
    _bindingRecords[record.name] = record;
}

/* Interaction */

function _widgetEventDispatcher(event) {
    _sendMessage({
        'command': {
            'name': event.name,
            'value': event.value
        }
    });
}
window.widgetEventDispatcher = _widgetEventDispatcher;

/* Widget Rendering */

var _renderedNodes = [];
function _renderBinding(binding) {
    _getTemplateForType(binding.type)
        .done(function (template) {
            var node = $(Mustache.render(template, binding));
            _renderedNodes.push(node);

            node.css('left', _renderedNodes.length * 30);
            node.appendTo('body');
        });
}

function _getTemplateForType(type) {
    return $.ajax({
        url: 'http://' + _config.domain + ':' + _config.port + '/templates/' + type + '.html',
        dataType: 'html',
        type: 'get'
    });
}

/* Helpers */

function _has(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property);
}






