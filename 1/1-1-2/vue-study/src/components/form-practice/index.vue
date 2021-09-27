<template>
  <div>
    <!-- KInput -->
    <KForm :model="model">
      <KFormItem label="用户名" prop="userName">
        <KInput v-model="model.userName" placeholder="请输入用户名" />
      </KFormItem>
      <KFormItem label="密码" prop="password">
        <KInput v-model="model.password" placeholder="请输入用户名" />
      </KFormItem>
    </KForm>
    <p>{{model.userName}}</p>
  </div>
</template>

<script>
import KInput from './KInput.vue'
import KFormItem from './KFormItem.vue'
import KForm from './KForm.vue'

export default {
  components: { KInput, KFormItem, KForm },
  inheritAttrs: false,
  data() {
    return {
      model: {
        userName: 'liang',
        password: '123'
      }
    }
  }
}
</script>

<style scoped>

</style>