import * as redis from "redis";

export interface IPriorityQueue {
    length(channel: string): Promise<number>;
    isEmpty(channel: string) : Promise<boolean>;
    insertWithPriority(channel: string, element: any, priority: number) : Promise<void>;
    pullHighestPriority(channel: string) : Promise<string>;
    peek(channel: string): Promise<string>;
}

export class RedisConfig {
    host: string;
    port: number;
    db: number;
    password: string;

    constructor(host: string, port: number, db?: number, password?: string) {
        this.host = host;
        this.port = port;
        this.db = db ? db : null;
        this.password = password ? password : null;
    }
}

export class RedisPriorityQueue implements IPriorityQueue {
    protected _client: any;
    protected readonly DEFAULT_REDIS_HOST : string = "localhost";
    protected readonly DEFAULT_REDIS_PORT : number = 6379;

    constructor(config: RedisConfig) {
        // build properties for instantiating Redis
        let options: {[key: string]: any} = {
            host: config.host || this.DEFAULT_REDIS_HOST,
            port: config.port || this.DEFAULT_REDIS_PORT,
            retry_strategy: function (options: any) {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    // End reconnecting on a specific error and flush all commands with
                    // a individual error
                    return new Error('The server refused the connection');
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    // End reconnecting after a specific timeout and flush all commands
                    // with a individual error
                    return new Error('Retry time exhausted');
                }
                if (options.attempt > 10) {
                    // End reconnecting with built in error
                    return undefined;
                }
                // reconnect after
                return Math.min(options.attempt * 100, 3000);
            }
        };
        if (config.db) options.db = config.db;
        if (config.password) options.password = config.password;

        this._client = redis.createClient(options);
        console.log('Redis client created');
    }

    length(channel: string) : Promise<number> {
        return new Promise((resolve, reject) => {
            this._client.zcard(channel, (err: Error, reply: number) => {
                if (err !== null) {
                    console.error(`Error getting length for channel '${channel}': `, err);
                    reject(err);
                }

                console.log(`Channel '${channel}' length is: ${reply}`);
                resolve(reply);
            });
        });
    }

    isEmpty(channel: string) : Promise<boolean> { 
        return new Promise((resolve, reject) => {
            this._client.zcard(channel, (err: Error, reply: number) => {
                if (err !== null) {
                    console.error(`Error checking channel '${channel}' isEmpty: `, err);
                    reject(err);
                }

                console.log(`Channel '${channel}' isEmpty: ${reply > 0 ? false : true}`);
                resolve(reply === 0);
            });
        });
    }

    insertWithPriority(channel: string, element: any, priority: number) : Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`Inserting into ${channel} with priority ${priority} ...`);
            this._client.zincrby(channel, priority, element, (err: Error, reply: number) => {
                if (err !== null) {
                    console.error(`Error inserting into channel '${channel}': `, err);
                    reject(err);
                }

                console.log(`Inserted into '${channel}' with priority '${priority}' and result: ${reply}`);
                resolve();
            });
        });
    }

    pullHighestPriority(channel: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            console.log(`Removing highest priority item from channel '${channel}'...`);
            this._client.multi()
                .zrevrange(channel, 0, 0, (err: Error, reply: string) => {
                    if (err !== null) {
                        console.error(`Error fetching next item from '${channel}' to remove: `, err);
                        reject(err);
                    }
                    const member: string = reply && Object.keys(reply).length > 0 ? reply : "none";
                    this._client.zrem(channel, member);
                })
                .exec((err: Error, replies: string) => {
                    console.log({err, replies});
                    if (err !== null) {
                        console.error(`Error pulling item from channel '${channel}': `, err);
                        reject(err);
                    }

                    const item = replies.length && replies.length > 0 ? replies[0].toString() : null;
                    resolve(item && Object.keys(item).length > 0 ? item : null);
                });
        });
    }

    peek(channel: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            console.log(`Peeking at first record`);
            this._client.zrevrange(channel, 0, 0, (err: Error, reply: string) => {
                if (err !== null) {
                    console.error(`Error peeking for first record in channel '${channel}': `, err);
                    reject(err);
                }

                resolve(reply.length && reply.length > 0 ? reply[0] : null);
            });
        });
    }
}