<script>
import { RouterView } from "vue-router";
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Document, User, ChatLineRound, Trophy, Setting, Location, Grid} from '@element-plus/icons-vue';

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
      this.activeIndex = '/article/manage'
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
        <el-aside width="200px" class="fixed-aside">
          <!-- <h5 class="title">训练营<br>后台管理系统</h5> -->
          <el-menu active-text-color="#ffd04b" background-color="#545c64" class="el-menu-vertical-demo"
            :default-active=activeIndex text-color="#fff" @open="handleOpen" @close="handleClose">
            <div class="title">训练营<br>后台管理系统</div>
            <el-sub-menu index="1">
              <template #title>
                <el-icon>
                  <User />
                </el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/user-manage/users" @click="router.push('/user-manage/users')">管理用户</el-menu-item>
              <el-menu-item index="/user-manage/attendence" @click="router.push('/user-manage/attendence')">考勤管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2" >
              <template #title>
                <el-icon>
                  <Document />
                </el-icon>
                <span>文章管理</span>
              </template>
              <el-menu-item index="/article/manage" @click="router.push('/article/manage')">管理文章</el-menu-item>
              <el-menu-item index="/article/create" @click="router.push('/article/create')" disabled>草稿箱</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="4" >
              <template #title>
                <el-icon>
                  <ChatLineRound />
                </el-icon>
                <span>小组管理</span>
              </template>
              <el-menu-item index="/group/manage" @click="router.push('/group/manage')">管理小组</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="3" disabled>
              <template #title>
                <el-icon>
                  <Location />
                </el-icon>
                <span>课程管理</span>
              </template>
              <el-menu-item index="3-1">编辑文章</el-menu-item>
              <el-menu-item index="3-2">管理文章</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="5">
              <template #title>
                <el-icon>
                  <Grid />
                </el-icon>
                <span>学习进度管理</span>
              </template>
              <el-menu-item index="/learningprgress/manage" @click="router.push('/learningprgress/manage')">编辑学习进度</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="6" disabled>
              <template #title>
                <el-icon>
                  <Grid />
                </el-icon>
                <span>首页管理</span>
              </template>
              <el-menu-item index="/homepage/manage" @click="router.push('/homepage/cover')">编辑首页封面</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="7">
              <template #title>
                <el-icon>
                  <Trophy />
                </el-icon>
                <span>勋章管理</span>
              </template>
              <el-menu-item index="/medal/manage" @click="router.push('/medal/manage')">管理勋章</el-menu-item>
              <el-menu-item index="/medal/grant" @click="router.push('/medal/grant')" disabled>勋章查询</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="8" style="position: absolute; bottom: 0;">
              <el-icon>
                <Setting />
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

.fixed-aside {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  background: #545c64;
  box-shadow: 2px 0 8px rgba(0,0,0,0.08);
}

.common-layout {
  width: calc(100vw - 200px);
  min-height: 100%;
  margin-left: 200px;
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
