<template>
  <div class="teaching-group-details">
    <div class="details-card">
      <div class="header">
        <div class="back-button" @click="goBack()">
          <el-icon class="back-arrow"><Back /></el-icon>
        </div>
        <div class="header-info">
          <h1 class="group-title">{{ groupTitle }}</h1>
          <el-tag :type="getGroupTypeTag(groupData?.group_type)" size="large">
            教学管理 - {{ getGroupTypeLabel(groupData?.group_type) }}
          </el-tag>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateTask = true">
            <el-icon><Plus /></el-icon>
            发布任务
          </el-button>
          <el-dropdown @command="handleHeaderCommand">
            <el-button>
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑小组</el-dropdown-item>
                <el-dropdown-item command="invite">邀请学生</el-dropdown-item>
                <el-dropdown-item command="export">导出数据</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
          <el-tab-pane label="数据统计" name="analytics">
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

    <!-- 快速创建任务弹窗 -->
    <el-dialog
      v-model="showCreateTask"
      title="发布新任务"
      width="600px"
    >
      <QuickTaskForm 
        :group-id="groupId"
        @task-created="handleTaskCreated"
        @cancel="showCreateTask = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back, Plus, MoreFilled } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import api from '../../api'

// 导入子组件（这些组件需要后续创建）
import TeachingTaskManagement from './TeachingTaskManagement.vue'
import TeachingStudentManagement from './TeachingStudentManagement.vue'
import TeachingLeaveManagement from './TeachingLeaveManagement.vue'
import TeachingAnalytics from './TeachingAnalytics.vue'
import TeachingGroupSettings from './TeachingGroupSettings.vue'
import QuickTaskForm from './QuickTaskForm.vue'

const router = useRouter()
const route = useRoute()
const store = useStore()

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
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
  tab: {
    type: String,
    default: 'tasks'
  },
  viewMode: {
    type: String,
    default: 'teacher'
  }
})

const activeTab = ref(props.tab)
const groupData = ref(null)
const showCreateTask = ref(false)

const groupTitle = computed(() => {
  return props.groupName || groupData.value?.group_name || '小组管理'
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
  router.push('/user-center/teaching-management')
}

const handleTabChange = (tabName) => {
  // 可以在这里添加标签页切换逻辑
  console.log('切换到标签页:', tabName)
}

const handleHeaderCommand = (command) => {
  switch (command) {
    case 'edit':
      // 编辑小组信息
      ElMessage.info('编辑小组功能开发中')
      break
    case 'invite':
      // 邀请学生
      ElMessage.info('邀请学生功能开发中')
      break
    case 'export':
      // 导出数据
      ElMessage.info('导出数据功能开发中')
      break
  }
}

const handleTaskCreated = () => {
  showCreateTask.value = false
  refreshData()
  ElMessage.success('任务发布成功')
}

const refreshData = async () => {
  await fetchGroupData()
}

const fetchGroupData = async () => {
  try {
    console.log('开始获取小组数据，groupId:', props.groupId)
    
    const response = await api.get('/user/group')
    if (response.data.code === 200) {
      const allGroups = [
        ...(response.data.project_group || []),
        ...(response.data.study_group || [])
      ]
      
      const group = allGroups.find(g => g.group_id === parseInt(props.groupId))
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
          group_id: props.groupId,
          group_name: props.groupName || '教学小组',
          group_type: 'study'
        }
      }
    }
  } catch (error) {
    console.error('获取小组数据失败:', error)
    // API失败时使用默认数据
    groupData.value = {
      group_id: props.groupId,
      group_name: props.groupName || '教学小组',
      group_type: 'study'
    }
    ElMessage.warning('获取小组数据失败，使用默认数据')
  }
}

onMounted(() => {
  console.log('TeachingGroupDetails 组件已挂载')
  console.log('Props:', props)
  console.log('当前tab:', activeTab.value)
  
  fetchGroupData()
  
  // 如果有taskId参数，自动切换到任务管理标签
  if (props.taskId) {
    activeTab.value = 'tasks'
  }
})
</script>

<style scoped>
.teaching-group-details {
  width: 100%;
  margin-top: 10px;
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

.group-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
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
</style>
