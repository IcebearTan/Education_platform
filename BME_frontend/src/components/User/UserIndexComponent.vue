<!-- 使用vue3语法 -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import api from '../../api'

import CalendarComponent from './CalendarComponent.vue'
import UserActivityComponent from './UserActivityComponent.vue'
import UserIndexGroupComponent from './UserIndexGroupComponent.vue'
// import SeatLayoutComponent from '../SeatLayoutComponent.vue'

const User_Info = ref({})
const router = useRouter()
const store = useStore()

// 技能标签分割为数组，支持多分隔符
const skillTags = computed(() => {
  const tags = User_Info.value.Skill_Tags
  if (!tags || typeof tags !== 'string') return []
  return tags.split(/[,，;；|｜\s]+/).map(tag => tag.trim()).filter(Boolean)
})

// 标签类型分配
const tagTypes = ['primary', 'success', 'info', 'warning', 'danger']
const getTagType = index => tagTypes[index % tagTypes.length]

const toMedalWall = () => router.push('/medal/user-medal')

// 获取用户信息，异常处理更健壮
const fetchUserInfo = async () => {
  try {
    const res = await api({ url: '/user/user_index', method: 'get' })
    if (res?.data?.code === 200) {
      User_Info.value = res.data
      console.log(User_Info.value)
    } else {
      throw new Error(res?.data?.msg || '获取用户信息失败')
    }
  } catch (error) {
    // 只做本地跳转，异常提示交给全局拦截器
    if (error.response && error.response.status === 401) {
      router.push('/login')
    }
  }
}

onMounted(fetchUserInfo)
</script>

<template>
  <el-row>
    <el-col :span="6">
      <div class="left-side">
        <div>
          <div class="profile-title">个人简介</div>
          <div class="profile-intro">{{ User_Info.Introduction || '暂无简介' }}</div>
          <div class="profile-info">
            <div class="profile-info-item">性别：{{ User_Info.User_Sex || '未填写' }}</div>
            <div class="profile-info-item">学校：{{ User_Info.College || '未填写' }}</div>
            <div class="profile-info-item">专业：{{ User_Info.Major || '未填写' }}</div>
            <div class="profile-info-item">入营时间：{{ User_Info.join_time || '未填写' }}</div>
            <div class="profile-info-item">GithubID：{{ User_Info.Github_Id || '未填写' }}</div>
            <div class="profile-info-item profile-skill-tags">
              <div class="profile-skill-title">技能标签：</div>
              <div class="skill-tags-container">
                <el-tag 
                  v-for="(tag, index) in skillTags" 
                  :key="index"
                  :type="getTagType(index)"
                  size="small"
                  class="skill-tag"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="skillTags.length === 0" class="no-skill-tag">暂无技能标签</span>
              </div>
            </div>
            <div class="profile-divider"></div>
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
            <img src="../../assets/image.png" class="medal-image" />
          </span>
        </div>
      </div>
      <div>
        <calendar-component/>
      </div>
      <!-- <user-activity-component/> -->
      <div>
        <UserActivityComponent />
      </div>
    </el-col>
  </el-row>
  

</template>

<style scoped>
.right-side{
  border-radius: 10px;
  background-color: #fff;
  box-shadow: #e7edf5 0px 0px 10px 0px;
  height: 200px;
  width: 50%;
  margin: 10px;
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

.medal-card{
  border-radius: 10px;
  background-color: #fff;
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
  background-color: #fff;
  box-shadow: #e7edf5 0px 0px 10px 0px;
  height: 100vh;
  width: 90%;
  margin-top: 10px;
}

.profile-title {
  padding-left: 20px;
  display: flex;
  align-items: center;
  font-size: large;
  font-weight: bold;
  padding-top: 20px;
}

.profile-intro {
  padding-left: 20px;
  color: #aaa;
  font-size: 15px;
  margin-top: 20px;

  padding-right: 20px;
}

.profile-info {
  color: #555;
  font-size: 15px;
}

.profile-info-item {
  padding: 20px;
  padding-bottom: 0;
}

.profile-skill-tags {
  padding-bottom: 10px;
}

.profile-skill-title {
  margin-bottom: 8px;
  color: #555;
}

.no-skill-tag {
  color: #ccc;
  font-size: 14px;
}

.profile-divider {
  padding-bottom: 20px;
  border-bottom: solid 1px #eee;
  height: 0;
  width: 85%;
  margin: 0 auto;
}

/* 技能标签样式 */
.skill-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.skill-tag {
  margin: 0;
  border-radius: 12px;
  font-size: 12px;
  padding: 4px 8px;
  transition: all 0.3s ease;
}

.skill-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
