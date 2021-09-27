<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
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
  }
}
</script>

<style scoped>

</style>