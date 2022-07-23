<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="userDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="usersList" stripe style="width: 100%" border>
        <el-table-column type="index" label="#" width="100">
        </el-table-column>
        <el-table-column prop="username" label="姓名" width="100">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="160">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column label="状态">
          <!-- 不对 -->
          <!-- <el-switch v-model="item.mg_state" v-for="item in usersList" :key="item.id">
          </el-switch> -->
          <template #default="scope">
            <el-switch v-model="scope.row.mg_state" @change="statusChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <!-- 操作按钮 -->
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="handleSetting(scope.$index, scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[1,2,5,10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户弹框 -->
    <el-dialog title="添加用户" :visible.sync="userDialogVisible" width="50%" @close="closeAddDiolog">
      <!-- 主体区域 -->
      <el-form :model="addRuleForm" :rules="addRules" ref="addFormRef" label-width="70px">
        <!--用username，关闭添加用户对话框不能重置 -->
        <!-- <el-form-item label="用户名" prop="username"> -->
        <el-form-item label="用户名" prop="name">
          <el-input v-model="addRuleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addRuleForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addRuleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addRuleForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="userDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserBtn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户弹框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="closeEditDiolog">
      <!-- 主体区域 -->
      <el-form :model="editRuleForm" :rules="addRules" ref="editFormRef" label-width="70px">
        <!--用username，关闭添加用户对话框不能重置 -->
        <!-- <el-form-item label="用户名" prop="username"> -->
        <el-form-item label="用户名">
          <el-input v-model="editRuleForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editRuleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editRuleForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) return cb()
      cb(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule, value, cb) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) return cb()
      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 获取用户数据列表的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },

      usersList: [],
      total: 0,

      // 添加用户弹框
      userDialogVisible: false,
      // 修改用户弹框
      editDialogVisible: false,

      addRules: {
        // username: [
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },

      addRuleForm: {
        name: '',
        password: '',
        email: '',
        mobile: '',
      },

      editRuleForm: {
        // username: '',
        // email: '',
        // mobile: '',
        // id: '',
      },
    }
  },

  methods: {
    // 获取用户数据
    async getUsersList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      //   console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.usersList = res.data.users
      this.total = res.data.total
      //   console.log(this.usersList)
    },

    // 页码
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.queryInfo.pagesize = val
      this.getUsersList()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.queryInfo.pagenum = val
      this.getUsersList()
    },

    // 用户状态
    async statusChange(userInfo) {
      console.log(userInfo)
      //   请求路径：users/:uId/state/:type里面有动态数据，使用反引号``
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },

    // 关闭添加用户对话框将其重置
    closeAddDiolog() {
      this.$refs.addFormRef.resetFields()
    },

    // 关闭 修改 用户对话框将其重置
    closeEditDiolog() {
      this.$refs.editFormRef.resetFields()
    },

    // 添加用户确定预校验
    addUserBtn() {
      this.$refs.addFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('users', {
          username: this.addRuleForm.name,
          password: this.addRuleForm.password,
          email: this.addRuleForm.email,
          mobile: this.addRuleForm.mobile,
        })
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        this.userDialogVisible = false
        this.getUsersList()
      })
    },

    // 修改用户弹框
    async handleEdit(row) {
      console.log(row)
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`users/${row.id}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      //   this.editRuleForm.username = res.data.username
      //   this.editRuleForm.email = res.data.email
      //   this.editRuleForm.mobile = res.data.mobile
      //   this.editRuleForm.id = res.data.id
      this.editRuleForm = res.data
    },
    // 修改用户弹框并提交
    editUserBtn() {
      this.$refs.editFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return
        // const { data: res } = await this.$http.put(`users/${row.id}`, {
        const { data: res } = await this.$http.put(
          // 这个可以
          // 'users/' + this.editRuleForm.id,
          `users/${this.editRuleForm.id}`,
          //   确定按钮上下文没定义#default="scope",不能使用scope.row
          //   'users/' + row.id,
          {
            email: this.editRuleForm.email,
            mobile: this.editRuleForm.mobile,
          }
        )
        // 响应回来的res是修改过的数据，
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // this.editRuleForm.name = res.data.username
        // this.editRuleForm.email = res.data.email
        // this.editRuleForm.mobile = res.data.mobile

        this.editDialogVisible = false
        this.getUsersList()
        this.$message.success(res.meta.msg)
      })
    },

    // 删除用户
    async handleDelete(row) {
      const confimResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      console.log(row)
      console.log(confimResult)
      if (confimResult !== 'confirm') return this.$message.info('已取消删除---')
      //   console.log("确认删除");

      const { data: res } = await this.$http.delete('users/' + row.id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getUsersList()
      this.$message.success(res.meta.msg)
    },
    
    handleSetting() {},
  },

  created() {
    this.getUsersList()
  },
}
</script>

<style lang="less" scoped>
.box-card {
  margin-top: 20px;

  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .el-table {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>