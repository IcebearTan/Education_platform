<template>
  <div class="task-detail-view">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'study-groups' }">学习小组</el-breadcrumb-item>
        <el-breadcrumb-item 
          :to="{ name: 'study-group-details', params: { groupId: route.params.groupId } }"
        >
          {{ groupInfo.group_name || '小组详情' }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>任务详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 任务详情内容区域 -->
    <div class="task-detail-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>
      
      <div v-else-if="error" class="error-container">
        <el-result
          icon="error"
          title="加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="fetchTaskDetail">重试</el-button>
            <el-button @click="goBack">返回</el-button>
          </template>
        </el-result>
      </div>

      <div v-else-if="taskDetail" class="task-content">
        <!-- 任务头部信息 -->
        <div class="task-header">
          <div class="task-header-left">
            <div class="task-title-section">
              <h1 class="task-title">{{ taskDetail.title }}</h1>
              <div class="task-meta">
                <el-tag 
                  v-if="taskDetail.priority"
                  :type="getPriorityType(taskDetail.priority)"
                  size="large"
                  class="priority-tag"
                >
                  {{ getPriorityText(taskDetail.priority) }}
                </el-tag>
                <el-tag 
                  :type="getStatusType(taskDetail.status)"
                  size="large"
                  class="status-tag"
                >
                  {{ getStatusText(taskDetail.status) }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="task-header-right">
            <el-button @click="goBack" size="large">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <el-button 
              v-if="props.userRole === 'teacher'" 
              type="primary" 
              size="large"
              @click="editTask"
            >
              <el-icon><Edit /></el-icon>
              编辑任务
            </el-button>
          </div>
        </div>

        <!-- 任务详细内容 -->
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Document /></el-icon>
              <span>任务详情</span>
            </div>
          </template>
          <div class="task-description">
            <div class="description-content" v-html="formatContent(taskDetail.content)"></div>
          </div>
        </el-card>

        <!-- 任务基本信息卡片 - 简化为两个 -->
        <div class="task-info-grid">
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><Clock /></el-icon>
                <span>时间信息</span>
              </div>
            </template>
            <div class="info-item">
              <span class="info-label">发布时间：</span>
              <span class="info-value">{{ formatDateTime(taskDetail.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">截止时间：</span>
              <span class="info-value deadline">{{ formatDateTime(taskDetail.end_time) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">剩余时间：</span>
              <span class="info-value" :class="getTimeLeftClass(taskDetail.end_time)">
                {{ getTimeLeft(taskDetail.end_time) }}
              </span>
            </div>
          </el-card>

          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><DataAnalysis /></el-icon>
                <span>提交统计</span>
              </div>
            </template>
            <div class="info-item">
              <span class="info-label">发布者：</span>
              <span class="info-value">{{ taskDetail.creator_name || '系统' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">已提交：</span>
              <span class="info-value submitted">{{ taskDetail.submitted_students?.length || 0 }}人</span>
            </div>
            <div class="info-item">
              <span class="info-label">提交率：</span>
              <span class="info-value completion-rate">{{ getCompletionRate() }}%</span>
            </div>
          </el-card>
        </div>

        <!-- 提交管理区域（教师可见） -->
        <el-card v-if="props.userRole === 'teacher'" class="submission-management" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><List /></el-icon>
              <span>提交管理</span>
            </div>
          </template>
          
          <el-tabs v-model="activeSubmissionTab" class="submission-tabs">
            <el-tab-pane label="已提交" name="submitted">
              <div v-if="taskDetail.submitted_students?.length > 0" class="student-list">
                <div 
                  v-for="student in taskDetail.submitted_students" 
                  :key="student.id"
                  class="student-item submitted-item"
                >
                  <div class="student-info">
                    <el-avatar :size="40" :src="student.avatar">
                      {{ student.name?.charAt(0) }}
                    </el-avatar>
                    <div class="student-details">
                      <div class="student-name">{{ student.name }}</div>
                      <div class="submission-time">
                        提交时间：{{ formatDateTime(student.submitted_at) }}
                      </div>
                    </div>
                  </div>
                  <div class="student-actions">
                    <el-button type="primary" size="small" @click="viewSubmission(student)">
                      查看提交
                    </el-button>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无提交" />
            </el-tab-pane>
            
            <el-tab-pane label="未提交" name="not-submitted">
              <div v-if="taskDetail.not_submitted_students?.length > 0" class="student-list">
                <div 
                  v-for="student in taskDetail.not_submitted_students" 
                  :key="student.id"
                  class="student-item not-submitted-item"
                >
                  <div class="student-info">
                    <el-avatar :size="40" :src="student.avatar">
                      {{ student.name?.charAt(0) }}
                    </el-avatar>
                    <div class="student-details">
                      <div class="student-name">{{ student.name }}</div>
                      <div class="not-submitted-text">未提交</div>
                    </div>
                  </div>
                  <div class="student-actions">
                    <el-button type="warning" size="small" @click="remindStudent(student)">
                      发送提醒
                    </el-button>
                  </div>
                </div>
              </div>
              <el-empty v-else description="所有学生都已提交" />
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 学生提交区域（学生可见） -->
        <el-card v-if="props.userRole === 'student'" class="student-submission" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Upload /></el-icon>
              <span>我的提交</span>
            </div>
          </template>
          
          <div v-if="mySubmission" class="submission-status submitted">
            <el-result
              icon="success"
              title="已提交"
              :sub-title="`提交时间：${formatDateTime(mySubmission.submitted_at)}`"
            >
              <template #extra>
                <el-button type="primary" @click="viewMySubmission">查看我的提交</el-button>
                <el-button @click="editSubmission">修改提交</el-button>
              </template>
            </el-result>
          </div>
          
          <div v-else class="submission-status not-submitted">
            <el-result
              icon="warning"
              title="尚未提交"
              sub-title="请及时完成任务并提交"
            >
              <template #extra>
                <el-button type="primary" size="large" @click="submitTask">
                  <el-icon><Upload /></el-icon>
                  提交任务
                </el-button>
              </template>
            </el-result>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  User, 
  DataAnalysis, 
  Document, 
  List, 
  Upload 
} from '@element-plus/icons-vue'
import api from '../api'

// 定义 props
const props = defineProps({
  groupId: {
    type: Number,
    required: true
  },
  taskId: {
    type: Number,
    required: true
  },
  userRole: {
    type: String,
    default: 'student'
  }
})

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const error = ref('')
const taskDetail = ref(null)
const groupInfo = ref({})
const activeSubmissionTab = ref('submitted')
const mySubmission = ref(null)

// 计算属性
const getCompletionRate = () => {
  if (!taskDetail.value) return 0
  const submitted = taskDetail.value.submitted_students?.length || 0
  const total = (taskDetail.value.submitted_students?.length || 0) + (taskDetail.value.not_submitted_students?.length || 0)
  return total > 0 ? Math.round((submitted / total) * 100) : 0
}

// 生命周期
onMounted(() => {
  fetchTaskDetail()
  fetchGroupInfo()
})

// 方法
const fetchTaskDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const taskId = props.taskId || route.params.taskId
    const groupId = props.groupId || route.params.groupId
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里应该调用真实的API
    taskDetail.value = {
      id: taskId,
      title: '前端框架学习任务',
      content: '请学习Vue.js框架的基础知识，包括组件化开发、路由管理、状态管理等核心概念。完成后提交学习心得和代码示例。',
      priority: 'high',
      status: 'in_progress',
      created_at: '2024-01-15 09:00:00',
      end_time: '2024-01-25 23:59:59',
      group_name: '前端开发小组',
      creator_name: '张老师',
      submitted_students: [
        { id: 1, name: '张三', avatar: '', submitted_at: '2024-01-20 14:30:00' },
        { id: 2, name: '李四', avatar: '', submitted_at: '2024-01-21 10:15:00' }
      ],
      not_submitted_students: [
        { id: 3, name: '王五', avatar: '' },
        { id: 4, name: '赵六', avatar: '' }
      ]
    }
    
    // 如果是学生，检查是否已提交
    if (props.userRole === 'student') {
      checkMySubmission()
    }
    
  } catch (err) {
    error.value = err.message || '加载任务详情失败'
  } finally {
    loading.value = false
  }
}

const fetchGroupInfo = async () => {
  try {
    const groupId = props.groupId || route.params.groupId
    // 模拟API调用获取小组信息
    groupInfo.value = {
      group_name: '前端开发小组',
      student_count: 6
    }
  } catch (err) {
    console.error('获取小组信息失败:', err)
  }
}

const checkMySubmission = () => {
  // 检查当前学生是否已提交
  const currentUserId = 1 // 从全局状态获取当前用户ID
  mySubmission.value = taskDetail.value.submitted_students?.find(
    student => student.id === currentUserId
  )
}

const goBack = () => {
  router.go(-1)
}

const editTask = () => {
  // 跳转到任务编辑页面或打开编辑弹窗
  ElMessage.info('编辑任务功能开发中...')
}

const viewSubmission = (student) => {
  ElMessage.info(`查看 ${student.name} 的提交内容`)
}

const remindStudent = (student) => {
  ElMessageBox.confirm(
    `确定要向 ${student.name} 发送任务提醒吗？`,
    '发送提醒',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('提醒已发送')
  })
}

const viewMySubmission = () => {
  ElMessage.info('查看我的提交详情')
}

const editSubmission = () => {
  ElMessage.info('修改提交内容')
}

const submitTask = () => {
  ElMessage.info('跳转到任务提交页面')
}

// 工具方法
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content) => {
  if (!content) return ''
  // 简单的内容格式化，将换行转换为<br>
  return content.replace(/\n/g, '<br>')
}

const getPriorityType = (priority) => {
  const typeMap = {
    'urgent': 'danger',
    'high': 'warning',
    'normal': '',
    'low': 'info',
    'unimportant': 'info'
  }
  return typeMap[priority] || ''
}

const getPriorityText = (priority) => {
  const textMap = {
    'urgent': '紧急',
    'high': '高优先级',
    'normal': '普通',
    'low': '低优先级',
    'unimportant': '不重要'
  }
  return textMap[priority] || '普通'
}

const getStatusType = (status) => {
  const typeMap = {
    'in_progress': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return textMap[status] || '未知'
}

const getTimeLeft = (endTime) => {
  if (!endTime) return '无限制'
  
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) {
    return '已逾期'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时`
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes}分钟`
  }
}

const getTimeLeftClass = (endTime) => {
  if (!endTime) return ''
  
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) {
    return 'overdue'
  } else if (diff <= 24 * 60 * 60 * 1000) {
    return 'urgent'
  } else if (diff <= 3 * 24 * 60 * 60 * 1000) {
    return 'warning'
  }
  return 'normal'
}
</script>

<style scoped>
.task-detail-view {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
}

.breadcrumb-container {
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.task-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* 任务头部 */
.task-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.task-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.task-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.priority-tag,
.status-tag {
  font-weight: 600;
}

.task-header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 信息卡片网格 */
.task-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #4a5568;
}

.header-icon {
  font-size: 18px;
  color: #667eea;
}

/* 为不同类型的卡片添加不同的图标颜色 */
.info-card:first-child .header-icon {
  color: #ed8936; /* 时间信息 - 橙色 */
}

.info-card:last-child .header-icon {
  color: #38a169; /* 提交统计 - 绿色 */
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f7fafc;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-weight: 600;
  color: #2d3748;
}

.info-value.deadline {
  color: #e53e3e;
}

.info-value.submitted {
  color: #38a169;
}

.info-value.not-submitted {
  color: #e53e3e;
}

.info-value.completion-rate {
  color: #667eea;
}

.info-value.overdue {
  color: #e53e3e;
  font-weight: 700;
}

.info-value.urgent {
  color: #ed8936;
  font-weight: 700;
}

.info-value.warning {
  color: #ecc94b;
  font-weight: 600;
}

.info-value.normal {
  color: #38a169;
}

/* 内容卡片 */
.content-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
}

.content-card .card-header .header-icon {
  color: #667eea;
}

.description-content {
  line-height: 1.8;
  color: #4a5568;
  font-size: 16px;
  white-space: pre-wrap;
  padding: 8px 0;
  min-height: 80px;
}

/* 提交管理 */
.submission-management,
.student-submission {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.submission-tabs {
  margin-top: 16px;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.student-item:hover {
  background: #edf2f7;
}

.submitted-item {
  border-left: 4px solid #38a169;
}

.not-submitted-item {
  border-left: 4px solid #e53e3e;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name {
  font-weight: 600;
  color: #2d3748;
}

.submission-time {
  font-size: 14px;
  color: #718096;
}

.not-submitted-text {
  font-size: 14px;
  color: #e53e3e;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .task-info-grid {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .task-detail-view {
    padding: 16px;
  }
  
  .task-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .task-title {
    font-size: 24px;
  }
  
  .task-header-right {
    justify-content: flex-end;
  }
  
  .task-info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .student-item {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .student-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .task-detail-view {
    padding: 12px;
  }
  
  .breadcrumb-container {
    padding: 12px 16px;
  }
  
  .task-header {
    padding: 20px;
  }
  
  .task-title {
    font-size: 20px;
  }
}
</style>
