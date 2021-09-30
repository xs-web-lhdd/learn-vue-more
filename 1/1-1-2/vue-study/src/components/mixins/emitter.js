// 广播 自上而下的派发事件
function broadcast(componentName, eventName, params) {
  // 遍历所有子元素---子元素里面必须有 componentName ！！！
  // 如果子元素的 componentName 与 传入的 componentName 相同就派发事件
  this.$children.forEach(child => {
    var name = child.$options.componentName;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
    // 找到之后会继续向下遍历，这就意味着会消耗一些性能 --- 谨慎使用！！！
  });
}
export default {
  methods: {
    // 冒泡查找（自下而上） componentName 相同的组件并派发事件
    // 这种方式找到之后就会结束，不会继续遍历，因此一定程度上会节省性能
    dispatch(componentName, eventName, params) {
      // 向上找父亲组件或者找到顶了那就是根组件
      var parent = this.$parent || this.$root;
      var name = parent.$options.componentName;
      
      // 循环向上找组件，直到找到相同名称的组件为止
      while (parent && (!name || name !== componentName)) {
        // 如果 parent 存在并且不是要找的componentName，那就继续向上找
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      // 如果找到就派发事件 --- 细节：params 是数组
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
