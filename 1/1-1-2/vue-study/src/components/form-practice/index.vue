<template>
  <div>
    <!-- KInput -->
    <KForm :model="model" :rules="rules" ref="loginForm">
      <KFormItem label="用户名" prop="userName">
        <KInput v-model="model.userName" placeholder="请输入用户名" />
      </KFormItem>
      <KFormItem label="密码" prop="password">
        <KInput v-model="model.password" placeholder="请输入用户名" />
      </KFormItem>
      <KFormItem>
        <button @click="login">登录</button>
      </KFormItem>
    </KForm>
  </div>
</template>

<script>
import KInput from './KInput.vue'
import KFormItem from './KFormItem.vue'
import KForm from './KForm.vue'
import Notice from './../Notice.vue'
import create from '../utils/create'

export default {
  components: { KInput, KFormItem, KForm },
  inheritAttrs: false,
  data() {
    return {
      model: {
        userName: '',
        password: ''
      },
      rules: {
        userName: [
          {required: true, message: '请输入用户名'}
        ],
        password: [
          {required: true, message: '请输入密码'}
        ]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginForm.validate(isValidate => {

        create(Notice, {
          title: '我要变大佬！',
          message: isValidate ? '请求登录' : '校验失败！',
        }).show()

        // if (isValidate) {
        //   // 合法：
        //   console.log('request login');
        // } else {
        //   // alert('校验失败！')
        // }
      })
    }
  }
}
</script>

<style scoped>

</style>