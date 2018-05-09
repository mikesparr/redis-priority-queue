
import * as queue from "../index";
import * as redis from "redis";

describe('RedisPriorityQueue', () => {
    let config: queue.RedisConfig = new queue.RedisConfig(
        "localhost",
        6822,
        null,
        null
    );
    let myQueue : queue.IPriorityQueue = new queue.RedisPriorityQueue(config);
    let testKey : string = "test123";

    let client : any = redis.createClient(); // for confirming app TODO: mock

    it('instantiates a queue', () => {
        expect(myQueue).toBeDefined();
    }); // constructor

    describe('isEmpty', () => {

    }); // isEmpty

    describe('peek', () => {

        beforeAll((done) => {
            Promise.all([
                myQueue.insertWithPriority(testKey, "hello", 1),
                myQueue.insertWithPriority(testKey, "world", 2),
                myQueue.insertWithPriority(testKey, "foo", 1)
            ])
                .then(values => {
                    done();
                })
                .catch(error => {
                    done.fail(error);
                })
        });

        afterAll((done) => {
            client.del(testKey, (err, reply) => {
                if (err !== null) {
                    done.fail(err);
                } else {
                    done();
                }
            });
        });

        it('returns expected high-scoring record', (done) => {
            myQueue.peek(testKey)
                .then(result => {
                    console.log(`Result: ${result} is type ${typeof(result)}`);
                    expect(result).toEqual("world");
                    done();
                })
                .catch(error => {
                    done.fail(error);
                });
        });
    }); // peek
    
    describe('insertWithPriority', () => {
        beforeAll((done) => {
            Promise.all([
                myQueue.insertWithPriority(testKey, "hello", 1),
                myQueue.insertWithPriority(testKey, "world", 2),
                myQueue.insertWithPriority(testKey, "foo", 1)
            ])
                .then(values => {
                    done();
                })
                .catch(error => {
                    done.fail(error);
                })
        });

        afterAll((done) => {
            client.del(testKey, (err, reply) => {
                if (err !== null) {
                    done.fail(err);
                } else {
                    done();
                }
            });
        });

        it('inserted 2 records with 1 score', (done) => {
            client.zcount(testKey, 0, 1, (err, reply) => {
                console.log(`testing 1 score ...`);
                console.log({err, reply});
                expect(reply).toEqual(2);
                done();
            });
        });

        it('inserted 1 records with 2 score', (done) => {
            client.zcount(testKey, 2, 5, (err, reply) => {
                console.log(`testing 1 score ...`);
                console.log({err, reply});
                expect(reply).toEqual(1);
                done();
            });
        });
    }); // insertWithPriority

    describe('getHighestPriority', () => {
        beforeAll((done) => {
            Promise.all([
                myQueue.insertWithPriority(testKey, "hello", 1),
                myQueue.insertWithPriority(testKey, "world", 2),
                myQueue.insertWithPriority(testKey, "foo", 1)
            ])
                .then(values => {
                    done();
                })
                .catch(error => {
                    done.fail(error);
                })
        });

        afterAll((done) => {
            client.del(testKey, (err, reply) => {
                if (err !== null) {
                    done.fail(err);
                } else {
                    done();
                }
            });
        });

        it('pops highest priority item from queue', (done) => {
            myQueue.pullHighestPriority(testKey)
                .then(result => {
                    // assert popped value is highest priority
                    expect(result).toEqual("world");

                    // confirm length of queue is now 2
                    client.zcount(testKey, 0, 5, (err, reply) => {
                        console.log(`testing remaining item count ...`);
                        console.log({err, reply});
                        expect(reply).toEqual(2);
                        done();
                    });
                })
                .catch(error => {
                    done.fail(error);
                })
        });
    }); // getHighestPriority
}); // redis priority queue
