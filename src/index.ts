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
        this._client = redis.createClient();
        console.log('Redis client created');
    }

    length(channel: string) : Promise<number> {
        return this._client.zrevrange(channel, );
    }

    isEmpty(channel: string) : Promise<boolean> { 
        return new Promise((resolve, reject) => {
            resolve(true);
        })
    }

    insertWithPriority(channel: string, element: any, priority: number) : Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`Inserting into ${channel} with priority ${priority} ...`);
            this._client.zincrby(channel, priority, element, (err: Error, reply: string) => {
                console.log({err, reply});
                console.log(`Inserted into ${channel} with priority ${priority}!`);
                resolve();
            });
        });
    }

    pullHighestPriority(channel: string) : Promise<string> {
        return new Promise((resolve, reject) => {

            for (let attempts = 0; attempts < this.MAX_ATTEMPTS; attempts++) {
                console.log(`Removing highest priority item from queue...`);
                this.peek(channel)
                    .then(item => {
                        console.log(`Fetched ${item} and attempting to remove ...`);
                        this._client.zrem(channel, item, (err: Error, reply: string) => {
                            console.log(`Removed item from queue`);
                            console.log({err, reply});
                            if (reply != "0") {
                                resolve(item);
                            }
                        });
                    })
                    .catch(error => {
                        console.error({error});
                        reject(error);
                    });
            }
        })
    }

    peek(channel: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            console.log(`Peeking at first record`);
            this._client.zrevrange(channel, 0, 0, (err: Error, reply: string) => {
                console.log({err, reply});
                resolve(reply[0]);
            });
        });
    }
}