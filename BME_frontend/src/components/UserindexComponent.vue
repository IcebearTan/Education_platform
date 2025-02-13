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
  }
  )
})

</script>

<template>
  <el-row>
    <el-col :span="6">
      <!-- <div class="grid-content bg-purple">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人简介</span>
          </div>
          <el-divider></el-divider>
          <div class="name-role">
            <span class="sender">{{ User_Name }}</span>
          </div>
          <div class="registe-info">
            <span class="registe-info">
              注册时间：
              {{ join_time }}
            </span>
          </div>
          <el-divider></el-divider>
          <div class="personal-relation">
            <div class="relation-item">邮箱: {{ User_Email }}<div style="float: right; padding-right:20px;"></div>
            </div>
          </div>
          <div class="personal-relation">
            <div class="relation-item">勋章: {{ User_Medal }}<div style="float: right; padding-right:20px;"></div>
            </div>
          </div>
          <div class="personal-relation">
            <div class="relation-item">学习阶段: {{ User_Stage }}<div style="float: right; padding-right:20px;"></div>
            </div>
          </div>
        </el-card>
      </div> -->

      <div class="left-side">
        <div>
          <div style="padding: 20px; display: flex; align-items: center; font-size: large; font-weight: bold;">个人简介</div>
          <div style="padding-left: 20px; color: #aaa">这个人很懒什么都没写</div>
          <div style="color: #555;">
            <div style="padding: 20px; padding-bottom: 0;">性别：武装直升机</div>
            <div style="padding: 20px; padding-bottom: 0;">学院：生物医学工程学院</div>
            <div style="padding: 20px; padding-bottom: 0;">专业：生物医学工程</div>
            <div style="padding: 20px; padding-bottom: 0;">入营时间：2024-1-16</div>
            <div style="padding: 20px; padding-bottom: 0;">GithubID：IcebearTan</div>
            <div style="padding: 20px; padding-bottom: 0;">技能标签：无畏契约 英雄联盟 CSGO2 FC24</div>
            <div style="padding-bottom: 20px; border-bottom: solid 1px #eee; height: 0; width: 85%; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    </el-col>

    <el-col :span="18">
      <div style="display: flex;">
        <div class="right-side" style="margin-left: 0;">

        </div>
        <div class="medal-card">
          <span style="height: 100%; width: 60%;">
            <div style="padding: 20px; display: flex; align-items: center; font-size: large; font-weight: bold; padding-bottom: 0;">
              勋章成就: 
            </div>
            <div style="padding: 20px; display: flex; align-items: center; font-size: 25px; font-weight: bold; padding-bottom: 0;">
              {{ User_Medal }}
            </div>
            <div style="padding: 20px; padding-bottom: 0;">最近获得：</div>
            <div style="padding: 20px; font-weight: bold;">VTK手术机器人</div>
          </span>
          <span style="display: flex; align-items: center; justify-content: center;">
            <img src="../assets/image.png" class="medal-image" />
          </span>
          
          <!-- <img src="../assets/image.png" style="width: 100px; height: 100px; margin: 10px; box-shadow: #a3dce6 0px 0px 22px 0px; display: block; border-radius: 50%; border: solid #bb3e51 5px; display: inline-block;" />
          <img src="../assets/image.png" style="width: 100px; height: 100px; margin: 10px; box-shadow: #a3dce6 0px 0px 22px 0px; display: block; border-radius: 50%; display: inline-block;" /> -->


          
          
        </div>
        
      </div>
      
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

.medal-card{
  border-radius: 5px;

  box-shadow: #d3dce6 0px 0px 10px 0px;

  color: #555;

  height: 200px;
  width: 50%;

  display: flex;


  margin: 10px;
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
  border-radius: 5px;

  box-shadow: #d3dce6 0px 0px 10px 0px;

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

.dialog-footer {
  padding-top: 10px;
  padding-left: 10%;
}

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
}

.bg-purple-dark {
  background: #99a9bf;
}

.bg-purple {
  background: #d3dce6;
}

.bg-purple-light {
  background: #e5e9f2;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
