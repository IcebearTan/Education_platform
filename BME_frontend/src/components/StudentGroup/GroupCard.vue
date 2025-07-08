<template>
    <div class="group-card"  @click="toGroupDetails()">
      <div class="cover-container">
        <div class="cover" :style="{ backgroundColor: randomColor(props.group.title) }">{{ props.group.title }}</div>
      </div>
      <div class="detail-container">
        <div class="group-title">{{props.group.group_name}}</div>
        <div class="group-member">
          <div class="instructor">
            <img :src="teacher_Avatar" alt="image" class="avatar"/>
            <div>导师：{{ props.group.teacher }}</div>
          </div>
          <div class="students">
            <div class="avatars">
              <img 
                v-for="(avatar, index) in userAvatars.slice(0, 3)" 
                :key="index" 
                :src="avatar" 
                alt="Student Avatar" 
                class="avatar" 
              />
            </div>
            <div v-if="studentNum >= 2">{{ props.group.students[0].Student }}、{{ props.group.students[1].Student }} 等 {{studentNum}} 名学生在内</div>
            <div v-else-if="studentNum == 1" >{{ props.group.students[0].Student }} {{ studentNum }} 名学生在内</div>
            <div v-else >暂无学生</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { defineProps , onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router'
import api from '../../api';

// 定义接收的 props
const props = defineProps({
  group: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

// console.log(props.group);
const studentIds = ref([]);
const teacher_Avatar = ref('');
const userAvatars = ref([]);

const studentNum = props.group.students ? props.group.students.length : 0;

const colorPalette = [
    "#b391ff", // 蓝紫色: 和谐邻近色
    "#91bdff", // 原始色: 柔和蓝色
    "#91ffde", // 蓝绿色: 清新冷色调
    "#ffcc91", // 橙黄色: 温暖对比色
    "#ff91c0"  // 玫红色: 活力点缀色
];

const randomColor = (courseName) => {
    // 简单哈希：将字符串转成数字和 
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
        hash = courseName.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
    }
    // 取余映射到色板 
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
};

onBeforeMount(() => {
  proceStudentId();
  fetchTeacherAvatar(); // 组件挂载前获取老师头像
  fetchUserAvatars(); // 组件挂载前获取学生头像
});

// 跳转到小组详情页的方法
const router = useRouter();
const toGroupDetails = () => {
  // 传递实际的 group_id 和 group_name
  router.push({
    path: '/user-center/student-group-details',
    query: {
      group_id: props.group.group_id, // 传递实际的小组ID
      group_name: props.group.title // 传递小组名称用于标题显示
    }
  })
}

function proceStudentId(){
  if (props.group.students && Array.isArray(props.group.students)) {
  // 遍历 group.group 数组，将每个 Student_Id 添加到 studentIds.value 中
  studentIds.value = props.group.students.map(student => student.Student_Id);
  } else {
    console.error("Invalid group data or group.group is not an array");
  }

  // console.log("Processed Student IDs:", studentIds.value);
}

async function fetchTeacherAvatar() {
try {
  const response = await api({
    url: '/user/user_avatars_id',
    method: 'get',
    params: { 
      User_Id: props.group.teacher_id // 确保字段名正确
    }
  });

  // 检查 API 返回的数据是否包含头像
  if (response.data.User_Avatar) {
    teacher_Avatar.value = `data:image/png;base64,${response.data.User_Avatar}`; // 直接赋值头像 URL
  } else {
    teacher_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'; // 默认头像
  }
} catch (error) {
  console.log(`Error fetching avatar for teacher ${props.group.teacher_id}:`, error);
  teacher_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'; // 出错时使用默认头像
}
}

async function fetchUserAvatars(){
  userAvatars.value = []; // 初始化头像数组
  for (const userId of studentIds.value) {
      try {
          const response = await api({
              url: '/user/user_avatars_id',
              method: 'get',
              params: { // 使用 params 传递单个 ID
                  User_Id: userId
              }
          });
          // 假设 API 返回一个包含头像 URL 的对象
          if (response.data.User_Avatar) {
              userAvatars.value.push(`data:image/png;base64,${response.data.User_Avatar}`); // 将头像 URL 添加到数组中
          } else {
              userAvatars.value.push('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'); // 默认头像
          }
      } catch (error) {
          console.log(`Error fetching avatar for user ${userId}:`, error);
          userAvatars.value.push('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'); // 出错时使用默认头像或 null
      }
  }
  // console.log("User Avatars:", userAvatars.value);
}

</script>
  
<style scoped>
.avatars{
  position: relative;
}
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
  margin-left: 20px;
  margin-top: 20px;

  border-bottom: #444 2px solid;
  padding-bottom: 10px;

  color: #444;
}
.title-select{
  margin-right: 20px;
  margin-top: 20px;
}
.group-card{
  width: 95%;
  height: 160px;
  border-radius: 10px;

  box-shadow: #efefef 0 0 10px;
  margin: auto;

  display: flex;
  margin-bottom: 20px;

  cursor: pointer;

  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.group-card:hover{  
  transform: translateY(-5px);
  box-shadow: #e4e4e4 0 0 10px;
}
.group-card:active{
  transform: scale(0.98);
}
.groups-container{
  margin-top: 20px;
}
.cover-container{
  width: 20%;

  display: flex;
  justify-content: center;
  align-items: center;
}
.detail-container{
  width: 80%;
}
.cover{
  background-color: #91bdff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  width: 90px;
  height: 120px;

  border-radius: 5px;
  /* margin: 5px; */
  padding: 5px;

  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  color: #fff;
}
.group-title{
  display: flex;
  align-items: center;

  font-size: 18px;
  font-weight: bold;
  color: #444;

  margin-top: 10px;
}
.group-member{
  display: flex;
  justify-content: space-between;
  align-items: center;

}
.avatar{
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 15px;

}
.instructor{
  display: flex;
  flex-direction: column;
  align-items: center;

  color: #666;
  margin-top: 20px;
}
.students{
  display: flex;
  flex-direction: column;
  align-items: center;

  color: #666;
  margin-top: 20px;
  margin-right: 20px;
}
</style>