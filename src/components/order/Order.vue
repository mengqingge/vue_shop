<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card style="margin-top:20px">
      <el-input placeholder="请输入内容" v-model="orderInfo.query" style="width:350px" clearable>
        <el-button slot="append" icon="el-icon-search" @click="getOrdersData"></el-button>
      </el-input>

      <el-table :data="orderList" stripe style="margin-top:20px" border>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="260px">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格">
        </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template v-slot="scope">
            {{scope.row.create_time|dateFarmat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog"></el-button>
          <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressDialog"></el-button>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[5,10,30,50]" :page-size="100" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改地址弹框 -->
    <el-dialog title="修改地址" :visible.sync="editAddressDialogVisible" width="50%" @close="addressClosed">
      <span slot="footer">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <!-- <el-input v-model="addressForm.address1"> -->
            <!-- <el-cascader v-model="addressForm.address1" :options="citydata" :props="{ expandTrigger: 'hover' ,value:'value', label:'label', children:'children'}" @change="addressHandleChange" style="width:100%"></el-cascader> -->
            <el-cascader v-model="addressForm.address1" :options="citydata" :props="{ expandTrigger: 'hover'}" @change="addressHandleChange" style="width:100%"></el-cascader>
            <!-- </el-input> -->
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改地址" :visible.sync="progressDialogVisible" width="50%" @close="progressClosed">
      <span slot="footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'

export default {
  name: '',

  data() {
    return {
      // 订单列表数据
      orderList: [],
      //   总条数
      total: 0,
      //   订单请求参数
      orderInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },

      // 修改地址
      editAddressDialogVisible: false,

      addressForm: {
        address1: [],
        address2: '',
      },
      // 修改地址规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },

      citydata: citydata,

      progressDialogVisible: false,
    }
  },

  methods: {
    // 获取订单列表数据
    async getOrdersData() {
      const { data: res } = await this.$http.get('orders', {
        params: this.orderInfo,
      })
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + 'getOrdersData')
      this.$message.success(res.meta.msg + 'getOrdersData')
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(this.orderList)
    },

    // 分页
    handleSizeChange(val) {
      //   console.log(`每页 ${val} 条`)
      this.orderInfo.pagesize = val
      this.getOrdersData()
    },
    handleCurrentChange(val) {
      //   console.log(`当前页: ${val}`)
      this.orderInfo.pagenum = val
      this.getOrdersData()
    },

    // 修改地址
    showEditDialog() {
      this.editAddressDialogVisible = true
    },

    // 级联选择器发生变化，触发这个函数
    addressHandleChange(val) {
      console.log(val)
      console.log(this.addressForm)
    },

    addressClosed() {
      this.$refs.addressFormRef.resetFields()
    },

    async showProgressDialog() {
      // 有错误，一请求，后台就断了
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // console.log(res)
      // if (res.meta.status !== 200)
      //   return this.$message.error(res.meta.msg + 'showProgressDialog')
      // this.$message.success(res.meta.msg + 'showProgressDialog')

      // this.progressDialogVisible = true
    },
    progressClosed() {},
  },

  created() {
    this.getOrdersData()
  },
}
</script>

<style lang="less" scoped>
</style>