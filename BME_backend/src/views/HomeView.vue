<script>
import { RouterView } from "vue-router";
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: "HomeView",
  components: {

  },

  data() {
    return {
      activeIndex: '/',

      store: useStore(),
      router: useRouter(),
    };
  },

  async created() {
    api({
      url: "/user/user_index",
      method: "get",
    }).catch((error) => {
      // if (error.response.status == 422){
      ElMessage.error('登录失效，请重新登录')
      this.router.push('/login')
      // }

    }).then((res) => {
      // if (res.response.status == 422) {
      //   ElMessage.error('Oops, this is a error message.')
      // }

      if (res.data.code == 200) {
        // console.log(res)
        this.store.dispatch('setUser', res.data)
      }
    }
    )

    if (this.$route.path === '/') {
      this.activeIndex = '/user-manage'
    }
    else {
      this.activeIndex = this.$route.path
    }
    console.log(this.activeIndex)
  }
};
</script>

<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'


const handleOpen = (key, keyPath) => {
  
}

const handleClose = (key, keyPath) => {

}
</script>



<template>
  <div>
    <div class="common-layout">
      <el-container>
        <el-aside width="200px" position="relative">
          <!-- <h5 class="title">训练营<br>后台管理系统</h5> -->
          <el-menu active-text-color="#ffd04b" background-color="#545c64" class="el-menu-vertical-demo"
            :default-active=activeIndex text-color="#fff" @open="handleOpen" @close="handleClose">
            <div class="title">训练营<br>后台管理系统</div>
            <el-sub-menu index="1">
              <template #title>
                <el-icon>
                  <location />
                </el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/user-manage" @click="router.push('/user-manage')">管理用户</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2">
              <template #title>
                <el-icon>
                  <location />
                </el-icon>
                <span>文章管理</span>
              </template>
              <el-menu-item index="/article/manage" @click="router.push('/article/manage')">管理文章</el-menu-item>
              <el-menu-item index="/article/create" @click="router.push('/article/create')">草稿箱</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="3">
              <template #title>
                <el-icon>
                  <location />
                </el-icon>
                <span>课程管理</span>
              </template>
              <el-menu-item index="3-1">编辑文章</el-menu-item>
              <el-menu-item index="3-2">管理文章</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="7" style="position: absolute; bottom: 0;">
              <el-icon>
                <setting />
              </el-icon>
              <span>系统设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<style scoped>
.common-layout {
  width: 100%;
  min-height: 100%;
  /* background-color: #f5f5f5; */
}

.el-menu-vertical-demo {
  min-height: 100vh;
}

.title {
  text-align: center;
  color: #fff;
  margin: 0px;

  height: 60px;
  padding: 10px;

  font-size: large;
  font-weight: 900;

  background-color: #545c64;
}
</style>
