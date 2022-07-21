<template>
  <div>
    <el-button type="info" @click="loginOutBtn">退出登录</el-button>
  </div>
</template>

<script>
export default {
  name: 'Home',

  data() {
    return {}
  },

  methods: {
    loginOutBtn() {
      // window.sessionStorage.removeItem('token')
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
  },
}
</script>

<style lang="less" scoped>
</style>