# Redis Priority Queue
This is a simple Promise based multi-channel priority queue implementation that leverages Redis sorted set.

# Requirements
You will need Redis server running.

# Installation
`npm install`

# Test
The test script in `package.json` preprocesses the `.ts` file and then executes.

`npm test`

# Usage
The source was written in Typescript, yet it compiles to Javascript, so you can use in ES5 or later supported environments. The following code snippets are implemented in the `__tests__` folder.

## Quick start (Node)
```
const queue = require('redis-priority-queue');

const config = queue.RedisConfig("localhost", 6379, null, null);

const myQueue = new queue.RedisPriorityQueue(config);

myQueue.length("emptyQueue")
  .then(result => {
    console.log({result});
  })
  .catch(error => {
    console.error({error});
  });
```

## Typescript
### Initialization
```
import {RedisConfig, IPriorityQueue, RedisPriorityQueue} from 'redis-priority-queue';

let config: RedisConfig = new RedisConfig(
    "localhost",
    6379,
    null,
    null
);

let myQueue : IPriorityQueue<string> = new RedisPriorityQueue(config);
```

### Insert element
```
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
```

### Pull highest score element
```
myQueue.pullHighestPriority(testKey)
    .then(result => {
        // assert popped value is highest priority
        expect(result).toEqual("world");
    })
    .catch(error => {
        done.fail(error);
    });
```

### Peek highest score element
```
myQueue.peek(testKey)
    .then(result => {
        expect(result).toEqual("world");
        done();
    })
    .catch(error => {
        done.fail(error);
    });
```

### Check if empty
```
myQueue.isEmpty(testKey)
    .then(result => {
        expect(result).toBeFalsy();
        done();
    })
    .catch(error => {
        done.fail(error);
    });
```

### Get queue length
```
myQueue.length(testKey)
    .then(result => {
        expect(result).toEqual(3);
        done();
    })
    .catch(error => {
        done.fail(error);
    });
```

# Contributing
I haven't thought that far ahead yet. I needed this for my project and wanted to give back. ;-)

# License
MIT (if you enhance it, fork and PR so the community benefits)
