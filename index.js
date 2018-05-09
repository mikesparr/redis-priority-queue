"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis = require("redis");
var RedisConfig = (function () {
    function RedisConfig(host, port, username, password) {
        this.host = host;
        this.port = port;
        this.username = username ? username : null;
        this.password = password ? password : null;
    }
    return RedisConfig;
}());
exports.RedisConfig = RedisConfig;
var RedisPriorityQueue = (function () {
    function RedisPriorityQueue(config) {
        this.MAX_ATTEMPTS = 5;
        this._client = redis.createClient();
        console.log('Redis client created');
    }
    RedisPriorityQueue.prototype.length = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.zcard(channel, function (err, reply) {
                if (err !== null) {
                    console.error("Error getting length for channel '" + channel + "': ", err);
                    reject(err);
                }
                console.log("Channel '" + channel + "' length is: " + reply);
                resolve(reply);
            });
        });
    };
    RedisPriorityQueue.prototype.isEmpty = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.zcard(channel, function (err, reply) {
                if (err !== null) {
                    console.error("Error checking channel '" + channel + "' isEmpty: ", err);
                    reject(err);
                }
                console.log("Channel '" + channel + "' isEmpty: " + (reply > 0 ? false : true));
                resolve(reply === 0);
            });
        });
    };
    RedisPriorityQueue.prototype.insertWithPriority = function (channel, element, priority) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log("Inserting into " + channel + " with priority " + priority + " ...");
            _this._client.zincrby(channel, priority, element, function (err, reply) {
                if (err !== null) {
                    console.error("Error inserting into channel '" + channel + "': ", err);
                    reject(err);
                }
                console.log("Inserted into '" + channel + "' with priority '" + priority + "' and result: " + reply);
                resolve();
            });
        });
    };
    RedisPriorityQueue.prototype.pullHighestPriority = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log("Removing highest priority item from channel '" + channel + "'...");
            _this._client.multi()
                .zrevrange(channel, 0, 0, function (err, reply) {
                _this._client.zrem(channel, reply);
            })
                .exec(function (err, replies) {
                console.log({ err: err, replies: replies });
                if (err !== null) {
                    console.error("Error pulling item from channel '" + channel + "': ", err);
                    reject(err);
                }
                resolve(replies.length && replies.length > 0 ? replies[0].toString() : null);
            });
        });
    };
    RedisPriorityQueue.prototype.peek = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log("Peeking at first record");
            _this._client.zrevrange(channel, 0, 0, function (err, reply) {
                if (err !== null) {
                    console.error("Error peeking for first record in channel '" + channel + "': ", err);
                    reject(err);
                }
                resolve(reply.length && reply.length > 0 ? reply[0] : null);
            });
        });
    };
    return RedisPriorityQueue;
}());
exports.RedisPriorityQueue = RedisPriorityQueue;
//# sourceMappingURL=index.js.map