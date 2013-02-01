


;(function () {

    var _settings = {
        domain: '0.0.0.0',
        port: '8888'
    };

    // Setup websocket
    var _ws;
    if ('WebSocket' in window) {
        _ws = new WebSocket('ws://' + _settings.domain + ':' + _settings.port + '/client');
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
        var name = data['name'];
        var value = data['value'];
        console.log(name + ' ' + value);

        if (_has(_boundVariables, name)) {
            _inject(name, value)
        }
    }


    /* Binding Data */

    var _boundVariables = {};
    window.bv = _boundVariables;

    function _createBindingRecord(property) {
        return {
                 'name': null,
                 'property': property,
                 'ref': null,
                 'high': 1,
                 'low': 0,
                 'type': 'real'
            };
    }

    function _inject(name, value) {
        var record = _boundVariables[name];
        record.ref[record.property] = value;
    }
    
    /* Helpers */

    function _has(obj, property) {
        return Object.prototype.hasOwnProperty.call(obj, property);
    }

    function _assert(value, message) {
        function AssertionError(message) {
            this.message = message;
        }

        AssertionError.prototype.toString = function() {
            return 'AssertionError: ' + this.message;
        }

        var test = (value === true);
        if (!test) {
            throw new AssertionError(message);
        }
        return test;
    }

    
    

    

    /* Tweak API */

    function _normalizeType(type) {
        var lowercaseType = type.toLowerCase();
        var typeMap = {
            'int': 'int',
            'integer': 'int',
            'real': 'real',
            'bool': 'bool',
            'boolean': 'bool'
        }

        if (_has(typeMap, lowercaseType)) {
            return typeMap[lowercaseType];
        } else {
            return type;
        }
    }

    function _createChainable(record) {
        return {
            nameed: function (name) {
                record.name = name;
                delete this.aliased;
                return this;
            },
            in: function (ref) {
                if (_assert(typeof ref === 'object', 'Argument to .in() must be an object.')) {
                    record.ref = ref;
                };
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
                do: function (fn) {
                    record.fn = fn;
                }
            }
        };
    }

    Tweak = function (property) {
        var record = _createBindingRecord(property);
        var chainable = _createChainable(record);
        setTimeout(function () {
            if (_assert(record.ref !== null || record.fn !== undefined, 'Tweak statement must specify one of either .in() or .do().')) {
                record.name = record.name || record.property;
                _boundVariables[record.name] = record;
            }
        }, 0);
        return chainable;
    };

    Tweak.config = function (options) {

    };

    window.Tweak = Tweak;

})();