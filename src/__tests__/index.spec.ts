import * as redis from "redis";
import {IPriorityQueue, RedisConfig, RedisPriorityQueue} from "../index";

describe("RedisPriorityQueue", () => {
    const config: RedisConfig = new RedisConfig(
        "localhost",
        6379,
        null,
        null,
    );
    const myQueue: IPriorityQueue<string> = new RedisPriorityQueue(config);
    const testKey: string = "test123";
    const testEmptyKey: string = "testEmptyKey999";
    const unusedKey: string = "unusedKey333";

    const client: any = redis.createClient(); // for confirming app TODO: mock

    it("instantiates a queue", () => {
        expect(myQueue).toBeInstanceOf(RedisPriorityQueue);
    }); // constructor

    beforeAll((done) => {
        Promise.all([
            myQueue.insertWithPriority(testKey, "hello", 1),
            myQueue.insertWithPriority(testKey, "world", 2),
            myQueue.insertWithPriority(testKey, "foo", 1),
        ])
            .then((values) => {
                done();
            })
            .catch((error) => {
                done.fail(error);
            });
    });

    afterAll((done) => {
        client.multi()
            .del(testKey)
            .del(testEmptyKey)
            .del(unusedKey)
            .exec((err, reply) => {
                if (err !== null) {
                    done.fail(err);
                } else {
                    done();
                }
            });
    });

    describe("length", () => {
        it("returns a Promise", () => {
            expect(myQueue.length(testKey)).toBeInstanceOf(Promise);
        });

        it("throws error if channel not valid", (done) => {
            myQueue.length(null)
                .then((result) => {
                    done.fail();
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                });
        });

        it("returns number of elements in active queue", (done) => {
            myQueue.length(testKey)
                .then((result) => {
                    expect(result).toEqual(3);
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("returns 0 if no elements or inactive queue", (done) => {
            myQueue.length(testEmptyKey)
                .then((result) => {
                    expect(result).toEqual(0);
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // length

    describe("isEmpty", () => {
        it("returns a Promise", () => {
            expect(myQueue.isEmpty(testKey)).toBeInstanceOf(Promise);
        });

        it("throws error if channel not valid", (done) => {
            myQueue.isEmpty(null)
                .then((result) => {
                    done.fail();
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                });
        });

        it("returns true if no elements are in queue", (done) => {
            myQueue.isEmpty(testEmptyKey)
                .then((result) => {
                    expect(result).toBeTruthy();
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("returns false if elements are in queue", (done) => {
            myQueue.isEmpty(testKey)
                .then((result) => {
                    expect(result).toBeFalsy();
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // isEmpty

    describe("peek", () => {
        it("returns a Promise", () => {
            expect(myQueue.peek(testKey)).toBeInstanceOf(Promise);
        });

        it("throws error if channel not valid", (done) => {
            myQueue.peek(null)
                .then((result) => {
                    done.fail(result);
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                });
        });

        it("returns expected high-scoring record", (done) => {
            myQueue.peek(testKey)
                .then((result) => {
                    expect(result).toEqual("world");
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("returns null if no records", (done) => {
            myQueue.peek(testEmptyKey)
                .then((result) => {
                    expect(result).toBeNull();
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // peek

    describe("insertWithPriority", () => {
        it("returns a Promise", () => {
            expect(myQueue.insertWithPriority(unusedKey, "data", 1)).toBeInstanceOf(Promise);
        });

        it("throws error if channel not valid string", (done) => {
            myQueue.insertWithPriority(null, "test", 3)
                .then(() => {
                    done.fail();
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                });
        });

        it("throws error if element not valid string", (done) => {
            myQueue.insertWithPriority(unusedKey, null, 3)
                .then(() => {
                    done.fail();
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                })
        });

        it("throws error if priority not valid number", (done) => {
            myQueue.insertWithPriority(unusedKey, "test", null)
                .then(() => {
                    done.fail();
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                });
        });

        it("inserted 2 records with 1 score", (done) => {
            client.zcount(testKey, 0, 1, (err, reply) => {
                expect(reply).toEqual(2);
                done();
            });
        });

        it("inserted 1 records with 2 score", (done) => {
            client.zcount(testKey, 2, 5, (err, reply) => {
                expect(reply).toEqual(1);
                done();
            });
        });
    }); // insertWithPriority

    describe("pullHighestPriority", () => {
        it("returns a Promise", () => {
            expect(myQueue.pullHighestPriority(unusedKey)).toBeInstanceOf(Promise);
        });

        it("throws error if channel not valid", (done) => {
            myQueue.pullHighestPriority(null)
                .then((result) => {
                    done.fail(result);
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                });
        });

        it("returns null if no item in queue", (done) => {
            myQueue.pullHighestPriority(testEmptyKey)
                .then((result) => {
                    // assert popped value is highest priority
                    expect(result).toBeNull();
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("pops highest priority item from queue", (done) => {
            myQueue.pullHighestPriority(testKey)
                .then((result) => {
                    // assert popped value is highest priority
                    expect(result).toEqual("world");

                    // confirm length of queue is now 2
                    client.zcard(testKey, (err, reply) => {
                        expect(reply).toEqual(2);
                        done();
                    });
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // getHighestPriority

}); // redis priority queue
