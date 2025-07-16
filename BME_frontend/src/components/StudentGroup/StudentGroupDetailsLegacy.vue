<template>
  <div class="student-group-details-legacy">
    <!-- 简化的头部 -->
    <div class="details-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'study-groups' }">学习小组</el-breadcrumb-item>
        <el-breadcrumb-item>{{ groupInfo.group_name || '小组详情' }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="group-header-info">
        <div class="group-title-section">
          <h1 class="group-title">{{ groupInfo.group_name }}</h1>
          <div class="group-meta">
            <el-tag type="primary" size="large">学习小组</el-tag>
            <span class="member-count">{{ groupInfo.student_count || 0 }}名成员</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能标签页 -->
    <div class="details-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 学习任务 -->
        <el-tab-pane label="学习任务" name="tasks">
          <StudentGroupTask 
            :Group_Id="route.params.groupId"
            :user-role="'student'"
            @goToTaskDetail="handleTaskClick"
          />
        </el-tab-pane>

        <!-- 小组排行 -->
        <el-tab-pane label="小组排行" name="rank">
          <StudentGroupRank 
            :groupId="route.params.groupId"
          />
        </el-tab-pane>

        <!-- 请假管理 -->
        <el-tab-pane label="请假管理" name="leave">
          <StudentGroupLeave 
            :Group_Id="route.params.groupId"
            :user-role="'student'"
          />
        </el-tab-pane>

        <!-- 小组概览 -->
        <el-tab-pane label="小组信息" name="overview">
          <div class="overview-content">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card class="info-card">
                  <template #header>
                    <span>小组介绍</span>
                  </template>
                  <div class="group-description">
                    <p v-if="groupInfo.description">{{ groupInfo.description }}</p>
                    <p v-else class="no-description">暂无小组介绍</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="12">
                <el-card class="activity-card">
                  <template #header>
                    <span>最近活动</span>
                  </template>
                  <div class="activity-list">
                    <div 
                      v-for="activity in recentActivities" 
                      :key="activity.id"
                      class="activity-item"
                    >
                      <div class="activity-content">
                        <div class="activity-text">{{ activity.content }}</div>
                        <div class="activity-time">{{ formatTime(activity.created_at) }}</div>
                      </div>
                    </div>
                    <div v-if="recentActivities.length === 0" class="no-activities">
                      暂无最近活动
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="12">
                <el-card class="members-card">
                  <template #header>
                    <span>小组成员</span>
                  </template>
                  <div class="members-list">
                    <!-- 导师信息 -->
                    <div v-if="groupInfo.teacher_name" class="member-item teacher">
                      <el-avatar 
                        :size="36" 
                        :src="groupInfo.teacher_avatar"
                      >
                        {{ groupInfo.teacher_name?.charAt(0) }}
                      </el-avatar>
                      <div class="member-info">
                        <div class="member-name">{{ groupInfo.teacher_name }}</div>
                        <div class="member-role">导师</div>
                      </div>
                    </div>
                    
                    <!-- 学生列表 -->
                    <div 
                      v-for="student in groupInfo.students" 
                      :key="student.Student_Id"
                      class="member-item student"
                    >
                      <el-avatar 
                        :size="32" 
                        :src="student.avatar"
                      >
                        {{ student.Student?.charAt(0) }}
                      </el-avatar>
                      <div class="member-info">
                        <div class="member-name">{{ student.Student }}</div>
                        <div class="member-role">学生</div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 任务详情弹出层 -->
    <el-dialog 
      v-model="showTaskDetail" 
      title="任务详情" 
      width="90%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <TaskDetailComponent 
        v-if="selectedTask"
        :taskId="selectedTask.id"
        :groupId="route.params.groupId"
        :userRole="'student'"
        :taskDetail="selectedTask"
        @close="closeTaskDetail"
        @back="closeTaskDetail"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../../api'
import { mockApiResponses } from '../../mock/studyGroupData'
import { mockApiRequest } from '../../mock/config'

// 导入现有组件
import StudentGroupTask from './StudentGroupTask.vue'
import StudentGroupRank from './StudentGroupRank.vue'
import StudentGroupLeave from './StudentGroupLeave.vue'
import TaskDetailComponent from './TaskDetailComponent.vue'

const route = useRoute()

// 状态管理
const activeTab = ref('tasks') // 默认显示任务页面
const groupInfo = ref({})
const recentActivities = ref([])

// 任务详情相关状态
const showTaskDetail = ref(false)
const selectedTask = ref(null)

// 获取小组基本信息
const getGroupDetails = async () => {
  try {
    const response = await mockApiRequest(
      // 真实API调用
      () => api.get(`/user/group/${route.params.groupId}`),
      // Mock响应
      () => mockApiResponses.getGroupDetail(route.params.groupId)
    )
    
    groupInfo.value = response.data || response
    ElMessage.success('小组信息加载成功')
  } catch (error) {
    console.error('获取小组详情失败:', error)
    ElMessage.error('获取小组详情失败')
  }
}

// 获取最近活动
const getRecentActivities = async () => {
  try {
    const response = await mockApiRequest(
      // 真实API调用
      () => api.get(`/user/group/${route.params.groupId}/activities`),
      // Mock响应
      () => mockApiResponses.getGroupActivities(route.params.groupId)
    )
    
    recentActivities.value = response.data || response
  } catch (error) {
    console.error('获取活动记录失败:', error)
  }
}

// Tab切换处理
const handleTabChange = (tabName) => {
  console.log('切换到标签页:', tabName)
}

// 处理任务点击事件
const handleTaskClick = (taskData) => {
  if (taskData.taskDetail) {
    selectedTask.value = taskData.taskDetail
  } else {
    selectedTask.value = taskData
  }
  showTaskDetail.value = true
}

// 关闭任务详情
const closeTaskDetail = () => {
  showTaskDetail.value = false
  selectedTask.value = null
}

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

// 初始化数据
onBeforeMount(async () => {
  // 检查查询参数中的tab
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  
  await getGroupDetails()
  await getRecentActivities()
})
</script>

<style scoped>
.student-group-details-legacy {
  padding: 20px;
  background: #f8f9fb;
  min-height: 100vh;
}

.details-header {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f2f5;
}

.group-header-info {
  margin-top: 16px;
}

.group-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-count {
  color: #666;
  font-size: 14px;
}

.details-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

/* 修复tab样式 */
.details-content :deep(.el-tabs) {
  padding: 0 24px;
}

.details-content :deep(.el-tabs__header) {
  margin: 0 0 20px 0;
  padding-top: 20px;
}

.details-content :deep(.el-tabs__content) {
  padding: 0;
}

.details-content :deep(.el-tab-pane) {
  padding: 0;
}

/* 概览页面样式 */
.overview-content {
  padding: 20px 0;
}

.info-card,
.activity-card,
.members-card {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: none;
}

.group-description {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.no-description {
  color: #999;
  font-style: italic;
  font-size: 14px;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.members-list {
  max-height: 300px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.member-item:last-child {
  border-bottom: none;
}

.member-item.teacher {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #e8e8e8;
}

.member-info {
  flex: 1;
  margin-left: 12px;
}

.member-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  font-size: 14px;
}

.member-role {
  font-size: 12px;
  color: #666;
}

.no-activities {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

/* 复用组件的样式适配 */
.details-content :deep(.student-group-task),
.details-content :deep(.group-rank-container),
.details-content :deep(.leave-container) {
  background: transparent;
  padding: 0;
  margin: 0;
}

.details-content :deep(.task-box),
.details-content :deep(.progress-item),
.details-content :deep(.leave-info-block) {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: none;
}

.details-content :deep(.task-box:hover),
.details-content :deep(.progress-item:hover) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .student-group-details-legacy {
    padding: 16px;
  }
  
  .details-header {
    padding: 16px;
  }
  
  .group-title {
    font-size: 18px;
  }
}
</style>
