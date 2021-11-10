const add = (x, y) => x + y
const square = z => z * z

// const fn = (x, y) => square(add(x, y))

// const compose = (fn1, fn2) => {
//   return (...args) => {
//     return fn2(fn1(...args))
//   }
// }

// const compose = (...[first, ...other]) => {
//   return (...args) => {
//     let ret = first(...args)
//     other.forEach(fn => ret = fn(ret))
//     return ret
//   }
// }


// const fn = compose(add, square, square)
// console.log(fn(1, 2));


function compose (middlewares) {
  return function () {
    return dispatch(0)
    function dispatch(i) {
      let fn = middlewares[i]
      if (!fn) {
        // 空的
        return Promise.resolve()
      }
      return Promise.resolve(
        fn(
          function next() {
            return dispatch(i + 1)
          }
        )
      )
    }
  }
}

async function fn1 (next) {
  console.log('fn1开始了');
  await next()
  console.log('fn1结束了');
}


async function fn2 (next) {
  console.log('fn2开始了');
  await delay()
  await next()
  console.log('fn2结束了');
}

function fn3 (next) {
  console.log('fn3');
}

function delay () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 2000)
  })
}

const middlewares = [fn1, fn2, fn3]
const finalFn = compose(middlewares)
finalFn()