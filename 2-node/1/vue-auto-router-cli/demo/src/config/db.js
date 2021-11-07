/**
 * @description: 文件存储配置
 * @author: 凉风有信、
 */
const { isProd } = require('../untils/env')

let REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
}

let MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: '1234567890',
    port: '3306',
    database: 'weibo-code'
}

if (isProd) {
    // 生产环境
    REDIS_CONF = {
        // 线上redis配置
        port: 6379,
        host: '127.0.0.1'
    }

    MYSQL_CONF = {
        // 线上mySQL配置
        host: 'localhost',
        user: 'root',
        password: '1234567890',
        port: '3306',
        database: 'weibo-code'
    }
}
module.exports = {
    REDIS_CONF,
    MYSQL_CONF
}