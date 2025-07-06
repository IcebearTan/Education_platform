<template>
  <div class="student-group-container">
    <div class="student-group-card">
      <div class="title">
        <div class="back-button" @click="goback()">
          <el-icon class="back-arrow"><Back /></el-icon>
        </div>
        <div class="title-text">C语言程序设计</div>
        <div class="more-button">
          <el-popover placement="bottom-end" :width="200" trigger="click">
            <template #reference>
              <el-icon class="more-icon"><MoreFilled /></el-icon>
            </template>
            <div style="display: flex; flex-direction: column;">
              <div class="more-item">
                <div class="more-item-button" :class="{active: currentTab === 'rank'}" @click="toRank()">排行榜</div>
                <div class="more-item-button" :class="{active: currentTab === 'task'}" @click="toTasks()">通知</div>
              </div>
              <el-button type="danger" style="margin: 0; " plain>请假</el-button>
            </div>
          </el-popover>
          
        </div>
      </div>
      <div style="margin-top: 30px;">
        <StudentGroupTask v-if="currentTab === 'task'" />
        <StudentGroupRank v-else-if="currentTab === 'rank'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import StudentGroupTask from './StudentGroupTask.vue'
import StudentGroupRank from './StudentGroupRank.vue'

const router = useRouter()
const currentTab = ref('task') // 'task' 或 'rank'

const goback = () => {
  router.push('/user-center/my-groups')
}
const toRank = () => {
  if (currentTab.value !== 'rank') {
    currentTab.value = 'rank'
  } else {
    ElMessage({
      message: '当前页面已经是排行榜页面',
      type: 'warning',
      duration: 2000
    })
  }
}
const toTasks = () => {
  if (currentTab.value !== 'task') {
    currentTab.value = 'task'
  } else {
    ElMessage({
      message: '当前页面已经是任务页面',
      type: 'warning',
      duration: 2000
    })
  }
}

</script>

<style scoped>
.student-group-container{
  width: 100%;

  margin-top: 10px;
}
.student-group-card{
  /* width: 100%; */
  height: 1000px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.title{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-text{
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
  color: #444;
}
.back-button{
  margin-left: 20px;
  margin-top: 20px;
  cursor: pointer;

  color: #444;
  font-size: 25px;
  font-weight: bold;
}
.back-arrow:hover{
  transform: translateX(5px);
  text-shadow: #ff0000 0 0 5px;
  transition: transform 0.2s ease-in-out;
}
.back-arrow:active{
  opacity: 0.5;
}
.more-button{
  margin-right: 20px;
  margin-top: 20px;
  cursor: pointer;

  color: #444;
  font-size: 25px;
}
.more-button:active{
  opacity: 0.5;
}
.more-item{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  margin-bottom: 10px;
}
.more-item-button {
  width: 100%;
  height: 35px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  color: #0ac0ba;
  border-radius: 6px;
  border: 1.5px solid transparent;
  background: transparent;
  transition: background 0.2s, color 0.2s, border 0.2s;
}
.more-item-button.active {
  border: 1.5px solid #91fffb;
  background: #f4ffff;
  color: #0ac0ba;
}
.more-item-button:hover {
  background: #f4ffff;
}
.more-item-button:active{
  opacity: 0.5;
}
</style>
