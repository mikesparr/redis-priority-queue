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
        return this._client.zrevrange(channel);
    };
    RedisPriorityQueue.prototype.isEmpty = function (channel) {
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    };
    RedisPriorityQueue.prototype.insertWithPriority = function (channel, element, priority) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log("Inserting into " + channel + " with priority " + priority + " ...");
            _this._client.zincrby(channel, priority, element, function (err, reply) {
                console.log({ err: err, reply: reply });
                console.log("Inserted into " + channel + " with priority " + priority + "!");
                resolve();
            });
        });
    };
    RedisPriorityQueue.prototype.pullHighestPriority = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var poppedItem = null;
            var attempts = 0;
            do {
                console.log("Removing highest priority item from queue...");
                _this.peek(channel)
                    .then(function (item) {
                    console.log("Fetched " + item + " and attempting to remove ...");
                    _this._client.zrem(channel, item, function (err, reply) {
                        console.log("Removed item from queue");
                        console.log({ err: err, reply: reply });
                        if (reply != "0") {
                            poppedItem = item;
                        }
                        attempts++;
                    });
                });
            } while (poppedItem === null || attempts === _this.MAX_ATTEMPTS);
            resolve(poppedItem);
        });
    };
    RedisPriorityQueue.prototype.peek = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log("Peeking at first record");
            _this._client.zrevrange(channel, 0, 0, function (err, reply) {
                console.log({ err: err, reply: reply });
                resolve(reply[0]);
            });
        });
    };
    return RedisPriorityQueue;
}());
exports.RedisPriorityQueue = RedisPriorityQueue;
//# sourceMappingURL=index.js.map