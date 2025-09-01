<template>
  <div class="teaching-group-details">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'teaching-management' }">教学管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ groupTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="details-card">
      <div class="header">
        <div class="back-button" @click="goBack()">
          <el-icon class="back-arrow"><Back /></el-icon>
        </div>
        <div class="header-info">
          <div class="title-row">
            <h1 class="group-title">{{ groupTitle }}</h1>
            <el-tag :type="getGroupTypeTag(groupData?.group_type)" size="large" class="group-type-tag">
              {{ getGroupTypeLabel(groupData?.group_type) }}管理
            </el-tag>
          </div>
        </div>
        <div class="header-actions">
          <div class="course-info">
            <div class="course-label">关联课程：</div>
            <div class="course-name">{{ groupData?.course_name || '高等数学' }}</div>
          </div>
        </div>
      </div>

      <div class="content-tabs">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="任务管理" name="tasks">
            <TeachingTaskManagement 
              :group-id="groupId" 
              :group-data="groupData"
              @task-updated="refreshData"
            />
          </el-tab-pane>
          <el-tab-pane label="学生管理" name="students">
            <TeachingStudentManagement 
              :group-id="groupId" 
              :group-data="groupData"
              :highlight-application-id="applicationId"
              @students-updated="refreshData"
            />
          </el-tab-pane>
          <el-tab-pane label="请假管理" name="leave">
            <TeachingLeaveManagement 
              :group-id="groupId" 
              :group-data="groupData"
              @leave-updated="refreshData"
            />
          </el-tab-pane>
          <el-tab-pane label="小组动态" name="analytics">
            <TeachingAnalytics 
              :group-id="groupId" 
              :group-data="groupData"
            />
          </el-tab-pane>
          <el-tab-pane label="小组设置" name="settings">
            <TeachingGroupSettings 
              :group-id="groupId" 
              :group-data="groupData"
              @group-updated="refreshData"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import api from '../../api'

// 导入子组件（这些组件需要后续创建）
import TeachingTaskManagement from './TeachingTaskManagement.vue'
import TeachingStudentManagement from './TeachingStudentManagement.vue'
import TeachingLeaveManagement from './TeachingLeaveManagement.vue'
import TeachingAnalytics from './TeachingAnalytics.vue'
import TeachingGroupSettings from './TeachingGroupSettings.vue'

const router = useRouter()
const route = useRoute()
const store = useStore()

// 统一从route.params获取groupId，从route.query获取其他参数
const groupId = computed(() => route.params.groupId || props.groupId)
const groupName = computed(() => route.query.group_name || props.groupName)
const taskId = computed(() => route.query.taskId || props.taskId)
const homeworkId = computed(() => route.query.homeworkId || props.homeworkId)
const applicationId = computed(() => route.query.applicationId || props.applicationId)
const activeTabName = computed(() => route.query.tab || props.tab)

const props = defineProps({
  groupId: {
    type: [String, Number],
    default: null
  },
  groupName: {
    type: String,
    default: ''
  },
  taskId: {
    type: [String, Number],
    default: null
  },
  homeworkId: {
    type: [String, Number],
    default: null
  },
  applicationId: {
    type: String,
    default: null
  },
  tab: {
    type: String,
    default: 'tasks'
  },
  viewMode: {
    type: String,
    default: 'teacher'
  }
})

const activeTab = ref(activeTabName.value)
const groupData = ref(null)

const groupTitle = computed(() => {
  return groupName.value || groupData.value?.group_name || '小组管理'
})

const getGroupTypeTag = (type) => {
  const typeMap = {
    'study': 'success',
    'project': 'warning',
    'default': 'info'
  }
  return typeMap[type] || typeMap.default
}

const getGroupTypeLabel = (type) => {
  const labelMap = {
    'study': '学习小组',
    'project': '项目小组',
    'default': '其他'
  }
  return labelMap[type] || labelMap.default
}

const goBack = () => {
  router.push({ name: 'teaching-management' })
}

const handleTabChange = (tabName) => {
  // 可以在这里添加标签页切换逻辑
  console.log('切换到标签页:', tabName)
}

const refreshData = async () => {
  await fetchGroupData()
}

const fetchGroupData = async () => {
  try {
    console.log('开始获取小组数据，groupId:', groupId.value)
    
    const response = await api.get('/user/group')
    if (response.data.code === 200) {
      const allGroups = [
        ...(response.data.project_group || []),
        ...(response.data.study_group || [])
      ]
      
      const group = allGroups.find(g => g.group_id === parseInt(groupId.value))
      if (group) {
        groupData.value = group
        // 确保group_name字段
        if (!group.group_name && group.title) {
          group.group_name = group.title
        }
        console.log('找到小组数据:', groupData.value)
      } else {
        console.log('未找到对应的小组，使用默认数据')
        // 如果没找到小组，使用默认数据
        groupData.value = {
          group_id: groupId.value,
          group_name: groupName.value || '教学小组',
          group_type: 'study',
          course_name: '高等数学'
        }
      }
    }
  } catch (error) {
    console.error('获取小组数据失败:', error)
    // API失败时使用默认数据
    groupData.value = {
      group_id: groupId.value,
      group_name: groupName.value || '教学小组',
      group_type: 'study',
      course_name: '高等数学'
    }
    ElMessage.warning('获取小组数据失败，使用默认数据')
  }
}

onMounted(() => {
  console.log('TeachingGroupDetails 组件已挂载')
  console.log('GroupId:', groupId.value)
  console.log('当前tab:', activeTab.value)
  console.log('ApplicationId:', applicationId.value)
  
  fetchGroupData()
  
  // 如果有taskId参数，自动切换到任务管理标签
  if (taskId.value) {
    activeTab.value = 'tasks'
  }
  
  // 如果有applicationId参数，自动切换到学生管理标签
  if (applicationId.value) {
    activeTab.value = 'students'
  }
})
</script>

<style scoped>
.teaching-group-details {
  width: 100%;
  margin-top: 10px;
}

.breadcrumb-nav {
  margin-bottom: 16px;
  padding: 0 4px;
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #303133;
  font-weight: 500;
}

.details-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  min-height: 1000px;
}

.header {
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;
}

.back-button {
  cursor: pointer;
  color: #444;
  font-size: 24px;
  margin-right: 16px;
}

.back-arrow:hover {
  transform: translateX(-2px);
  color: #409EFF;
  transition: all 0.2s ease-in-out;
}

.header-info {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.group-type-tag {
  margin-left: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.course-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #b3d8ff;
}

.course-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.course-name {
  font-size: 14px;
  color: #409eff;
  font-weight: 600;
}

.content-tabs {
  padding: 24px;
}

:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}

:deep(.el-tabs__content) {
  min-height: 600px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-info {
    width: 100%;
  }
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .group-title {
    font-size: 20px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .course-info {
    width: 100%;
    justify-content: flex-start;
  }
  
  .content-tabs {
    padding: 16px;
  }
}
</style>
