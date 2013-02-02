


;(function (undefined) {

    var _config = {
        domain: '0.0.0.0',
        port: '8888'
    };

    /* Setup connection */

    var _ws = null;
    function _initConnection() {
        if ('WebSocket' in window) {
            _ws = new WebSocket('ws://' + _config.domain + ':' + _config.port + '/client');
            _ws.onopen = _onOpen;
            _ws.onmessage = _receiveMessage;
        } else {
            alert('Cannot run Tweak because WebSocket is not supported');
        }
    }
    
    $(window).unload(function(event) {
        _ws.close();
    });

    /* Communication */

    var _messageBuffer = [];
    function _onOpen() {

        // Send connection ack
        _sendMessage({'event': {'type': 'startup'}});

        // Send any messages that might have been 
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
        // If we haven't opened a connection yet, buffer the message
        if (_ws.readyState === 0) {
            _messageBuffer.push(data);

        // Otherwise send the message now
        } else if (_ws.readyState === 1) {
            _ws.send(JSON.stringify(data));
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

    /* Remote Command Execution */

    function _executeCommand(data) {
        var name = data['name'];
        var value = data['value'];
        var record = _boundVariables[name];
        if (record) {
            // If this record has a reference and we have a value, inject the value
            if (_has(record, 'ref') && value !== undefined) {
                _inject(name, value);
            }

            // If we have a function for this record, run it, passing it the value
            if (_has(record, 'fn')) {
                record.fn.call(null, value);
            }

            // Confirm execution of this command
            // _sendMessage()
        }
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
            named: function (name) {
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

    var Tweak = function (property) {

        // Establish connection if needed
        if (!_ws) _initConnection();

        // Create record for this bound variable and create a chainable object to build its properties
        var record = _createBindingRecord(property);
        var chainable = _createChainable(record);

        // Save this record when the stack has cleared (i.e. after all the chainable's methods are done executing)
        setTimeout(function () {
            if (_assert(record.ref !== null || record.fn !== undefined, 'Tweak statement must specify one of either .in() or .do().')) {
                record.name = record.name || record.property;
                if (!record.ref) {
                    delete record.ref;
                } else {
                    record.value = record.ref[record.property];
                }
                _boundVariables[record.name] = record;
            }
        }, 0);

        return chainable;
    };

    Tweak.config = function (options) {
        if (_has(options, 'domain')) {
            _config.domain = options.domain;
        }
        if (_has(options, 'port')) {
            _config.port = options.port;
        }
    };

    Tweak.comm = {};
    Tweak.comm.sendMessage = function (data) {
        var msg = {};
        msg['client'] = data;
        _sendMessage(msg);
    };

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

    /* Export */

    window.Tweak = Tweak;
})();