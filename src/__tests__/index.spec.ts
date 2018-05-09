
import {RedisConfig, IPriorityQueue, RedisPriorityQueue} from "../index";
import * as redis from "redis";

describe('RedisPriorityQueue', () => {
    let config: RedisConfig = new RedisConfig(
        "localhost",
        6822,
        null,
        null
    );
    let myQueue : IPriorityQueue = new RedisPriorityQueue(config);
    let testKey : string = "test123";

    let client : any = redis.createClient(); // for confirming app TODO: mock

    it('instantiates a queue', () => {
        expect(myQueue).toBeDefined();
    }); // constructor

    describe('length', () => {
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
                });
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

        it('returns number of elements in queue', (done) => {
            myQueue.length(testKey)
                .then(result => {
                    expect(result).toEqual(3);
                    done();
                })
                .catch(error => {
                    done.fail(error);
                });
        })
    }); // length

    describe('isEmpty', () => {
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
                });
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

        it('returns true if no elements are in queue', (done) => {
            myQueue.isEmpty("testEmptyKey123")
                .then(result => {
                    expect(result).toBeTruthy();
                    done();
                })
                .catch(error => {
                    done.fail(error);
                });
        });

        it('returns false if elements are in queue', (done) => {
            myQueue.isEmpty(testKey)
                .then(result => {
                    expect(result).toBeFalsy();
                    done();
                })
                .catch(error => {
                    done.fail(error);
                });
        });
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
                });
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
                });
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
                });
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
                });
        });
    }); // getHighestPriority
}); // redis priority queue
