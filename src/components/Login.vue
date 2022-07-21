<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>

      <!-- 表单区域 -->
      <el-form :model="loginForm" label-width="80px" class="login_form" :rules="loginRules" ref="loginFormRef">
        <!-- 用户名 -->
        <el-form-item label="名称" prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="loginForm.username">
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password">
            <i slot="prefix" class="iconfont icon-3702mima"></i>
          </el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="submitForm">登录</el-button>
          <!-- <el-button type="info" @click="resetForm('loginFormRef')">重置</el-button> -->
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },

      // 验证规则
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },

  methods: {
    // resetForm(formName) {
    //   this.$refs[formName].resetFields()
    // },
    resetForm() {
      this.$refs.loginFormRef.resetFields()
    },

    // 登录
    submitForm() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return

        // this.$http.post('login', this.loginForm).then((res) => {
        //   console.log(res.data)
        // })
        const { data: res } = await this.$http.post('login', {
          username: this.loginForm.username,
          password: this.loginForm.password,
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message({
          message: '登录成功',
          type: 'success',
        })
        // 保存token
        window.sessionStorage.setItem('token', res.data.token)
        // 跳转到home页面
        this.$router.push('/home')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
  //   position: relative;

  .login_box {
    background-color: skyblue;
    width: 450px;
    height: 300px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      width: 130px;
      height: 130px;
      background-color: #fff;
      position: absolute;
      left: 50%;
      //   top: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      padding: 10px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eeeeee;
      }
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-right: 40px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
  padding-right: 30px;
}
</style>