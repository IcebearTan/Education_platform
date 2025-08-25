<!-- 使用vue3语法 -->
<script setup>
import api from '../../api';
import { ref, onMounted, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex';
import { el } from 'element-plus/es/locales.mjs';
import { DataLine, Message, Setting, User } from '@element-plus/icons-vue';

const User_Info = ref({})
const User_Avatar = ref('');

const activeIndex = ref('/')
const loading = ref(true)

const router = useRouter()
const route = useRoute()
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
  return false
}

// 计算当前应该高亮的菜单项
const getActiveMenuIndex = (currentPath) => {
  console.log('路由匹配检查 - 当前路径:', currentPath)
  
  // 处理teaching相关的路由 (包括 /user-center/teaching-management 和 /user-center/teaching/:groupId)
  if (currentPath.startsWith('/user-center/teaching')) {
    console.log('匹配到teaching路由')
    return '/user-center/teaching-management'
  }
  
  // 处理学习小组相关的路由 (包括study-groups、my-groups重定向和study-group详情页)
  if (currentPath.startsWith('/user-center/study-groups') || 
      currentPath.startsWith('/user-center/my-groups') ||
      currentPath.includes('/user-center/study-group/')) {
    console.log('匹配到my-groups路由 (study-groups/my-groups/study-group)')
    return '/user-center/my-groups'
  }
  
  // 处理user-info的子路由
  if (currentPath.startsWith('/user-center/user-info')) {
    console.log('匹配到user-info路由')
    return '/user-center/user-info'
  }
  
  // 处理my-feedbacks的子路由
  if (currentPath.startsWith('/user-center/my-feedbacks')) {
    console.log('匹配到my-feedbacks路由')
    return '/user-center/my-feedbacks'
  }
  
  console.log('未匹配到特定路由，返回原路径')
  // 其他路由直接返回路径
  return currentPath
}

// 监听路由变化，更新activeIndex
watch(() => route.path, (newPath) => {
  const activeMenuIndex = getActiveMenuIndex(newPath)
  console.log('路由变化:', newPath, '-> 激活菜单:', activeMenuIndex)
  activeIndex.value = activeMenuIndex
}, { immediate: true })

onMounted(() => {
  fetchUserInfo().then(() => {
    fetchUserAvatar();
  });
  // 使用当前路由路径设置activeIndex
  const initialActiveIndex = getActiveMenuIndex(route.path)
  console.log('组件挂载 - 当前路径:', route.path, '-> 激活菜单:', initialActiveIndex)
  activeIndex.value = initialActiveIndex;
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
              <el-icon><User /></el-icon>
              <span>账户设置</span>
            </el-menu-item>
            <el-menu-item index="/user-center/my-groups" @click="router.push('/user-center/study-groups')">
              <el-icon><DataLine /></el-icon>
              <span>我的小组</span>
            </el-menu-item>
            <!-- 导师专用菜单项 -->
            <el-menu-item 
              v-if="vertifyUserMode()" 
              index="/user-center/teaching-management" 
              @click="router.push('/user-center/teaching-management')"
            >
              <el-icon><Setting /></el-icon>
              <span>管理小组</span>
            </el-menu-item>
          </div>
          <div class="functionSection">
            <el-menu-item index="/user-center/my-feedbacks" @click="router.push('/user-center/my-feedbacks')">
              <el-icon><Message /></el-icon>
              <span>反馈记录</span>
            </el-menu-item>
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

/* 统一菜单项选中风格为淡蓝色 */
.el-menu-vertical-demo .el-menu-item {
  position: relative;
  transition: all 0.3s ease;
}

.el-menu-vertical-demo .el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #409EFF 0%, #87CEEB 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.el-menu-vertical-demo .el-menu-item:hover::before,
.el-menu-vertical-demo .el-menu-item.is-active::before {
  opacity: 1;
}

.el-menu-vertical-demo .el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.1) !important;
  color: #409EFF !important;
}

.el-menu-vertical-demo .el-menu-item.is-active {
  background-color: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
  font-weight: 500;
}

.el-menu-vertical-demo .el-menu-item:hover .el-icon,
.el-menu-vertical-demo .el-menu-item.is-active .el-icon {
  color: #409EFF !important;
}

.el-menu-vertical-demo .el-menu-item:hover span,
.el-menu-vertical-demo .el-menu-item.is-active span {
  color: #409EFF !important;
}
</style>