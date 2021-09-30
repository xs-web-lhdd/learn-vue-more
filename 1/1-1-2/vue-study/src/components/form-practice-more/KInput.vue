<template>
  <div>
    <input :type="type" :value="value" @input="onInput" v-bind="$attrs">
  </div>
</template>

<script>
import emitter from '../mixins/emitter.js'

export default {
  inheritAttrs: false,
  mixins: [emitter],
  props: {
    value: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    }
  },
  methods: {
    onInput(e) {
      this.$emit('input', e.target.value)

      // 触发校验：
      // 1、改进前：
      // this.$parent.$emit('validate')

      // 2、改进后：
      this.dispatch('KFormItem', 'validate') // 不需要传参
    }
  }
}
</script>

<style scoped>

</style>
