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
            <div class="stat-number">{{ getMemberCount() }}</div>
            <div class="stat-label">成员数量</div>
          </div>
          <div class="stat-card course-card">
            <div class="stat-course">{{ groupInfo.course_name || '暂无课程' }}</div>
            <div class="stat-label">所属课程</div>
          </div>
        </div>
      </div>
    </div>

    <div class="details-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 小组概览 -->
        <el-tab-pane label="小组概览" name="overview">
          <div class="overview-content">
            <!-- 小组介绍 -->
            <div class="overview-section">
              <div class="section-header">
                <div class="section-title">
                  <span class="title-icon">📖</span>
                  <span>小组介绍</span>
                </div>
              </div>
              <div class="section-content">
                <div class="group-description">
                  <p v-if="groupInfo.description" class="description-text">{{ groupInfo.description }}</p>
                  <div v-else class="no-description">
                    <span class="no-data-text">暂无小组介绍</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 小组成员 -->
            <div class="overview-section">
              <div class="section-header">
                <div class="section-title">
                  <span class="title-icon">👥</span>
                  <span>小组成员</span>
                </div>
                <div class="member-count-badge">{{ getMemberCount() }}人</div>
              </div>
              <div class="section-content">
                <div class="members-grid">
                  <!-- 导师信息 -->
                  <div v-if="groupInfo.teacher_name" class="member-card teacher-card">
                    <div class="member-avatar-wrapper">
                      <el-avatar 
                        :size="44" 
                        :src="groupInfo.teacher_avatar"
                        class="member-avatar"
                      >
                        {{ groupInfo.teacher_name?.charAt(0) }}
                      </el-avatar>
                      <div class="role-badge teacher-badge">导师</div>
                    </div>
                    <div class="member-info">
                      <div class="member-name">{{ groupInfo.teacher_name }}</div>
                      <div class="member-role">负责指导小组学习</div>
                    </div>
                  </div>
                  
                  <!-- 学生列表 -->
                  <div 
                    v-for="(student, index) in groupInfo.students" 
                    :key="student.Student_Id"
                    class="member-card student-card"
                  >
                    <div class="member-avatar-wrapper">
                      <el-avatar 
                        :size="40" 
                        :src="student.avatar"
                        class="member-avatar"
                      >
                        {{ student.Student?.charAt(0) }}
                      </el-avatar>
                      <div class="role-badge student-badge">学生</div>
                    </div>
                    <div class="member-info">
                      <div class="member-name">{{ student.Student }}</div>
                      <div class="member-role">小组成员</div>
                    </div>
                  </div>
                  
                  <!-- 无成员提示 -->
                  <div v-if="!groupInfo.teacher_name && (!groupInfo.students || groupInfo.students.length === 0)" class="no-members-card">
                    <div class="no-data-content">
                      <span class="no-data-icon">👤</span>
                      <span class="no-data-text">暂无成员信息</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 学习任务 - 复用现有组件 -->
        <el-tab-pane label="学习任务" name="tasks">
          <div class="tab-content-wrapper task-tab-wrapper">
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

    <!-- 出勤详情弹出层 - 优化响应式设计 -->
    <el-dialog 
      v-model="showAttendanceDetail" 
      title="出勤详细统计" 
      :width="taskDialogWidth"
      top="3vh"
      :close-on-click-modal="false"
      :show-close="true"
      :modal="true"
      :modal-class="'attendance-detail-modal'"
      class="attendance-detail-dialog"
      :destroy-on-close="true"
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
import { Document, User, UserFilled } from '@element-plus/icons-vue'
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
// import TaskDetailComponent from './TaskDetailComponent.vue' // 已移除，改用路由跳转

// 导入新的排行组件
import LearningProgressRank from './LearningProgressRank.vue'
import AttendanceOverview from './AttendanceOverview.vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('tasks') // 默认显示任务页面
const groupInfo = ref({})
const tasks = ref([])
const taskFilter = ref('all')
const learningProgress = ref({
  overall: 0,
  totalHours: 0,
  weeklyHours: 0
})

// 任务详情相关状态（已移除，改用路由跳转）
// const showTaskDetail = ref(false)
// const selectedTask = ref(null)

// 响应式弹窗宽度计算
const taskDialogWidth = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth
    if (width <= 768) {
      return '95%' // 移动端几乎全屏
    } else if (width <= 1024) {
      return '85%' // 平板
    } else if (width <= 1440) {
      return '75%' // 中等桌面
    } else {
      return '65%' // 大屏桌面
    }
  }
  return '75%' // 默认值
})

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

// 计算成员总数（包括学生和导师）
const getMemberCount = () => {
  const studentCount = groupInfo.value.students?.length || 0
  const teacherCount = groupInfo.value.teacher_name ? 1 : 0
  return studentCount + teacherCount
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

// 处理任务点击事件 - 跳转到任务详情页面
const handleTaskClick = (taskData) => {
  const taskId = taskData.id
  if (taskId) {
    router.push({
      name: 'task-detail',
      params: {
        groupId: route.params.groupId,
        taskId: taskId
      },
      query: {
        role: currentUserRole.value
      }
    })
  }
}

// 关闭任务详情（已废弃，改用路由跳转）
// const closeTaskDetail = () => {
//   showTaskDetail.value = false
//   selectedTask.value = null
// }

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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onBeforeMount(async () => {
  // 检查查询参数中的tab
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  
  await getGroupDetails()
  
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
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #f0f7ff;
  border-color: #d6e4ff;
  transform: translateY(-2px);
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

/* 课程卡片特殊样式 */
.course-card {
  min-width: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 1px solid #667eea;
}

.course-card:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  border-color: #5a6fd8;
  transform: translateY(-2px);
}

.stat-course {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

.course-card .stat-label {
  color: rgba(255, 255, 255, 0.8);
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

/* 为任务标签页移除内边距 */
.details-content :deep(.el-tab-pane[aria-labelledby*="tasks"]) {
  margin: 0 -24px;
}

.task-tab-wrapper {
  margin: 0;
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

/* 概览页面样式 - 扁平化设计 */
.overview-content {
  padding: 24px;
}

.overview-section {
  margin-bottom: 32px;
}

.overview-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.title-icon {
  font-size: 20px;
}

.member-count-badge {
  background: #f8f9fa;
  color: #6c757d;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #e9ecef;
}

.section-content {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
}

/* 小组介绍样式 */
.group-description {
  padding: 24px;
  min-height: 80px;
  display: flex;
  align-items: center;
}

.description-text {
  margin: 0;
  color: #495057;
  line-height: 1.6;
  font-size: 15px;
}

.no-description {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
  font-size: 14px;
  width: 100%;
}

/* 成员网格布局 */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 20px;
}

.member-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.member-card:hover {
  border-color: #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.teacher-card {
  border-left: 4px solid #ff6b35;
  background: linear-gradient(135deg, #fff9f6, #ffffff);
}

.student-card {
  border-left: 4px solid #28a745;
}

.member-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.member-avatar {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.teacher-card .member-avatar {
  border-color: #ff6b35;
  background: linear-gradient(135deg, #ff6b35, #ff8c69);
  color: white;
}

.student-card .member-avatar {
  border-color: #28a745;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.role-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #6c757d;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
  border: 2px solid #fff;
}

.teacher-badge {
  background: #ff6b35;
}

.student-badge {
  background: #28a745;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-role {
  font-size: 13px;
  color: #6c757d;
  font-weight: 400;
}

/* 无成员提示 */
.no-members-card {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.no-data-icon {
  font-size: 32px;
  opacity: 0.5;
}

.no-data-text {
  color: #6c757d;
  font-size: 14px;
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
  width: 98%;
  padding: 10px;
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

/* 出勤详情弹窗样式优化 */
:deep(.attendance-detail-dialog) {
  .el-dialog {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    margin: 0 auto;
  }
  
  .el-dialog__header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
    color: white;
    border-radius: 12px 12px 0 0;
  }
  
  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
    color: white;
  }
  
  .el-dialog__headerbtn {
    top: 16px;
    right: 20px;
  }
  
  .el-dialog__headerbtn .el-dialog__close {
    color: white;
    font-size: 18px;
  }
  
  .el-dialog__body {
    padding: 0;
    max-height: 85vh;
    overflow-y: auto;
  }
}

/* 出勤详情模态层样式 */
:deep(.attendance-detail-modal) {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* 响应式优化 */
@media (max-width: 1200px) {
  :deep(.attendance-detail-dialog .el-dialog) {
    margin: 5vh auto;
  }
}

@media (max-width: 768px) {
  :deep(.attendance-detail-dialog) {
    .el-dialog {
      margin: 2vh 2.5%;
      width: 95% !important;
      max-width: none;
      border-radius: 8px;
    }
    
    .el-dialog__header {
      padding: 16px 20px 12px;
    }
    
    .el-dialog__title {
      font-size: 16px;
    }
    
    .el-dialog__body {
      max-height: 82vh;
    }
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
  
  .stat-course {
    font-size: 12px;
  }
  
  .course-card {
    min-width: 100px;
  }
  
  .group-stats {
    gap: 12px;
  }
}
</style>
