const { resolve } = require('path');
const redis = require('redis');

class RedisClient {
  constructor() {
  // create  a redis client
    this.client = redis.createClient();
    this.client.on('error', (err) => {
        console.error('Redis error', err);
    });
  }

  //check if the connection to Redis is alive
  isAlive() {
    return this.client.connected;
  }

  // get the value from redis for a given key
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
         if (err) {
           reject(err);
         } else {
           resolve(reply);
         }
      });
    });
  }

  //set a value in Redis for a given key with an expiration
  async set(key, value, durationSeconds) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, durationSeconds, value, (err, reply) => {
        if (err) { reject(err);}
        else {resolve(reply);}
      });
    });
  }
  //delete a value from redis for a given key
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {reject(err);}
        else {resolve(reply);}
      });
    });
  }
}

//create and export an instance of redisClient
const redisClient = new RedisClient();
module.exports = redisClient;