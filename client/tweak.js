


;(function () {

    var _settings = {
        domain: '0.0.0.0',
        port: '8888'
    };

    // Setup websocket
    var _ws;
    if ('WebSocket' in window) {
        _ws = new WebSocket('ws://' + _settings.domain + ':' + _settings.port);
        _ws.onopen = _onOpen;
        _ws.onmessage = _receiveMessage;
    } else {
        alert('WebSocket not supported');
    }

    $(window).unload(function(event) {
        _ws.close();
    });

    /* Communication */

    var _messageBuffer = [];
    function _onOpen() {
        _sendMessage({'event': {'type': 'startup'}});
        for (var i = 0; i < _messageBuffer.length; i++) {
            _sendMessage(_messageBuffer[i]);
        }
        _messageBuffer = [];
    }

    function _receiveMessage(msg) {

        var data = JSON.parse(msg.data);

        if (_has(data, 'command')) {
            _executeCommand(data['command']);
        }

    }

    function _sendMessage(data) {
        if (_ws.readyState === 0) {
            _messageBuffer.push(data);
        } else if (_ws.readyState === 1) {
            _ws.send(JSON.stringify(data));
        }
    }


    function _executeCommand(data) {
        var key = data['key'];
        var value = data['value'];
        console.log(key + ' ' + value);

        if (_has(boundParams, key)) {
            _inject(key, value)
        }
    }


    /* Bindings */

    var boundParams = {};
    function _bind(key, ref) {

        if (typeof ref === 'object') {

            if (!_has(boundParams, key)) {
                _sendMessage({param: key});
            }

            boundParams[key] = ref;
        } else {
            console.log('reference not an object');
        }
    }

    function _inject(key, val) {
        boundParams[key][key] = val;
    }
    
    /* Helpers */

    function _has(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }


    function _normalizeType(type) {
        var typeMap = {
            'int': 'int',
            'integer': 'int',
            'real': 'real',
            'bool': 'bool',
            'boolean': 'bool'
        }
        return typeMap[type];
    }

    var _boundVariables = {};
    window.bv = _boundVariables;

    function _getBindingRecord(alias) {
        return _boundVariables[alias] = _boundVariables[alias] ||
            {
                 'alias': alias,
                 'key': alias,
                 'ref': null,
                 'high': 1,
                 'low': 0,
                 'type': 'real'
            };
    }

    function chainable(key, alias) {
        alias = alias || key;
        var record = _getBindingRecord(alias);
        record.key = key;

        return {
            in: function (ref) {
                record.ref = ref;
                delete this.in;
                return this;
            },
            within: function (low, high) {
                record.low = low;
                record.high = high;
                delete this.within;
                return this;
            },
            as: function (type) {
                record.type = _normalizeType(type);
                if (type === 'bool') {
                    delete this.within;
                    delete record.low;
                    delete record.high;
                } else if (record.type === 'int' && _has(this, 'within')) {
                    record.low = 0;
                    record.high = 100;
                }
                delete this.as;
                return this;
            },
            and: {
                run: function (fn) {
                    record.fn = fn;
                }
            }
        };
    }

    Tweak = function (key, alias) {
        return chainable(key, alias);
    };

    Tweak.config = function (options) {

    };

    window.Tweak = Tweak;

})();