<template>
  <div class="study-groups-container">
    <div class="study-groups-card">
      <div class="title">
        <div class="title-text">学习小组</div>
        <div class="title-select">
          <el-select
            v-model="selectedType"
            placeholder="选择类型"
            size="large"
            style="width: 160px"
          >
            <el-option
              v-for="item in studyGroupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="groups-container">
        <el-form :model="form" ref="formRef" class="transparent-form">
          <div v-if="isLoading" class="scroll-container" @scroll="handleScroll"> 
            <el-loading text="加载中..." />
          </div>
          <div v-else class="scroll-container" @scroll="handleScroll">
            <template v-if="filteredGroups.length > 0">
              <StudyGroupCard
                v-for="(group, index) in filteredGroups"
                :key="index"
                :group="group"
              />
            </template>
            <template v-else>
              <div class="no-group">
                <el-empty 
                  :image-size="120"
                  description="还没有加入任何学习小组"
                >
                  <el-button type="primary" @click="requestJoinGroup">申请加入小组</el-button>
                </el-empty>
              </div>
            </template>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import StudyGroupCard from './StudyGroupCard.vue'
import api from '../../api'
import { mockGroupList, mockApiResponses } from '../../mock/studyGroupData'
import { mockApiRequest } from '../../mock/config'
    
const form = ref({})
const isLoading = ref(true)

// 学习小组类型选项
const studyGroupOptions = [
  { value: 'all', label: '全部小组' },
  { value: 'study', label: '学习小组' },
  { value: 'project', label: '项目小组' }
]

const selectedType = ref('all')
const studyGroups = ref([])

// 筛选后的小组
const filteredGroups = computed(() => {
  if (selectedType.value === 'all') {
    return studyGroups.value
  } else {
    // 根据小组类型筛选
    return studyGroups.value.filter(group => group.group_type === selectedType.value)
  }
})

const getStudyGroups = async () => {
  try {
    isLoading.value = true
    studyGroups.value = []

    const response = await mockApiRequest(
      // 真实API调用
      async () => {
        const res = await api.get('/user/group')
        if (res.data.code === 200) {
          return processRealApiData(res.data)
        }
        throw new Error('API返回错误')
      },
      // Mock响应
      async () => {
        const mockResponse = await mockApiResponses.getGroupList()
        return mockResponse.data.map(group => ({
          ...group,
          role: 'student',
          role_label: '学生',
          student_names: group.students ? group.students.map(s => s.Student).join('、') : '暂无学生'
        }))
      }
    )

    studyGroups.value = response
    ElMessage.success('小组数据加载成功')
  } catch (error) {
    console.error('获取学习小组失败:', error)
    ElMessage.error('获取小组数据失败')
  } finally {
    isLoading.value = false
  }
}

// 处理真实API数据的函数
const processRealApiData = (apiData) => {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return []

  const allGroups = [
    ...(apiData.project_group || []),
    ...(apiData.study_group || [])
  ]

  const processedGroups = []

  allGroups.forEach(group => {
    // 确保group_name字段存在
    if (!group.group_name && group.title) {
      group.group_name = group.title
    }

    // 判断用户在这个小组中的角色 - 只显示作为学生参与的小组
    const isStudent = group.students && group.students.some(student => student.Student_Id === currentUserId)

    if (isStudent) {
      // 添加角色标识 - 在学习小组界面都显示为学生
      group.role = 'student'
      group.role_label = '学生'
      
      // 设置小组类型
      if (!group.group_type) {
        // 根据API数据来源判断类型
        if (apiData.project_group?.includes(group)) {
          group.group_type = 'project'
        } else {
          group.group_type = 'study'
        }
      }

      // 处理学生信息显示
      if (group.students && group.students.length > 0) {
        group.student_count = group.students.length
        group.student_names = group.students.map(s => s.Student).join('、')
      } else {
        group.student_count = 0
        group.student_names = '暂无学生'
      }

      processedGroups.push(group)
    }
  })

  return processedGroups
}

const getCurrentUserId = () => {
  const myAppDataString = localStorage.getItem('my-app')
  if (!myAppDataString) return null
  
  try {
    const myAppData = JSON.parse(myAppDataString)
    return parseInt(myAppData.user?.User_Id, 10)
  } catch (error) {
    console.error('解析用户数据失败:', error)
    return null
  }
}

const handleScroll = () => {
  // 滚动处理逻辑
}

const requestJoinGroup = () => {
  ElMessage.info('申请加入小组功能开发中')
}

// 监听筛选变化
watch(selectedType, () => {
  // 可以在这里添加筛选变化的处理逻辑
})

onBeforeMount(async () => {
  await getStudyGroups()
})
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
