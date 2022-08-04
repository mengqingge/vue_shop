<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin-top:20px">
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon>
      </el-alert>

      <div class="block" style="margin-top:20px">
        <span>选择商品分类：</span>
        <el-cascader v-model="selectedKeys" :options="cateList" :props="{ expandTrigger: 'hover',value:'cat_id', label:'cat_name', children:'children' }" @change="selectCateHandleChange"></el-cascader>
      </div>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table border :data="manyTabData" stripe style="margin-top:20px">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" style="margin:10px" closable @close="handleClose(i,scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 添加标签 -->
                <el-input v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" style="width:150px">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialogVisible(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table border :data="onlyTabData" stripe style="margin-top:20px">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" style="margin:10px" closable @close="handleClose(i,scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 添加标签 -->
                <el-input v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" style="width:150px">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialogVisible(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加对话框，共用 -->
      <el-dialog :title='"添加"+addText' :visible.sync="addDialogVisible" width="50%" @close="addFormClosed">
        <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addFormRef">
          <el-form-item :label="addText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addDialogVisibleBtn">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改对话框，共用 -->
      <el-dialog :title='"修改"+addText' :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
        <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editFormRef">
          <el-form-item :label="addText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogVisibleBtn">确 定</el-button>
        </span>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Cate',

  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedKeys: [],

      // 被激活的页签的名称
      activeName: 'many',

      // 动态参数数据
      manyTabData: [],
      // 静态属性数据
      onlyTabData: [],

      // 添加的对话框
      addDialogVisible: false,
      addForm: {
        attr_name: '',
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
        ],
      },

      // 修改的对话框
      editDialogVisible: false,
      editForm: {
        // attr_name: '',
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
        ],
      },

      // inputVisible: false,
      // inputValue: '',
    }
  },

  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        type: 3,
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.cateList = res.data
      console.log(this.cateList)
    },

    // 级联选择框选中项变化，会触发这个函数
    selectCateHandleChange() {
      this.getParamsData()
    },

    // tab 页签点击事件的处理函数
    handleTabClick(tab, event) {
      console.log(tab, event)
      console.log(this.activeName)
      this.getParamsData()
    },

    // 获取params的数据
    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTabData = []
        this.onlyTabData = []
        return
      }
      // 证明选中的是三级分类
      console.log(this.activeName)
      console.log(this.selectedKeys)

      // 根据所选分类的Id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + '---获取参数列表失败')
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 不行
        // if (item.attr_vals) {
        //   return item.attr_vals
        // }
        // return (item.attr_vals = [])

        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)

      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },

    // 添加对话框关闭
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },

    // 点击按钮，添加参数
    addDialogVisibleBtn() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          console.log('error submit!!')
          return false
        }
        console.log('submit!!')

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201)
          return this.$message.error(res.meta.msg + '---添加参数失败')
        console.log(res.data)
        this.$message.success(res.meta.msg + '---添加参数成功')

        this.addDialogVisible = false
        this.getParamsData()
      })
    },

    // 展示修改对话框
    async showEditDialogVisible(row) {
      this.editDialogVisible = true
      console.log(row)

      const { data: res } = await this.$http.get(
        // `categories/${this.cateId}/attributes/${row.attr_id}`,
        `categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_sel: row.activeName,
        }
      )

      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + '---获取参数失败')
      console.log(res.data)
      this.$message.success(res.meta.msg + '---获取参数成功')
      this.editForm = res.data
      console.log(this.editForm)
    },

    // 点击按钮，修改参数
    editDialogVisibleBtn() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          console.log('error edit--submit!!')
          return false
        }
        console.log('edit--submit!!')

        const { data: res } = await this.$http.put(
          `categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.editForm.attr_sel,
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error(res.meta.msg + '---修改参数失败')
        console.log(res.data)
        this.$message.success(res.meta.msg + '---修改参数成功')

        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 修改对话框关闭
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 删除
    async deleteParams(row) {
      console.log(row)

      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }

      // const { data: res } = await this.$http.delete(
      //   `categories/${row.cat_id}/attributes/${row.attr_id}`
      // )
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${row.attr_id}`
      )

      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + '---删除参数失败')
      console.log(res.data)
      this.$message.success(res.meta.msg + '---删除参数成功')
      this.getParamsData()
    },

    // 文本框失去焦点，或摁下了 Enter 都会触发
    handleInputConfirm(row) {
      console.log(row)
      // if (this.inputValue.trim().length === 0) {
      if (row.inputValue.trim() === '') {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' '),
        }
      )
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + '--+new tag失败')
      this.$message.success(res.meta.msg + '--+new tag成功')
      this.getParamsData()
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
  },

  created() {
    this.getCateList()
  },

  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },

    // 当前选中的三级分类的Id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },

    addText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
  },
}
</script>

<style lang="less" scoped>
</style>