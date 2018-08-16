const mongoose = require('mongoose');
const redis = require('redis')
const keys = require('../config/keys')
const client = redis.createClient(keys.redisUrl)
const util = require('util')
client.hget = util.promisify(client.hget)

const exec  = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true
    this.hashKey = JSON.stringify(options.key || '')
    // to make it chainable
    return this
}

mongoose.Query.prototype.exec = async function () {

    // if cache() is not called for the coming query don't perform caching instead directly execute query
    // on real exec function 
    if (!this.useCache) {
        return exec.apply(this, arguments)
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {collection: this.mongooseCollection.name}))
    // do we have any cached data in redis related to this query
    const cachedValue = await client.hget(this.hashKey, key)

    // if yes than respond to the request right away and return
    if (cachedValue)  {
        const doc = JSON.parse(cachedValue);

        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);data

    }
    // if no, we need to respond to the query and update cache
    const queryResult = await exec.apply(this,arguments);
    client.hset(this.hashKey, key, JSON.stringify(queryResult), 'EX', 100)
    return queryResult
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey))
    }
}