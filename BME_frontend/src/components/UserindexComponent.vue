<!-- 使用vue3语法 -->
<script setup>
import api from '../api';
import CalendarComponent from './CalendarComponent.vue';
import UserActivityComponent from './UserActivityComponent.vue';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';
import UserIndexGroupComponent from './UserIndexGroupComponent.vue';

const User_Info = ref({})

const router = useRouter()
const store = useStore()

const toMedalWall = () => {
  router.push('/medal/user-medal')
}
// 将获取到的用户数据打印到控制台
onMounted(() => {
  api({
    url: "/user/user_index",
    method: "get",
  }).catch((error) => {
    ElMessage.error('登录失效，请重新登录')
    router.push('/login')
    console.log(error)

  }).then((res) => {
    if (res.data.code == 200) {
      User_Info.value = res.data
      // console.log(User_Info.value)
    }
  }
  )
})

</script>

<template>
  <el-row>
    <el-col :span="6">
      <div class="left-side">
        <div>
          <div style="padding-left: 20px; display: flex; align-items: center; font-size: large; font-weight: bold; padding-top: 20px;">个人简介</div>
          <div style="padding-left: 20px; color: #aaa; font-size: 15px; margin-top: 10px;">{{ User_Info.Introduction }}</div>
          <div style="color: #555; font-size: 15px;">
            <div style="padding: 20px; padding-bottom: 0;">性别：{{ User_Info.User_Sex }}</div>
            <div style="padding: 20px; padding-bottom: 0;">学院：{{ User_Info.Institute }}</div>
            <div style="padding: 20px; padding-bottom: 0;">专业：{{ User_Info.Major }}</div>
            <div style="padding: 20px; padding-bottom: 0;">入营时间：{{ User_Info.join_time }}</div>
            <div style="padding: 20px; padding-bottom: 0;">GithubID：{{ User_Info.Github_Id }}</div>
            <div style="padding: 20px; padding-bottom: 0;">技能标签：{{ User_Info.Skill_Tags }}</div>
            <div style="padding-bottom: 20px; border-bottom: solid 1px #eee; height: 0; width: 85%; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    </el-col>

    <el-col :span="18">
      <div style="display: flex; margin-bottom: 10px;">
        <div class="right-side" style="margin-left: 0;">
          <UserIndexGroupComponent />
        </div>
        <div class="medal-card" @click="toMedalWall()">
          <span style="height: 100%; width: 60%;">
            <div style="padding: 20px; display: flex; align-items: center; font-size: large; font-weight: bold; padding-bottom: 0;">
              勋章成就: 
            </div>
            <div style="padding: 20px; display: flex; align-items: center; font-size: 25px; font-weight: bold; padding-bottom: 0;">
              {{ User_Info.User_Medal }}
            </div>
            <div class="medalInfo">
              <div class="medalTitle">VTK手术机器人</div>
              <div class="medalDate">获取时间：2025.2.21</div>
            </div>
          </span>
          <span style="display: flex; align-items: center; justify-content: center;">
            <img src="../assets/image.png" class="medal-image" />
          </span>
        </div>
      </div>
      <calendar-component/>
      <user-activity-component/>
    </el-col>
  </el-row>
  

</template>

<style scoped>
.right-side{
  border-radius: 10px;

  box-shadow: #e7edf5 0px 0px 10px 0px;
  height: 200px;
  width: 50%;

  margin: 10px;
}

.medal-card{
  border-radius: 10px;
  box-shadow: #e7edf5 0px 0px 10px 0px;
  color: #555;

  height: 200px;
  width: 50%;

  display: flex;

  margin: 10px;

  transition: all 0.3s;
  cursor: pointer;
}
.medal-card:hover{
  transform: translateY(-5px);
}

.medal-image{
  width: 135px;
  height: 135px;
  margin: 10px;
  /* display: block; */
  border-radius: 50%;
  border: solid #729bd4 5px;
  display: inline-block;

  transition: all 0.3s ease-in-out;
}
.medal-image:hover{
  box-shadow: #a3dce6 0px 0px 22px 0px;
  
}

.left-side{
  border-radius: 10px;

  box-shadow: #e7edf5 0px 0px 10px 0px;

  height: 100vh;
  width: 90%;

  margin-top: 10px;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  width: 100%;
}

.name-role {
  font-size: 16px;
  padding: 5px;
  text-align: center;
}

.sender {
  text-align: center;
}

.registe-info {
  text-align: center;
  padding-top: 10px;
}

.personal-relation {
  font-size: 16px;
  padding: 0px 5px 15px;
  margin-right: 1px;
  width: 100%
}

.relation-item {
  padding: 12px;

}

.medalDate {
  font-size: 14px;
  padding-left: 20px;
  /* text-align: center; */
  color: #999;

  margin-top: 5px;
}
.medalTitle {
  font-size: 16px;
  font-weight: bold;
  padding-left: 20px;
  /* text-align: center; */
  color: #444;
}
.medalInfo {
  margin-top: 30px;
}


</style>
