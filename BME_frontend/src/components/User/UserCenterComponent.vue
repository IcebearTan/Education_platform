<!-- 使用vue3语法 -->
<script setup>
import api from '../../api';
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';
import { el } from 'element-plus/es/locales.mjs';
import { DataLine, Message } from '@element-plus/icons-vue';

const User_Info = ref({})
const User_Avatar = ref('');

const activeIndex = ref('/')
const loading = ref(true)

const router = useRouter()
const store = useStore()

const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await api({
      url: "/user/user_index",
      method: "get",
    });
    if (response.data.code === 200) {
      User_Info.value = response.data;
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    // 只做本地跳转，异常提示交给全局拦截器
    if (error.response && error.response.status === 401) {
      router.push('/login');
    }
  } finally {
    loading.value = false
  }
}

const fetchUserAvatar = async () => {
  try {
    const response = await api({
      url: "/user/user_avatars", // 请求头像的URL
      method: "get",
    });
    if (response.data.code === 200) {
      // 检查服务器返回的头像数据是否存在
      if (response.data.User_Avatar && response.data.User_Avatar !== null) {
        User_Avatar.value = `data:image/png;base64,${response.data.User_Avatar}`;
      } else {
        // 用户尚未设置头像，使用默认头像
        User_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
      }
    } else {
      // 接口请求失败，使用默认头像
      User_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
      ElMessage.error('获取头像失败');
    }
  } catch (error) {
    // 请求异常，使用默认头像
    User_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
    // 只做本地跳转，异常提示交给全局拦截器
    if (error.response && error.response.status === 401) {
      router.push('/login');
    } else {
      ElMessage.error('UserCenterComponent:用户尚未上传头像或未知的错误');
    }
  }
}

const vertifyUserMode = () => {
  if (store.state.user) {
    if (store.state.user.User_Mode == 'admin') {
      return true
    } else {
      return false
    }
  }
  
}

onMounted(() => {
  fetchUserInfo().then(() => {
    fetchUserAvatar();
  });
  activeIndex.value = router.currentRoute.value.path;
})
</script>

<template>
  <!--  -->
  <el-row>
    <el-col :span="6">
      <div class="left-side">
        <div class="NavHeader">
          <div class="avatarContainer">
            <el-avatar
                shape="square"
                size="large"
                class="avatar"
                :src="User_Avatar" alt="image"
            />
          </div>
          <div class="username">{{ User_Info.User_Name }}</div>
          <div v-if="vertifyUserMode()" class="user-type-instructor">导师</div>
          <div v-else class="user-type-student">学生</div>
        </div>
        <el-menu
          :default-active=activeIndex
          class="el-menu-vertical-demo"
        >
          <div class="functionSection">
            <el-menu-item index="/user-center/user-info" @click="router.push('/user-center/user-info')">
              <el-icon><user /></el-icon>
              <span>账户设置</span>
            </el-menu-item>
            <el-menu-item index="/user-center/my-groups" @click="router.push('/user-center/my-groups')">
              <el-icon><DataLine /></el-icon>
              <span>我的小组</span>
            </el-menu-item>
            <!-- <el-menu-item index="3">
              <el-icon><document /></el-icon>
              <span>学过什么</span>
            </el-menu-item> -->
          </div>
          <div class="functionSection">
            <el-menu-item index="/user-center/my-feedbacks" @click="router.push('/user-center/my-feedbacks')">
              <el-icon><Message /></el-icon>
              <span>反馈记录</span>
            </el-menu-item>
            <!-- <el-menu-item index="3">
              <el-icon><document /></el-icon>
              <span>学过什么</span>
            </el-menu-item> -->
          </div>
        </el-menu>
      </div>
    </el-col>
    <el-col :span="18" style="padding-left: 20px;">
      <router-view :User_Info="User_Info"></router-view>
    </el-col>
  </el-row>
  

</template>

<style scoped>
.right-side{
  border-radius: 5px;
  box-shadow: #d3dce6 0px 0px 10px 0px;

  color: #729bd4;

  height: 200px;
  width: 50%;

  margin: 10px;
}

.left-side{
  border-radius: 5px;
  /* box-shadow: #d3dce6 0px 0px 10px 0px; */

  min-height: 100vh;
  width: 100%;

  margin-top: 10px;
}

.NavHeader{
  display: flex;
  flex-wrap: wrap;

  justify-content: center;
  align-items: center;
  padding: 10px;
}

.avatarContainer{
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;

  width: 100%;
}

.user-type-instructor{
    position: relative;
    top: 0;
    font-size: 20px;
    font-weight: bold;
    color: #DA6AFC;

    text-shadow: 0px 0px 5px #ecadff;
}

.user-type-student{
    position: relative;
    top: 0;
    font-size: 20px;
    font-weight: bold;
    color: #6AD5FC;

    text-shadow: 0px 0px 5px #a5e7ff;

}

.username{
  text-align: center;
  align-items: center;
  font-size: larger;
  font-weight: normal;
  margin-bottom: 5px;

  width: 100%;

  color: #666;
}

.avatar{
  width: 75px;
  height: 75px;

  border-radius: 10px;
}

.functionSection{
  border-top: 1px solid #d3dce6;
}

.el-menu-vertical-demo{
  border: none !important;
  background-color: none !important;

  width: 90%;
  margin: auto;
}
</style>