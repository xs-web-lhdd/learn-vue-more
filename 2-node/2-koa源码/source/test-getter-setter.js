const L = {
  info: {name: '凉风有信、'},
  get name() {
    return this.info.name
  },
  set name(val) {
    this.info.name = val
  }
}


// 简化（代理）：
// L.info.name => L.name
console.log(L.name);

L.name = 'Miss L'
console.log(L.name);