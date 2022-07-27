<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card style="margin-top:20px">
      <!-- 添加角色按钮 -->
      <el-button type="primary" @click="rolesDialogVisible = true">添加角色</el-button>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" stripe style="width: 100%;margin-top:20px" border>
        <!-- expand展开列 -->
        <el-table-column type="expand">
          <template #default="scope">
            <el-row type="flex" align="middle" v-for="(item1,i1) in scope.row.children" :key="item1.id" style="margin-left:50px" :class="['colButtom',i1===0?'colTop':'']">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="handleClose(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2===0?'':'colTop']" type="flex" align="middle">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="handleClose(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="handleClose3(scope.row,item3.id)">{{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- <pre>
                {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column prop="level" label="操作">
          <template #default="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的弹框 -->
    <el-dialog title="添加角色" :visible.sync="rolesDialogVisible" width="50%" @close="rolesCloseDialog">
      <el-form :model="rolesRuleForm" :rules="rolesRules" ref="rolesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="rolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesDialogVisible">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的弹框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editCloseDialog">
      <el-form :model="editRuleForm" :rules="rolesRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesDialogVisible">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的弹框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" show-checkbox default-expand-all node-key="id" ref="treeRef" highlight-current :props="treeProps" :default-checked-keys="defaultKeys">
      </el-tree>
      <span slot="footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',

  data() {
    return {
      // 角色列表
      rolesList: [],
      //   所有权限列表
      rightsList: [],
      //   树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      //   保存三级权限的id的数组
      defaultKeys: [],

      // 添加角色的弹框
      rolesDialogVisible: false,
      rolesRuleForm: {
        roleName: '',
        roleDesc: '',
      },
      //   编辑角色的弹框
      editDialogVisible: false,
      editRuleForm: {},

      // 分配权限的弹框
      setRightDialogVisible: false,

      //   角色id
      clickRoleId: '',

      rolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },

  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      //   console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg + 'getRolesList')
      this.rolesList = res.data
      //   console.log(this.rolesList)
    },

    // 关闭添加角色对话框，将其重置
    rolesCloseDialog() {
      this.$refs.rolesFormRef.resetFields()
    },

    // 确定添加角色，预校验
    addRolesDialogVisible() {
      this.$refs.rolesFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.rolesRuleForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.rolesDialogVisible = false
        this.$message.success('添加角色成功')
        this.getRolesList()
        //   console.log(this.rolesList)
      })
    },

    // 编辑角色对话框
    async handleEdit(id) {
      console.log(id)
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      console.log(res)
      this.editRuleForm = res.data
      console.log(this.editRuleForm)
    },
    // 编辑角色对话框,预校验
    // 修改角色描述不能为空，但验证规则没写
    editRolesDialogVisible() {
      this.$refs.editFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editRuleForm.roleId,
          {
            roleName: this.editRuleForm.roleName,
            roleDesc: this.editRuleForm.roleDesc,
          }
        )
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editDialogVisible = false
        this.$message.success('编辑角色成功')
        this.getRolesList()
      })
    },
    // 关闭编辑角色对话框,重置
    editCloseDialog() {
      this.$refs.editFormRef.resetFields()
    },

    // 删除角色对话框
    async handleDelete(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除——————')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除角色成功111')
      this.getRolesList()
    },

    // 删除3级标签
    async handleClose3(role, rightId) {
      const tagResult = await this.$confirm(
        '此操作将永久删除该3级权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log(tagResult)
      if (tagResult !== 'confirm') {
        return this.$message.info('已取消删除tag3')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      //   this.getRolesList()
      role.children = res.data
    },
    // 删除2级,1级标签
    async handleClose(role, rightId) {
      const tagResult = await this.$confirm(
        '此操作将永久删除该1级，2级权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log(tagResult)
      if (tagResult !== 'confirm') {
        return this.$message.info('已取消删除tag1，2')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      //   this.getRolesList()
      role.children = res.data
    },

    // 分配权限
    async showSetRightDialog(role) {
      this.clickRoleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
    //   console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
    //   console.log(this.rightsList)

      this.getDefaultKeys(role, this.defaultKeys)

      this.setRightDialogVisible = true
    },

    // 利用递归，将三级权限的id保存到defaulKey数组中
    getDefaultKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getDefaultKeys(item, arr)
      })
    },
    // 关闭分配权限弹框，清空保存三级权限的id的数组
    setRightDialogClosed() {
      this.defaultKeys = []
    },

    // 点击确定，分配角色
    async allotRights() {
      const keysID = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      //   console.log(this.$refs.treeRef.getCheckedKeys())
      console.log(keysID)

      //  权限 ID 列表（字符串）
      const ridsStr = keysID.join(',')
      console.log(ridsStr)
      const { data: res } = await this.$http.post(
        `roles/${this.clickRoleId}/rights`,
        {
          rids: ridsStr,
        }
      )
    //   console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.setRightDialogVisible = false
    },
  },

  created() {
    this.getRolesList()
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}

.colTop {
  border-top: 1px solid pink;
}
.colButtom {
  border-bottom: 1px solid skyblue;
}
</style>