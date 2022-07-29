<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin-top:20px">
      <!-- 添加分类按钮 -->
      <el-button type="primary" style="margin-bottom:20px" @click="addCateDialog">添加分类</el-button>

      <!-- 表格 -->
      <tree-table :data="cateList" :columns="columns" :expand-type="false" :selection-type="false" show-index index-text="#" border>
        <!-- 是否有效 -->
        <template slot="isdeleted" slot-scope="scope">
          <!-- {{scope.row}} -->
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="clickBtn" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="editCateDialog(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteCateDialog(scope.row)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[2,5,10,50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="cateDialogVisible" width="50%" @close="addCateDialogClosed">
      <el-form ref="addCateFormRef" :model="addCateForm" label-width="80px" :rules="addCateRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKeys" :options="parentCatelist" :props="{ expandTrigger: 'hover', value:'cat_id', label:'cat_name', children:'children'}" @change="cateHandleChange" style="width:100%" clearable :change-on-select="true"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateBtn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
      <el-form ref="editCateFormRef" :model="editCateForm" label-width="80px" :rules="addCateRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',

  data() {
    return {
      cateList: [],
      //   查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,

      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          //   prop: 'cat_deleted',
          type: 'template',
          template: 'isdeleted',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'clickBtn',
        },
      ],

      // 控制添加分类对话框的显示与隐藏
      cateDialogVisible: false,

      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: '',
        cat_level: 0,
        cat_pid: 0,
      },

      // 父级分类列表
      parentCatelist: [],
      // 选中的父级分类的Id数组
      selectedKeys: [],

      addCateRules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          {
            min: 1,
            max: 15,
            message: '长度在 1 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },

      editCateDialogVisible: false,
      editCateForm: {},
    }
  },

  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      //   console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.cateList = res.data.result
      this.total = res.data.total
      //   console.log(this.cateList);
    },

    // 分页
    handleSizeChange(res) {
      //   console.log(res)
      this.queryInfo.pagesize = res
      this.getCateList()
    },
    handleCurrentChange(res) {
      //   console.log(res)
      this.queryInfo.pagenum = res
      this.getCateList()
    },

    // 点击按钮，展示添加分类的对话框
    addCateDialog() {
      this.getParentCatelist()
      this.cateDialogVisible = true
    },
    // 获取父级分类的列表
    async getParentCatelist() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2,
        },
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg + '父级分类')
      console.log(res.data)
      this.parentCatelist = res.data
    },

    // 选择项发生变化触发这个函数
    // cateHandleChange(val) {
    //   console.log(val)
    // },
    cateHandleChange() {
      console.log(this.selectedKeys)

      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    // 点击按钮，添加新的分类
    addCateBtn() {
      console.log(this.addCateForm)
      console.log(this.selectedKeys)

      this.$refs.addCateFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201)
          return this.$message.error(res.meta.msg + 'addCateBtn创建失败')
        this.$message.success(res.meta.msg + 'addCateBtn创建成功')
        this.getCateList()
        this.cateDialogVisible = false
      })
    },

    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },

    // 编辑
    async editCateDialog(scope) {
      this.editCateDialogVisible = true
      //   直接解除注释，会受下面影响
      //   console.log(scope)
      //   this.editCateForm.id = scope.cat_id
      //   this.editCateForm.cat_name = scope.cat_name
      //   console.log(this.editCateForm)

      const { data: res } = await this.$http.get('categories/' + scope.cat_id)
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + 'editCateForm获取失败')
      this.$message.success(res.meta.msg + 'editCateForm获取成功')
      //   console.log(res)
      this.editCateForm = res.data
      console.log(this.editCateForm)
    },
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 编辑,确定按钮
    async editCateBtn() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return

        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        )
        if (res.meta.status !== 200)
          return this.$message.error(res.meta.msg + 'editCateBtn创建失败')
        this.$message.success(res.meta.msg + 'editCateBtn创建成功')
        console.log(res)
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },

    // 删除
    async deleteCateDialog(row) {
      console.log(row)

      const deleteCateResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log(deleteCateResult)
      if (deleteCateResult !== 'confirm') {
        return this.$message.info('取消删除')
      }

      const { data: res } = await this.$http.delete('categories/' + row.cat_id)
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + 'deleteCateDialog')
      this.$message.success(res.meta.msg + 'deleteCateDialog')
      this.getCateList()
    },
  },

  created() {
    this.getCateList()
  },
}
</script>

<style lang="less" scoped>
</style>