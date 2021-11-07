/**
 * @description 击鼓传花
 */

// 封装队列
function Queue () {
  // 属性：
  this.items = []
  // 方法：
  // 1、将元素加入到队列中
  Queue.prototype.enqueue = function (element) {
    this.items.push(element)
  }
  // 2、从队列中删除前端元素
  Queue.prototype.dequeue = function (element) {
    // 队列基于数组性能不是很高
    return this.items.shift()
  }
  // 3、查看前端的元素
  Queue.prototype.front = function () {
    return this.items[0]
  }
  // 4、查看队列是否为空
  Queue.prototype.isEmpty = function () {
    return this.items.length === 0
  }
  // 5、查看队列中元素个数
  Queue.prototype.size = function () {
    return this.items.length
  }
  // 6、toString()方法
  Queue.prototype.toString = function () {
    let resultString = ''
    this.items.forEach(item => resultString += `${item} `)
    return resultString
  }
}



// 面试题：击鼓传花
function passGame (nameList, num) {
  // 1、创建一个队列
  const queue = new Queue()
  // 2、将所有人加入队列中
  nameList.forEach(item => queue.enqueue(item))
  // 3、开始数数字
  while(queue.size() > 1) {
    // 不是num的时候，重新加入到队列的末尾
    // 是num的时候，将其从队列中删除
    //  3.1、num 之前的数字从新放入到队列的末尾
    for(let i = 0; i < num - 1; i++) {
      queue.enqueue(queue.dequeue())
    }
    //  3.2、num 对应的那个人直接从队列中删除掉
    queue.dequeue()
  }
  // 4、获取剩下的那个人
  const endName = queue.front()
  // 5、返回剩下人的下标也就是位置
  return nameList.indexOf(endName)
}

console.log(passGame([1, 2, 3, 4, 5, 6], 2));