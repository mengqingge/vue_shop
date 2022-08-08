<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card style="margin-top:20px">
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>

      <!-- 步骤条 -->
      <el-steps :space="200" :active="actionIndex-0" finish-status="success" style="margin:20px 0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab标签页 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs tab-position="left" v-model="actionIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!-- <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        </el-form> -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat" type="number">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="{ expandTrigger: 'hover',value:'cat_id', label:'cat_name', children:'children' }" @change="cateHandleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" style="margin:0 10px 0 0"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <!-- <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" style="margin:0 10px 0 0"></el-checkbox>
              </el-checkbox-group> -->

              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 -->
            <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" style="margin-top:10px" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" style="width:100%">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: '',

  data() {
    return {
      actionIndex: '0',

      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,

        // 要以 ',' 分割的分类列表,还需转换一下----但上面el-cascader的v-model需要[]
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品介绍
        goods_introduce: '',

        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类列表', trigger: 'blur' },
        ],
      },

      //   分类列表数据
      cateList: [],
      cateValue: [],

      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],

      // 图片上传组件的headers请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },

      // 图片预览路径
      previewPath: '',
      previewVisible: false,
    }
  },

  methods: {
    // 获取分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + '---getCateList')
      this.cateList = res.data
      //   console.log(this.cateList)
    },

    // 级联选择器发生变化，触发这个函数
    cateHandleChange(val) {
      console.log(val)
      console.log(this.addForm.goods_cat)

      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },

    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类列表')
        return false
      }
    },

    // 证明访问的是动态参数面板
    async tabClicked() {
      console.log(this.actionIndex)
      if (this.actionIndex === '1') {
        const { data: res } = await this.$http.get(
          //   `categories/${this.addForm.goods_cat[2]}/attributes`,
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        console.log(res)
        if (res.meta.status !== 200)
          return this.$message.error(res.meta.msg + 'tabClicked')

        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.actionIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        console.log(res)
        if (res.meta.status !== 200)
          return this.$message.error(res.meta.msg + '静态属性')

        // res.data.forEach((item) => {
        //   item.attr_vals =
        //     item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        // })

        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },

    // 处理图片预览效果
    handlePreview(res) {
      console.log(res)
      this.previewPath = res.response.data.url
      this.previewVisible = true
    },

    // 处理移除图片的操作
    handleRemove(res) {
      console.log(res)
      const remove_tmp_path = res.response.data.tmp_path
      console.log(remove_tmp_path)
      const removeIndex = this.addForm.pics.findIndex(
        (value) => value.pic === remove_tmp_path
      )
      console.log(removeIndex)
      console.log(this.addForm.pics)
      this.addForm.pics.splice(removeIndex, 1)
      console.log(this.addForm.pics)
    },

    // 监听图片上传成功的事件
    handleSuccess(res) {
      console.log(res)
      const pic_tmp_path = { pic: res.data.tmp_path }
      this.addForm.pics.push(pic_tmp_path)
      console.log(this.addForm)
    },

    // 添加商品
    add() {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请输入必须项')
        }

        const newAddForm = _.cloneDeep(this.addForm)
        newAddForm.goods_cat = newAddForm.goods_cat.join(',')
        console.log(newAddForm)

        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          }
          this.addForm.attrs.push(newObj)
        })
        // newAddForm.attrs = this.addForm.attrs
        // console.log(newAddForm)

        // 静态属性
        this.onlyTableData.forEach((item) => {
          const newObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(newObj)
        })
        newAddForm.attrs = this.addForm.attrs
        console.log(newAddForm)

        const { data: res } = await this.$http.post('goods', newAddForm)
        console.log(res)
        if (res.meta.status !== 201)
          return this.$message.error(res.meta.msg + 'add')
        this.$message.success(res.meta.msg + 'add')
        this.$router.push('/goods')
      })
    },
  },

  created() {
    this.getCateList()
  },

  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
  },
}
</script>

<style lang="less" scoped>
</style>