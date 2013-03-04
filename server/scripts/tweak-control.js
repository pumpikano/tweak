var _config = {
    domain: window.location.hostname || '0.0.0.0',
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
    } else if (_has(data, 'event')) {
        if (data['event']['type'] === 'startup') {
            console.log(_renderedNodes);
            $.each(_renderedNodes, function (name, node) {
                node.remove();
            });
        }
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

function _setValue(name, value) {
    _sendMessage({
        'command': {
            'name': name,
            'value': value
        }
    });
}
window.setValue = _setValue;

/* Widget Rendering */

var currentRenderer;
window.registerRenderer = function (fnRenderer) {
    currentRenderer = fnRenderer;
};

var _renderedNodes = {};
function _renderBinding(binding) {
    $.getScript('widgets/' + binding.type + '.js',
        function (script, textStatus) {
            var controlElem = $(currentRenderer.call(null, binding));
            var node = $('<div class="control-wrap"></div>')
                .css('border-color', _colorForName(binding.name))
                .append(controlElem)
                .appendTo('body');
            _renderedNodes[binding.name] = node;
        });
}

var colors = [
    '#B0171F',
    '#FF69B4',
    '#8B7B8B',
    '#9B30FF',
    '#3D59AB',
    '#5CACEE',
    '#8EE5EE',
    '#528B8B',
    '#43CD80',
    '#008000',
    '#EEEED1',
    '#E3CF57',
    '#F5DEB3',
    '#8B7355',
    '#8B8682',
    '#8B2500',
    '#BC8F8F',
    '#800000',
    '#C0C0C0',
    '#C9C9C9'
];

function _colorForName(name) {
    var memo = 0;
    for (var i = 0; i < name.length; i++) {
        memo += name.charCodeAt(i);
    }
    return colors[memo % colors.length];
}
/* Helpers */

function _has(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property);
}






