/**
 * @description sequelize实例
 * @author 凉风有信、
 */

const Sequelize = require('sequelize')
const { MYSQL_CONF } = require('../config/db')
const { isProd, isTest } = require('../utils/env')

const { host, user, password, database } = MYSQL_CONF

const config = {
    host,
    dialect: 'mysql'
}

if (isTest) {
    // 关掉打印
    config.logging = () => {}
}

// 线上环境使用连接池
if (isProd) {
    config.pool = {
        max: 5,       // 最大连接数量
        min: 0,       // 最小连接数量
        idle: 10000   // 如果一个连接池10秒之内没有被使用那就释放
    }
}




const seq = new Sequelize(database, user, password, config)


// 测试连接

// seq.authenticate().then(() => {
//     console.log('mySQL数据库连接成功');
// }).catch(() => {
//     console.log('err');
// })

module.exports = seq