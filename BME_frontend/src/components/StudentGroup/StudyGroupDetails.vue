<template>
  <div class="study-group-details">
    <div class="details-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'study-groups' }">学习小组</el-breadcrumb-item>
        <el-breadcrumb-item>{{ groupInfo.group_name || '小组详情' }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="group-header-info">
        <div class="group-title-section">
          <h1 class="group-title">{{ groupInfo.group_name }}</h1>
          <div class="group-tags">
            <el-tag 
              :type="groupInfo.group_type === 'project' ? 'warning' : 'primary'"
              size="large"
            >
              {{ groupInfo.group_type === 'project' ? '项目小组' : '学习小组' }}
            </el-tag>
            <el-tag 
              :type="currentUserRole === 'teacher' ? 'success' : 'info'"
              size="large"
            >
              {{ currentUserRole === 'teacher' ? '导师' : '学生' }}
            </el-tag>
          </div>
        </div>
        
        <div class="group-stats">
          <div class="stat-card">
            <div class="stat-number">{{ groupInfo.student_count || 0 }}</div>
            <div class="stat-label">成员数量</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ taskStats.total || 0 }}</div>
            <div class="stat-label">总任务</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ taskStats.completed || 0 }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </div>
    </div>

    <div class="details-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 小组概览 -->
        <el-tab-pane label="小组概览" name="overview">
          <div class="overview-content">
            <el-row :gutter="24">
              <el-col :span="16">
                <el-card title="小组介绍" class="info-card">
                  <div class="group-description">
                    <p v-if="groupInfo.description">{{ groupInfo.description }}</p>
                    <p v-else class="no-description">暂无小组介绍</p>
                  </div>
                </el-card>
                
                <el-card title="最近活动" class="activity-card">
                  <div class="activity-list">
                    <div 
                      v-for="activity in recentActivities" 
                      :key="activity.id"
                      class="activity-item"
                    >
                      <div class="activity-icon">
                        <i :class="getActivityIcon(activity.type)"></i>
                      </div>
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
              
              <el-col :span="8">
                <el-card title="小组成员" class="members-card">
                  <div class="members-list">
                    <!-- 导师信息 -->
                    <div v-if="groupInfo.teacher_name" class="member-item teacher">
                      <el-avatar 
                        :size="40" 
                        :src="groupInfo.teacher_avatar"
                        class="member-avatar"
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
                        :size="36" 
                        :src="student.avatar"
                        class="member-avatar"
                      >
                        {{ student.Student?.charAt(0) }}
                      </el-avatar>
                      <div class="member-info">
                        <div class="member-name">{{ student.Student }}</div>
                        <div class="member-role">学生</div>
                      </div>
                      <div class="member-actions" v-if="currentUserRole === 'teacher'">
                        <el-button size="small" type="text">查看进度</el-button>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 学习任务 - 复用现有组件 -->
        <el-tab-pane label="学习任务" name="tasks">
          <div class="tab-content-wrapper">
            <StudentGroupTask 
              :Group_Id="route.params.groupId"
              :user-role="currentUserRole"
              @goToTaskDetail="handleTaskClick"
            />
          </div>
        </el-tab-pane>

        <!-- 小组排行 - 拆分为学习进度和出勤情况 -->
        <el-tab-pane label="学习进度" name="progress">
          <div class="tab-content-wrapper">
            <LearningProgressRank 
              :groupId="route.params.groupId"
              :currentUserId="getCurrentUserId()"
            />
          </div>
        </el-tab-pane>

        <!-- 出勤情况 -->
        <el-tab-pane label="出勤情况" name="attendance">
          <div class="tab-content-wrapper">
            <AttendanceOverview 
              :groupId="route.params.groupId"
              :currentUserId="getCurrentUserId()"
              @view-detail="handleViewAttendanceDetail"
            />
          </div>
        </el-tab-pane>

        <!-- 请假管理 - 复用现有组件 -->
        <el-tab-pane label="请假管理" name="leave">
          <div class="tab-content-wrapper">
            <StudentGroupLeave 
              :Group_Id="route.params.groupId"
              :user-role="currentUserRole"
            />
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
        :userRole="currentUserRole"
        :taskDetail="selectedTask"
        @close="closeTaskDetail"
        @back="closeTaskDetail"
      />
    </el-dialog>

    <!-- 出勤详情弹出层 -->
    <el-dialog 
      v-model="showAttendanceDetail" 
      title="出勤详细统计" 
      width="90%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <StudentGroupRank 
        :groupId="route.params.groupId"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../../api'
import { 
  mockGroupData, 
  mockTasks, 
  mockActivities, 
  mockLearningProgress,
  mockApiResponses 
} from '../../mock/studyGroupData'
import { mockApiRequest } from '../../mock/config'

// 导入现有组件
import StudentGroupTask from './StudentGroupTask.vue'
import StudentGroupRank from './StudentGroupRank.vue'
import StudentGroupLeave from './StudentGroupLeave.vue'
import TaskDetailComponent from './TaskDetailComponent.vue'

// 导入新的排行组件
import LearningProgressRank from './LearningProgressRank.vue'
import AttendanceOverview from './AttendanceOverview.vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('tasks') // 默认显示任务页面
const groupInfo = ref({})
const recentActivities = ref([])
const tasks = ref([])
const taskFilter = ref('all')
const learningProgress = ref({
  overall: 0,
  totalHours: 0,
  weeklyHours: 0
})

// 任务详情相关状态
const showTaskDetail = ref(false)
const selectedTask = ref(null)

// 出勤详情相关状态
const showAttendanceDetail = ref(false)

const currentUserRole = ref('student')

// 计算任务统计
const taskStats = computed(() => {
  const total = tasks.value.length
  const completed = tasks.value.filter(task => task.status === 'completed').length
  return { total, completed }
})

// 筛选后的任务
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(task => task.status === taskFilter.value)
})

const getGroupDetails = async () => {
  try {
    const response = await mockApiRequest(
      // 真实API调用
      () => api.get(`/user/group/${route.params.groupId}`),
      // Mock响应
      () => mockApiResponses.getGroupDetail(route.params.groupId)
    )
    
    groupInfo.value = response.data || response
    currentUserRole.value = 'student'
    ElMessage.success('小组详情加载成功')
  } catch (error) {
    console.error('获取小组详情失败:', error)
    ElMessage.error('获取小组详情失败')
  }
}

const getGroupTasks = async () => {
  try {
    const response = await mockApiRequest(
      // 真实API调用
      () => api.get(`/user/group/${route.params.groupId}/tasks`),
      // Mock响应
      () => mockApiResponses.getGroupTasks(route.params.groupId)
    )
    
    tasks.value = response.data || response
    ElMessage.success('任务列表加载成功')
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

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

const getLearningProgress = async () => {
  try {
    const userId = getCurrentUserId()
    const response = await mockApiRequest(
      // 真实API调用
      () => api.get(`/user/group/${route.params.groupId}/progress`),
      // Mock响应
      () => mockApiResponses.getLearningProgress(route.params.groupId, userId)
    )
    
    learningProgress.value = response.data || response
  } catch (error) {
    console.error('获取学习进度失败:', error)
  }
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

const handleTabChange = (tabName) => {
  // 可以根据tab切换加载不同数据
  if (tabName === 'tasks' && tasks.value.length === 0) {
    getGroupTasks()
  }
  if (tabName === 'my-progress' && learningProgress.value.overall === 0) {
    getLearningProgress()
  }
}

// 处理任务点击事件
const handleTaskClick = (taskData) => {
  // 如果传入的是完整的任务数据对象（从StudentGroupTask组件来的）
  if (taskData.taskDetail) {
    selectedTask.value = taskData.taskDetail
  } else {
    // 如果传入的是简单的任务对象
    selectedTask.value = taskData
  }
  showTaskDetail.value = true
}

// 关闭任务详情
const closeTaskDetail = () => {
  showTaskDetail.value = false
  selectedTask.value = null
}

// 查看出勤详情
const handleViewAttendanceDetail = () => {
  // 打开出勤详情弹窗
  showAttendanceDetail.value = true
}

// 关闭出勤详情
const closeAttendanceDetail = () => {
  showAttendanceDetail.value = false
}

const viewTaskDetail = (task) => {
  handleTaskClick(task)
}

const getActivityIcon = (type) => {
  const iconMap = {
    'task_create': 'el-icon-document-add',
    'task_complete': 'el-icon-check',
    'member_join': 'el-icon-user',
    'file_upload': 'el-icon-upload'
  }
  return iconMap[type] || 'el-icon-info'
}

const getTaskStatusType = (status) => {
  const typeMap = {
    'in_progress': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'info'
}

const getTaskStatusText = (status) => {
  const textMap = {
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期',
    'all': '全部'
  }
  return textMap[status] || '未知'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onBeforeMount(async () => {
  // 检查查询参数中的tab
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  
  await getGroupDetails()
  await getRecentActivities()
  
  if (activeTab.value === 'tasks') {
    await getGroupTasks()
  }
  
  if (activeTab.value === 'my-progress') {
    await getLearningProgress()
  }
})
</script>

<style scoped>
.study-group-details {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 16px;
}

.group-title-section {
  flex: 1;
}

.group-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.group-tags {
  display: flex;
  gap: 8px;
}

.group-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  min-width: 80px;
  border: 1px solid #e8e8e8;
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
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

.info-card,
.activity-card,
.members-card {
  margin-bottom: 20px;
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
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:hover {
  background-color: #f9f9f9;
}

.activity-icon {
  width: 32px;
  height: 32px;
  background: #e8f4fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #409eff;
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
  max-height: 500px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.member-item:hover {
  background-color: #f9f9f9;
}

.member-item.teacher {
  background: #f8f9fa;
  padding: 16px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #e8e8e8;
}

.member-item.teacher .member-name {
  color: #333;
}

.member-item.teacher .member-role {
  color: #666;
}

.member-avatar {
  margin-right: 12px;
}

.member-info {
  flex: 1;
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

.member-actions {
  opacity: 0;
}

.member-item:hover .member-actions {
  opacity: 1;
}

/* 任务页面样式 */
.tasks-content {
  padding: 24px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tasks-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  margin-bottom: 12px;
  cursor: pointer;
}

.task-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.task-status {
  margin-right: 16px;
}

.task-content {
  flex: 1;
  margin-right: 16px;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
}

.task-description {
  color: #666;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.task-meta {
  font-size: 12px;
  color: #999;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.no-tasks,
.no-activities {
  text-align: center;
  padding: 40px;
  color: #999;
}

.no-tasks i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
  color: #ddd;
}

/* 进度页面样式 */
.progress-content {
  padding: 24px;
}

.progress-overview {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.progress-card {
  text-align: center;
}

.progress-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.progress-details {
  padding: 20px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e8e8e8;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.progress-chart {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #999;
}

/* 复用组件的包装样式 */
.tab-content-wrapper {
  padding: 0;
  background: transparent;
}

.tab-content-wrapper :deep(.student-group-task),
.tab-content-wrapper :deep(.group-rank-container),
.tab-content-wrapper :deep(.leave-container) {
  background: transparent;
  padding: 0;
  margin: 0;
}

/* 确保复用组件与新设计保持一致 */
.tab-content-wrapper :deep(.task-box),
.tab-content-wrapper :deep(.progress-item),
.tab-content-wrapper :deep(.leave-info-block),
.tab-content-wrapper :deep(.learning-progress-rank),
.tab-content-wrapper :deep(.attendance-overview) {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: none;
}

.tab-content-wrapper :deep(.task-box:hover),
.tab-content-wrapper :deep(.progress-item:hover),
.tab-content-wrapper :deep(.ranking-item:hover) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .study-group-details {
    padding: 16px;
  }
  
  .details-header {
    padding: 16px;
  }
  
  .group-header-info {
    flex-direction: column;
    gap: 16px;
  }
  
  .group-stats {
    justify-content: space-around;
    width: 100%;
  }
  
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .task-actions {
    align-self: stretch;
  }
}

@media (max-width: 480px) {
  .group-title {
    font-size: 18px;
  }
  
  .stat-number {
    font-size: 16px;
  }
  
  .stat-label {
    font-size: 11px;
  }
}
</style>
