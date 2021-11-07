/**
 * @description: 连接redis的方法 get set
 * @author: 凉风有信、
 */

const redis = require('redis')
const { REDIS_CONF } = require('../config/db')

// 创建客户端 ---              接收两个参数一个是端口，一个是主机
const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
redisClient.on('error', err => {
    console.error('redis error', err)
})


/**
 * 
 * @param {string} key 键
 * @param {string} val 值 
 * @param {number} timeout 过期时间 秒
 */
function set(key, val, timeout = 60 * 60) {
    if (typeof val === 'object') {
        val = JSON.stringify(val)
    }
    redisClient.set(key, val)
    redisClient.expire(key, timeout)
}

/**
 * @param {string} key 键 
 */
function get(key) {
    const promise = new Promise((resolve, reject) => {
        redisClient.get(key, (err, val) => {
            if (err) {
                reject(err)
                return
            }
            if (val === null) {
                resolve(null)
                return
            }
            // 尝试变成对象
            try {
                resolve(JSON.parse(val))
            } catch (ex) {
                resolve(val)
            }
        })
    })
    return promise
}

module.exports = {
    set,
    get
}