<template>
  <div class="student-group-container">
    <div class="student-group-card">
      <div class="title">
        <div class="title-text">我的小组</div>
        <div class="title-select">
          <el-select
            v-model="value"
            placeholder="Select"
            size="large"
            style="width: 160px"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="groups-container">
        <el-form :model="form" ref="formRef" class="transparent-form">
          <div v-if="isLoading" class="scroll-container" @scroll="handleScroll"> 加载中…… </div>
          <div v-else class="scroll-container" @scroll="handleScroll">
            <template v-if="Groups.length > 0">
              <GroupCard
                v-for="(group, index) in Groups"
                :key="index"
                :group="group"
              />
            </template>
            <template v-else>
              <div class="no-group">暂时没有加入小组</div>
            </template>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import GroupCard from './GroupCard.vue'
import { onBeforeMount, watch } from 'vue'
import api from '../../api';
    
const form = ref({});

const isLoading = ref(true);

const options = [
  {
    value: '全部小组',
    label: '全部小组',
  },
  {
    value: '学习小组',
    label: '学习小组',
  },
  {
    value: '项目小组',
    label: '项目小组',
  }
]

const value = ref('全部小组')

let Groups = ref([]);

const getGroupList = async () => {
  try {
    Groups.value.length = 0; // 清空之前的组数据

    const res = await api.get(`/user/group`);

    // 检查 project_groups 是否存在并且是数组
    if (Array.isArray(res.data.project_group)) {
      res.data.project_group.forEach(group => {
        group.group_type = 'project'; // 给 group 加上类型标签
        if (group.students.length > 0) {
          group.student = ''; // 初始化组员字符串
          for (let i = 0; i < group.students.length; i++) {
            group.student += group.students[i].Student_Id + ':' + group.students[i].Student + ','; // 拼接组员的姓名和 ID
          }
          group.student = group.student.slice(0, -1); // 去掉最后一个逗号
        } else {
          group.student = '无'; // 如果没有组员，则显示无
        }
      });
      Groups.value.push(...res.data.project_group);
    } else {
      console.warn("project_groups is not an array or is undefined");
    }

    // 检查 study_groups 是否存在并且是数组
    if (Array.isArray(res.data.study_group)) {
      res.data.study_group.forEach(group => {
        group.group_type = 'study'; // 给 group 加上类型标签
        if (group.students.length > 0) {
          group.student = ''; // 初始化组员字符串
          for (let i = 0; i < group.students.length; i++) {
            group.student += group.students[i].Student_Id + ':' + group.students[i].Student + ','; // 拼接组员的姓名和 ID
          }
          group.student = group.student.slice(0, -1); // 去掉最后一个逗号
        } else {
          group.student = '无'; // 如果没有组员，则显示无
        }
      });
      Groups.value.push(...res.data.study_group);
    } else {
      console.warn("study_groups is not an array or is undefined");
    }

  } catch (error) {
    // 只做console，不弹窗不跳转
    console.error("Error fetching data:", error);
  } finally {
      }
}

onBeforeMount(async () => {
  isLoading.value = true; // 设置加载状态为 true
  await getGroupList();
  foreFilter(); // 调用搜索函数
  isLoading.value = false; // 设置加载状态为 false
});

watch(value, () => {
  search();
});

const search = async () => {
  // console.log(`Searching for groups of type: ${value.value}`);
  // 根据 value 的值筛选 Groups
  if (value.value === '全部小组') {
    isLoading.value = true; // 设置加载状态为 true
    await getGroupList(); // 加载所有小组
    foreFilter();
    isLoading.value = false; // 设置加载状态为 false
  } 
  else {
    isLoading.value = true; // 设置加载状态为 true
    await getGroupList(); // 先加载所有小组
    foreFilter();

    const searchValue = ref(''); // 定义一个变量来存储搜索值

    switch(value.value) {
      case '学习小组':
        searchValue.value = "study";
        break;
      case '项目小组':
        searchValue.value = 'project';
        break;
    }
    Groups.value = Groups.value.filter(group => group.group_type === searchValue.value);
    // console.log(Groups.value);
    isLoading.value = false; // 设置加载状态为 false
  }
}


const filterObjectsByMatchingValues = (groups, validUserId) => {
  // 筛选符合条件的组
  return groups.filter(group => {
    // 检查 teacher_id 是否匹配
    if (group.teacher_id === validUserId) {
      return true;
    }

    // 检查 group.Student_Id 是否匹配
    if (group.students.some(student => student.Student_Id === validUserId)) {
      return true;
    }

    // 如果都不匹配，则过滤掉
    return false;
  });
}

const foreFilter = () => {
  // 从 localStorage 获取数据
  const myAppDataString = localStorage.getItem('my-app');
  
  // 检查数据是否存在
  if (!myAppDataString) {
    console.error("No data found in localStorage for 'my-app'");
    return;
  }

  // 解析 JSON 数据
  let myAppData;
  try {
    myAppData = JSON.parse(myAppDataString); // 将字符串解析为对象
  } catch (error) {
    console.error("Failed to parse 'my-app' data:", error);
    return;
  }

  // 检查数据结构是否正确
  if (!myAppData.user || !myAppData.user.User_Id) {
    console.error("Invalid data structure in 'my-app':", myAppData);
    return;
  }

  // 解构并移除 User_Id 的前导零
  const { User_Id } = myAppData.user;
  const validUserId = parseInt(User_Id, 10); // 转换为整数，自动去掉前导零

  Groups.value = filterObjectsByMatchingValues(Groups.value, validUserId);
}
console.log("有问题请找谭谭");

</script>

<style scoped>
.transparent-form {
  height: 900px; /* 表单高度占满父级容器 */
  min-height: 300px; /* 设置表单的最小高度 */
  overflow: hidden; /* 防止内容溢出 */
}

.scroll-container {
  height: 100%; /* 滚动容器高度占满父级容器 */
  overflow-y: auto; /* 启用垂直滚动条 */
  padding: 10px;
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
.no-group {
  text-align: center;
  color: #999;
  font-size: 16px;
  margin-top: 50px;
}
</style>
