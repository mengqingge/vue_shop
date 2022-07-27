<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card style="margin-top:20px">
      <el-table :data="rightsList" stripe style="width: 100%;margin-top:20px" border>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称">
        </el-table-column>
        <el-table-column prop="path" label="路径">
        </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template #default="scope">
            <el-tag v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: [],
    }
  },

  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
      console.log(this.rightsList)
    },
  },

  created() {
    this.getRightsList()
  },
}
</script>

<style lang="less" scoped>
</style>