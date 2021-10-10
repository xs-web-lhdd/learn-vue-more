// 数组的响应式
// 1、替换数组原型中7个方法
const originalProto = Array.prototype
// 备份一份，修改备份
const arrayProto = Object.create(originalProto)
console.log(arrayProto);
['push', 'pop', 'shift', 'unshift'].forEach(method => {
  arrayProto[method] = function () {
    // 原始操作
    originalProto[method].apply(this, arguments)
    // 执行覆盖: 通知更新
    console.log('数组执行' + method + '操作');
  }
})



// 对象的响应式原理
// 1、Object.definePropperty()

function defineReactive(obj, key, val) {
  // val 可能是对象，那么就使用observe实现递归
  observe(val)

  Object.defineProperty(obj, key, {
    get() {
      console.log('get===>', val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set===>', newVal);
        observe(newVal)
        val = newVal;
      }
    }
  })
}


function set(obj, key, val) {
  defineReactive(obj, key, val)
}


// 对象响应式处理
function observe(obj) {
  // obj 必须是一个对象
  if(typeof obj !== 'object' || obj === null) {
    return
  }

  // 传入的是数组
  if (Array.isArray(obj)) {
    // 覆盖原型，替换 7 个变更操作
    obj.__proto__ = arrayProto
    // 对数组内部的元素执行响应化
    const keys = Object.keys(obj)
    for(const i = 0; i < obj.length; i++) {
      observe(obj[i])
    }
  } else {
    Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
  }
}

const obj = {a: 1, b: 2, baz: {a: 2}, arr: []}
observe(obj)

// obj.dong = 'dong'
// set(obj, 'dong', 'dong')
// obj.dong
// obj.dong = 'dong1'
obj.arr.push(4)
obj.arr


