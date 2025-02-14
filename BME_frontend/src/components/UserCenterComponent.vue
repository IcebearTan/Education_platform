<!-- 使用vue3语法 -->
<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';

const User_Medal = ref()
const User_Email = ref()
const User_Name = ref()
const User_Stage = ref()
const join_time = ref()

const activeIndex = ref('/')

const router = useRouter()
const store = useStore()
// 将获取到的用户数据打印到控制台
onMounted(() => {
  api({
    url: "/user/user_index",
    method: "get",
  }).catch((error) => {
    // if (error.response.status == 422){
    ElMessage.error('登录失效，请重新登录')
    router.push('/login')
    // }

  }).then((res) => {
    // if (res.response.status == 422) {
    //   ElMessage.error('Oops, this is a error message.')
    // }

    if (res.data.code == 200) {
      console.log(res)
      User_Email.value = res.data.User_Email
      User_Medal.value = res.data.User_Medal
      User_Name.value = res.data.User_Name
      User_Stage.value = res.data.User_Stage
      join_time.value = res.data.join_time
    }
  });

  activeIndex.value = router.currentRoute.value.path;
})

</script>

<template>
  <el-row>
    <el-col :span="6">
      <div class="left-side">
        <div class="NavHeader">
          <div class="avatarContainer">
            <el-avatar
                shape="square"
                size="large"
                class="avatar"
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            />
          </div>
          <div class="username">{{ User_Name }}</div>
          <div v-if="$store.state.user.User_Mode == 'admin'" class="user-type-instructor">导师</div>
          <div v-else class="user-type-student">学生</div>
        </div>
        <el-menu
          :default-active=activeIndex
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
        >
          <div class="functionSection">
            <el-menu-item index="/user-info">
              <el-icon><document /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><document /></el-icon>
              <span>个人简历</span>
            </el-menu-item>
            <el-menu-item index="3">
              <el-icon><document /></el-icon>
              <span>学过什么</span>
            </el-menu-item>
          </div>
          <div class="functionSection">
            <el-menu-item index="1">
              <el-icon><document /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><document /></el-icon>
              <span>个人简历</span>
            </el-menu-item>
            <el-menu-item index="3">
              <el-icon><document /></el-icon>
              <span>学过什么</span>
            </el-menu-item>
          </div>
          <div class="functionSection">
            <el-menu-item index="1">
              <el-icon><document /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><document /></el-icon>
              <span>个人简历</span>
            </el-menu-item>
            <el-menu-item index="3">
              <el-icon><document /></el-icon>
              <span>学过什么</span>
            </el-menu-item>
          </div>
        </el-menu>
      </div>
    </el-col>
    <el-col :span="18">
      <router-view></router-view>
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
  box-shadow: #d3dce6 0px 0px 10px 0px;

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
  margin-bottom: 0px;

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