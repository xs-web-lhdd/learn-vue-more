<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'KForm',
  componentName: 'KForm',
  // 1、props： model、rules
  // 2、validate
  provide() {
    return {
      form: this // 这里传递的是表单组件的示例
    }
  },
  props: {
    model: {
      type: Object,
      required: true
    },
    rules: {
      type: Object
    }
  },
  created() {
    // 源码的 fields 在 data 中是响应式的，这里咱没有改进为响应式
    this.fields = []
    this.$on('form.addField', item => {
      this.fields.push(item)
    })
  },
  methods: {
    // 全局校验方法：
    // 1、执行内部所有 FormItem 的校验方法，统一处理结果：
    // 2、将 FormItem 数组转换成 Promise 数组： 
    validate(cb) {
      // 1、不是很严谨 --- 如果有异步组件就有 bug 了
      // const tasks = this.$children
      // .filter(item => item.prop)
      // .map(item => item.validate())

      // 2、较为严谨的写法：
      const tasks = this.fields.map(item => item.validate())


      // 统一查看校验结果：
      Promise.all(tasks)
        .then(() => cb(true))
        .catch(() => cb(false))
    }
  }
}
</script>

<style scoped>

</style>