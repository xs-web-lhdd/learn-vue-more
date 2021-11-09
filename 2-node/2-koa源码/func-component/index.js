const add = (x, y) => x + y
const square = z => z * z

// const fn = (x, y) => square(add(x, y))

// const compose = (fn1, fn2) => {
//   return (...args) => {
//     return fn2(fn1(...args))
//   }
// }

const compose = (...[first, ...other]) => {
  return (...args) => {
    let ret = first(...args)
    other.forEach(fn => ret = fn(ret))
    return ret
  }
}


compose(1,2,3)

const fn = compose(add, square, square)
console.log(fn(1, 2));