
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

  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

const obj = {a: 1, b: 2, baz: {a: 2}}
observe(obj)

// obj.dong = 'dong'
set(obj, 'dong', 'dong')
obj.dong
obj.dong = 'dong1'

