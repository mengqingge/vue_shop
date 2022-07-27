<template>
  <div class="userApp">
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div class="img-box">
          <img src="../assets/heima.png" alt="">
          <span>黑马电商后台管理系统</span>
        </div>
        <el-button type="info" @click="loginOutBtn">退出登录</el-button>
      </el-header>

      <!-- 页面主体区域 -->
      <el-container>
        <!-- 左侧边栏 -->
        <el-aside :width="isCollapse?'64px':'200px'">
          <div class="toggleAside" @click="hideAside">|||</div>

          <!-- 侧边栏菜单区域 -->
          <el-menu class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" active-text-color="green" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
            <!-- 一级菜单 -->
            <!-- <el-submenu :index="item.id.toString()" v-for="item in menuList" :key="item.id"> -->
            <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
              <template slot="title">
                <i :class="iconObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>

              <!-- 二级菜单 -->
              <el-menu-item :index="i.path" v-for="i in item.children" :key="i.id" @click="saveNavPath(i.path)">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{i.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>

        <!-- 右侧内容主体 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

  </div>
</template>

<script>
export default {
  name: 'Home',

  data() {
    return {
      menuList: [],
      iconObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },

      isCollapse: false,

      activePath: '',
    }
  },

  methods: {
    loginOutBtn() {
      // window.sessionStorage.removeItem('token')
      window.sessionStorage.clear()
      this.$router.push('/login')
    },

    // 获得左侧菜单权限
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      //   console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      // console.log(res);
    },

    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
    },

    // 隐藏,显示左侧边栏
    hideAside() {
      this.isCollapse = !this.isCollapse
    },

    // 保存链接的激活状态
    saveNavPath(actPath) {
      window.sessionStorage.setItem('actPath', actPath)
      this.activePath = actPath
    },
  },

  created() {
    // 调用左侧菜单权限
    this.getMenuList()

    this.activePath = window.sessionStorage.getItem('actPath')
  },
}
</script>

<style lang="less" scoped>
.userApp {
  height: 100%;
  .home-container {
    height: 100%;
  }
}
// 这样不行，或者可以将div标签选择器去掉
// .home-container {
//   height: 100%;
// }

.el-header {
  background-color: #b3c0d1;
  color: #333;
  font-size: 30px;
  //   text-align: center;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .img-box {
    img {
      padding-right: 20px;
      vertical-align: middle;
    }
  }
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  // text-align: center;
  line-height: 40px;

  .el-radio-group {
    .el-radio-button {
      width: 100%;
    }
  }

  .toggleAside {
    background-color: rgb(40, 160, 130);
    text-align: center;
    color: #fff;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

  .el-menu {
    background-color: #d3dce6;
    //   border-right: none;

    span {
      margin-left: 10px;
    }
  }
}

.el-main {
  background-color: #e0e0de;
  color: #333;
  // text-align: center;
  // line-height: 160px;
}
</style>