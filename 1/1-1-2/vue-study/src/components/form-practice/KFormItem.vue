<template>
  <div>
    <!-- 显示label标签 -->
    <label v-if="label">{{label}}</label>
    <!-- 显示内部表单元素 -->
    <slot></slot>
    <!-- 错误信息提示 -->
    <p v-if="error" class="error">{{error}}</p>
    <!-- 为做校验做铺垫 -->
    <!-- <p>{{form.model[prop]}}</p> -->
    <!-- <p>{{form.rules[prop]}}</p> -->
  </div>
</template>

<script>
import Schema from 'async-validator'

export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    },
    prop: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      error: ''
    }
  },
  mounted() {
    this.$on('validate', () => {
      this.validate()
    })
  },
  methods: {
    // 做表单项的校验：
    // elementUI 使用的是 async-validator 这个库
    // 获取校验规则和数据
    validate() {
      const rules = this.form.rules[this.prop]
      const value = this.form.model[this.prop]
      const schema = new Schema({[this.prop]: rules})
      // 返回 Promise 方便全局校验：
      return schema.validate({[this.prop]: value}, (errors) => {
        if (errors) {
          console.log(errors);
          // 如果有 errors 则校验失败：
          this.error = errors[0].message
        } else {
          // 校验通过：
          this.error = ''
        }
      })
    }
  }
}
</script>

<style scoped>
.error{
  color: red;
}
</style>