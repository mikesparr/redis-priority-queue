import * as redis from "redis";
export interface IPriorityQueue<T> {
    length(channel: string): Promise<number>;
    isEmpty(channel: string): Promise<boolean>;
    insertWithPriority(channel: string, element: any, priority: number): Promise<void>;
    pullHighestPriority(channel: string): Promise<T>;
    peek(channel: string): Promise<T>;
}
export declare class RedisConfig {
    host: string;
    port: number;
    db: number;
    password: string;
    constructor(host: string, port: number, db?: number, password?: string);
}
export declare class RedisPriorityQueue implements IPriorityQueue<string> {
    protected client: redis.RedisClient;
    protected readonly DEFAULT_REDIS_HOST: string;
    protected readonly DEFAULT_REDIS_PORT: number;
    constructor(config: RedisConfig, client?: redis.RedisClient);
    length(channel: string): Promise<number>;
    isEmpty(channel: string): Promise<boolean>;
    insertWithPriority(channel: string, element: string, priority: number): Promise<void>;
    pullHighestPriority(channel: string): Promise<string>;
    peek(channel: string): Promise<string>;
}
