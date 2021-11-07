/**
 * @description 通过栈结构将十进制转化为二进制
 */

// 封装栈类
function Stack() {
  // 栈中的属性
  this.items = []
  
  // 栈的相关操作
  // 1、将元素压入栈
  Stack.prototype.push = function (element) {
    this.items.push(element)
  }
  // 2、从栈中取出元素
  Stack.prototype.pop = function () {
    return this.items.pop()
  }

  // 3、查看一下栈顶元素
  Stack.prototype.peek = function () {
    return this.items[this.items.length - 1]
  }

  // 4、判断栈是否为空
  Stack.prototype.isEmpty = function () {
    return this.items.length === 0
  }

  // 5、获取栈中元素的个数
  Stack.prototype.size = function () {
    return this.items.length
  }

  // 6、toString方法
  Stack.prototype.toString = function () {
    let resultString = ''
    this.items.forEach((item) => {
      resultString += `${item} `
    })
    return resultString
  }
}

function decTobin (decNumber) {
  // 1、定义栈对象
  const stack = new Stack()

  // 2、循环参数
  while (decNumber > 0) {
    //2.1、将余数压入栈中
    stack.push(decNumber % 2)
    // 2.2、将整出后的结果作为新参数
    decNumber = Math.floor(decNumber / 2)
  }

  // 3、将栈里面的元素弹出即可
  let binaryString = ''
  while (!stack.isEmpty()) {
    binaryString += stack.pop()
  }

  return binaryString
}

console.log(decTobin(1000));