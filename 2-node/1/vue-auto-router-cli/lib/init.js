const { promisify } = require('util')

// 打印大的文字:
const figlet = promisify(require('figlet'))
// 清空控制台：
const clear = require('clear')
// 改变颜色：
const chalk = require('chalk')

// 引入 clone 这个库
const { clone } = require('./download')

// 自定义控制台打印函数
const log = content => console.log(chalk.green(content));


module.exports = async name => {
  // 打印欢迎界面：
  clear()
  const data = await figlet('L Welcome You')
  log(data)
  log(`🚀创建项目...${name}`)
  // 初始化
  log(clone)
  // clone()
}