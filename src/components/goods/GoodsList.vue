<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin-top:20px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="clearBtn">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" stripe style="width: 100% ;margin:20px 0" border>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="580">
        </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="150">
          <template v-slot="scope">
            {{scope.row.add_time|dateFarmat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteById(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[5,10,50,100]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',

  data() {
    return {
      // 商品列表
      goodsList: [],
      // 总共商品条数
      total: 0,

      // 查询参数对象
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 5,
      },
    }
  },

  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        // params: {
        //   pagenum: this.pagenum,
        //   pagesize: this.pagesize,
        // },
        params: this.queryInfo,
      })
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + 'getGoodsList')
      this.$message.success(res.meta.msg + 'getGoodsList')
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList)
    },

    // 分页
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },

    // 清空
    clearBtn() {
      this.getGoodsList()
    },

    // 删除
    async deleteById(row) {
      const result = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log(result)
      if (result !== 'confirm') {
        return this.$message.info('已经取消删除！')
      }
      const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.msg + 'deleteById')
      this.$message.success(res.meta.msg + 'deleteById')
      this.getGoodsList()
    },

    // 添加商品
    goAddPage() {
      this.$router.push('/goods/add')
    },
  },

  created() {
    this.getGoodsList()
  },
}
</script>

<style lang="less" scoped>
.el-table {
  font-size: 12px;
}
</style>