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
                <div class="more-item-button" @click="toRank()">排行榜</div>
                <div class="more-item-button" @click="toTasks()">任务</div>
              </div>
              <el-button type="danger" style="margin: 0; " plain>退出小组</el-button>
            </div>
          </el-popover>
          
        </div>
      </div>
      <div style="margin-top: 30px;">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { ref } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import { ElMessage } from 'element-plus'

export default defineComponent({
  components: {  },
  setup(props, context) {

    const router = useRouter()

    const goback = () => {
      router.back()
    }

    const toRank = () => {
      if (router.currentRoute.value.path !== '/user-center/student-group-details') {
        router.push('/user-center/student-group-details/rank')
      } else {
        ElMessage({
          message: '当前页面已经是排行榜页面',
          type: 'warning',
          duration: 2000
        })
      }
    }
    const toTasks = () => {
      if (router.currentRoute.value.path !== '/user-center/student-group-details') {
        router.push('/user-center/student-group-details/tasks')
      } else {
        ElMessage({
          message: '当前页面已经是任务页面',
          type: 'warning',
          duration: 2000
        })
      }
    }
    
    return {
      goback,
      toRank,
      toTasks,
    }
  },
})
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
.more-item-button{
  width: 100%;
  height: 35px;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 15px;
  /* font-weight: bold; */
  color: #444;
}
.more-item-button:hover{
  background-color: #f5f4f4;
  transition: background-color 0.2s ease-in-out;
}
.more-item-button:active{
  opacity: 0.5;
}
</style>
