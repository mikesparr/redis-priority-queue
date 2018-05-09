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
    username: string;
    password: string;

    constructor(host: string, port: number, username?: string, password?: string) {
        this.host = host;
        this.port = port;
        this.username = username ? username : null;
        this.password = password ? password : null;
    }
}

export class RedisPriorityQueue implements IPriorityQueue {
    protected _client: any;
    protected MAX_ATTEMPTS : number = 5;

    constructor(config: RedisConfig) {
        this._client = redis.createClient(); // TODO: use config 
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
        })
    }

    isEmpty(channel: string) : Promise<boolean> { 
        return new Promise((resolve, reject) => {
            this._client.zcard(channel, (err: Error, reply: number) => {
                if (err !== null) {
                    console.error(`Error checking channel '${channel}' isEmpty: `, err);
                    reject(err);
                }

                console.log(`Channel '${channel}' isEmpty: ${reply > 0 ? false : true}`);
                if (reply > 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        })
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

            for (let attempts = 0; attempts < this.MAX_ATTEMPTS; attempts++) {
                console.log(`Removing highest priority item from channel '${channel}'...`);
                this.peek(channel)
                    .then(item => {
                        console.log(`Fetched ${item} and attempting to remove ...`);
                        this._client.zrem(channel, item, (err: Error, reply: number) => {
                            if (err !== null) {
                                console.error(`Error popping latest record from channel '${channel}': `, err);
                                reject(err);
                            }
                            
                            console.log(`Removed item '${item}' from channel '${channel}'`);
                            if (reply > 0) {
                                resolve(item);
                            }
                        });
                    })
                    .catch(error => {
                        console.error(`Error peeking for record to pop in channel '${channel}': `, error);
                        reject(error);
                    });
            }
        })
    }

    peek(channel: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            console.log(`Peeking at first record`);
            this._client.zrevrange(channel, 0, 0, (err: Error, reply: string) => {
                if (err !== null) {
                    console.error(`Error peeking for first record in channel '${channel}': `, err);
                    reject(err);
                }

                resolve(reply[0]); // TODO: guard against unexpected type
            });
        });
    }
}