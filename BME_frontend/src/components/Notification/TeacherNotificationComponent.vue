<template>
  <div class="teacher-notification">
    <!-- 统计信息 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ totalMessages }}</div>
              <div class="stats-label">总消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stats-card unread">
            <div class="stats-content">
              <div class="stats-number">{{ totalUnread }}</div>
              <div class="stats-label">未读消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stats-card today">
            <div class="stats-content">
              <div class="stats-number">{{ todayMessages }}</div>
              <div class="stats-label">今日消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stats-card important">
            <div class="stats-content">
              <div class="stats-number">{{ importantMessages }}</div>
              <div class="stats-label">重要消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stats-card teaching">
            <div class="stats-content">
              <div class="stats-number">{{ teachingMessages }}</div>
              <div class="stats-label">教学消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stats-card management">
            <div class="stats-content">
              <div class="stats-number">{{ managementMessages }}</div>
              <div class="stats-label">管理消息</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 消息分类和内容区域 -->
    <div class="message-main-container">
      <!-- 左侧分类栏 -->
      <div class="sidebar-tabs">
        <div class="sidebar-title">消息分类</div>
        <div 
          v-for="tab in messageTabs" 
          :key="tab.key"
          :class="['sidebar-tab-item', { active: activeTab === tab.key }, tab.category]"
          @click="switchTab(tab.key)"
        >
          <div class="tab-content">
            <el-icon>
              <component :is="tab.icon" />
            </el-icon>
            <span class="tab-label">{{ tab.label }}</span>
          </div>
          <el-badge 
            v-if="getUnreadCount(tab.key) > 0" 
            :value="getUnreadCount(tab.key)" 
            class="sidebar-tab-badge"
          />
        </div>
      </div>
      
      <!-- 右侧消息内容区域 -->
      <div class="message-content-wrapper">
        <div class="message-content-header">
          <h3>{{ getCurrentTabLabel }}</h3>
          <div class="content-actions">
            <span class="message-count">共 {{ filteredMessages.length }} 条消息</span>
            <el-button 
              v-if="isTeachingTab && filteredMessages.length > 0"
              type="primary" 
              size="small"
              @click="handleTeachingBulkActions"
            >
              批量处理
            </el-button>
          </div>
        </div>
        
        <div class="message-content-scrollable">
          <div v-if="filteredMessages.length === 0" class="empty-state">
            <el-empty 
              :image-size="120"
              :description="`暂无${getCurrentTabLabel}消息`"
            />
          </div>
          
          <div v-else class="message-list">
            <div 
              v-for="message in paginatedMessages" 
              :key="message.id"
              :class="['message-item', { 
                unread: !message.is_read, 
                important: message.is_important,
                teaching: isTeachingMessage(message),
                urgent: message.priority === 'high'
              }]"
              @click="handleMessageClick(message)"
            >
              <div class="message-left">
                <div class="message-icon">
                  <el-icon :color="getMessageIconColor(getMessageType(message))">
                    <component :is="getMessageIcon(getMessageType(message))" />
                  </el-icon>
                </div>
                
                <div class="message-details">
                  <div class="message-header">
                    <div class="message-title">{{ message.title }}</div>
                    <div class="message-meta">
                      <el-tag 
                        :type="getMessageTagType(getMessageType(message))" 
                        size="small"
                      >
                        {{ getMessageTypeLabel(getMessageType(message)) }}
                      </el-tag>
                      <span v-if="message.is_important" class="important-mark">
                        <el-icon color="#F56C6C"><Star /></el-icon>
                      </span>
                      <span v-if="isTeachingMessage(message)" class="teaching-mark">
                        <el-tag type="warning" size="small">教学</el-tag>
                      </span>
                    </div>
                  </div>
                  
                  <div class="message-text">{{ message.content }}</div>
                  
                  <!-- 教学相关消息的额外信息 -->
                  <div v-if="isTeachingMessage(message)" class="teaching-info">
                    <div class="teaching-details">
                      <span v-if="message.group_name" class="group-info">
                        <el-icon><UserFilled /></el-icon>
                        {{ message.group_name }}
                      </span>
                      <span v-if="message.student_count" class="student-count">
                        涉及学生：{{ message.student_count }}人
                      </span>
                    </div>
                  </div>
                  
                  <div class="message-footer">
                    <span class="message-time">{{ formatTime(message.create_time) }}</span>
                    <div class="message-actions">
                      <el-button 
                        v-if="!message.is_read" 
                        text 
                        size="small" 
                        @click.stop="markAsRead(message.id)"
                      >
                        标记已读
                      </el-button>
                      <el-button 
                        text 
                        size="small" 
                        @click.stop="handleMessageNavigation(message)"
                      >
                        {{ isTeachingMessage(message) ? '管理' : '查看详情' }}
                      </el-button>
                      <el-button 
                        v-if="isTeachingMessage(message)"
                        text 
                        size="small" 
                        type="primary"
                        @click.stop="handleQuickReply(message)"
                      >
                        快速回复
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="!message.is_read" class="unread-indicator"></div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="filteredMessages.length > pageSize" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredMessages.length"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { 
  Bell, Document, User, Warning, InfoFilled, Notification, Star,
  UserFilled, Setting, Monitor, DataAnalysis
} from '@element-plus/icons-vue'
import api from '../../api'

const props = defineProps({
  notifications: {
    type: Object,
    default: () => ({})
  },
  totalUnread: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['mark-read', 'mark-all-read', 'refresh', 'quick-reply'])

const router = useRouter()
const store = useStore()

const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = 20

// 导师消息分类配置（包含教学管理相关）
const messageTabs = [
  { key: 'all', label: '全部消息', icon: Bell, category: 'general' },
  { key: 'task', label: '任务', icon: Document, category: 'general' },
  { key: 'homework', label: '作业', icon: Document, category: 'general' },
  { key: 'notice', label: '通知', icon: Notification, category: 'general' },
  { key: 'leave', label: '请假', icon: User, category: 'general' },
  { key: 'teaching', label: '教学管理', icon: Monitor, category: 'teaching' },
  { key: 'student_management', label: '学生管理', icon: UserFilled, category: 'teaching' },
  { key: 'analytics', label: '数据分析', icon: DataAnalysis, category: 'teaching' },
  { key: 'system', label: '系统设置', icon: Setting, category: 'teaching' },
  { key: 'error', label: '错误', icon: Warning, category: 'general' },
  { key: 'other', label: '其他', icon: InfoFilled, category: 'general' }
]

// 本地存储键名
const ACTIVE_TAB_KEY = 'teacher-notification-active-tab'

// 计算属性
const allMessages = computed(() => {
  return Object.values(props.notifications).flat().sort((a, b) => 
    new Date(b.create_time) - new Date(a.create_time)
  )
})

const getCurrentMessages = computed(() => {
  if (activeTab.value === 'all') {
    return allMessages.value
  }
  return props.notifications[activeTab.value] || []
})

const getCurrentTabLabel = computed(() => {
  const tab = messageTabs.find(t => t.key === activeTab.value)
  return tab ? tab.label : ''
})

const filteredMessages = computed(() => {
  return getCurrentMessages.value
})

const paginatedMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredMessages.value.slice(start, end)
})

const totalMessages = computed(() => allMessages.value.length)

const todayMessages = computed(() => {
  const today = new Date().toDateString()
  return allMessages.value.filter(msg => 
    new Date(msg.create_time).toDateString() === today
  ).length
})

const importantMessages = computed(() => {
  return allMessages.value.filter(msg => msg.is_important).length
})

const teachingMessages = computed(() => {
  return allMessages.value.filter(msg => isTeachingMessage(msg)).length
})

const managementMessages = computed(() => {
  const managementTypes = ['student_management', 'system', 'analytics']
  return allMessages.value.filter(msg => 
    managementTypes.includes(getMessageType(msg))
  ).length
})

const isTeachingTab = computed(() => {
  const teachingTabs = ['teaching', 'student_management', 'analytics', 'system']
  return teachingTabs.includes(activeTab.value)
})

// 方法
const switchTab = (tabKey) => {
  activeTab.value = tabKey
  currentPage.value = 1
  localStorage.setItem(ACTIVE_TAB_KEY, tabKey)
}

const restoreActiveTab = () => {
  const savedTab = localStorage.getItem(ACTIVE_TAB_KEY)
  if (savedTab && messageTabs.some(tab => tab.key === savedTab)) {
    activeTab.value = savedTab
  }
}

const getUnreadCount = (type) => {
  if (type === 'all') {
    return props.totalUnread
  }
  return props.notifications[type]?.filter(msg => !msg.is_read).length || 0
}

const getMessageType = (message) => {
  for (const [type, messages] of Object.entries(props.notifications)) {
    if (messages.some(msg => msg.id === message.id)) {
      return type
    }
  }
  return 'other'
}

const isTeachingMessage = (message) => {
  const teachingTypes = ['teaching', 'student_management', 'analytics', 'system']
  return teachingTypes.includes(getMessageType(message)) || message.category === 'teaching'
}

const getMessageIcon = (type) => {
  const iconComponents = {
    task: Document,
    homework: Document, 
    notice: Notification,
    leave: User,
    teaching: Monitor,
    student_management: UserFilled,
    analytics: DataAnalysis,
    system: Setting,
    error: Warning,
    other: InfoFilled
  }
  return iconComponents[type] || InfoFilled
}

const getMessageIconColor = (type) => {
  const colors = {
    task: '#409EFF',
    homework: '#67C23A',
    notice: '#E6A23C',
    leave: '#F56C6C',
    teaching: '#8B5CF6',
    student_management: '#06B6D4',
    analytics: '#10B981',
    system: '#6B7280',
    error: '#F56C6C',
    other: '#909399'
  }
  return colors[type] || '#909399'
}

const getMessageTagType = (type) => {
  const tagTypes = {
    task: 'primary',
    homework: 'success',
    notice: 'warning',
    leave: 'danger',
    teaching: '',
    student_management: 'info',
    analytics: 'success',
    system: '',
    error: 'danger',
    other: 'info'
  }
  return tagTypes[type] || 'info'
}

const getMessageTypeLabel = (type) => {
  const labels = {
    task: '任务',
    homework: '作业',
    notice: '通知',
    leave: '请假',
    teaching: '教学',
    student_management: '学生管理',
    analytics: '数据分析',
    system: '系统',
    error: '错误',
    other: '其他'
  }
  return labels[type] || '其他'
}

const handleMessageClick = async (message) => {
  await markAsRead(message.id)
  handleMessageNavigation(message)
}

const markAsRead = async (messageId) => {
  emit('mark-read', messageId)
}

const handleMessageNavigation = async (message) => {
  const { source_type, related_info_id } = message
  
  if (source_type === '2') { // 任务相关
    try {
      const taskResponse = await api.get(`/task/detail?id=${related_info_id}`)
      if (taskResponse.data.code === 200) {
        const groupId = taskResponse.data.data.group_id
        const groupName = taskResponse.data.data.group_name || '未知小组'
        
        // 判断用户在该小组中的身份，决定跳转到哪个视角
        const userRole = await determineUserRoleInGroup(groupId)
        
        if (userRole === 'teacher') {
          // 跳转到教学管理详情页面
          router.push({
            name: 'TeachingGroupDetails',
            params: { id: groupId },
            query: { 
              group_name: groupName,
              taskId: related_info_id,
              tab: 'tasks'
            }
          })
        } else {
          // 跳转到学习小组详情页面
          router.push({
            name: 'StudyGroupDetails',
            params: { id: groupId },
            query: { 
              group_name: groupName,
              taskId: related_info_id,
              tab: 'tasks'
            }
          })
        }
      } else {
        ElMessage.error('无法获取任务详情')
        router.push('/user-center/study-groups')
      }
    } catch (error) {
      console.error('获取任务详情失败:', error)
      router.push('/user-center/study-groups')
    }
  } else if (source_type === '1') { // 作业相关
    try {
      const homeworkResponse = await api.get(`/homework/detail?id=${related_info_id}`)
      if (homeworkResponse.data.code === 200) {
        const taskId = homeworkResponse.data.data.task_id
        const groupId = homeworkResponse.data.data.group_id
        const groupName = homeworkResponse.data.data.group_name || '未知小组'
        
        const userRole = await determineUserRoleInGroup(groupId)
        
        if (userRole === 'teacher') {
          router.push({
            name: 'TeachingGroupDetails',
            params: { id: groupId },
            query: { 
              group_name: groupName,
              taskId: taskId,
              homeworkId: related_info_id,
              tab: 'tasks'
            }
          })
        } else {
          router.push({
            name: 'StudyGroupDetails',
            params: { id: groupId },
            query: { 
              group_name: groupName,
              taskId: taskId,
              homeworkId: related_info_id,
              tab: 'tasks'
            }
          })
        }
      } else {
        ElMessage.error('无法获取作业详情')
        router.push('/user-center/study-groups')
      }
    } catch (error) {
      console.error('获取作业详情失败:', error)
      router.push('/user-center/study-groups')
    }
  } else if (source_type === '3') { // 通知相关
    router.push(`/notifications?type=notice&id=${related_info_id}`)
  } else if (isTeachingMessage(message)) {
    // 教学管理相关消息跳转到教学管理页面
    router.push('/user-center/teaching-management')
  } else {
    router.push('/user-center')
  }
}

// 判断用户在指定小组中的身份
const determineUserRoleInGroup = async (groupId) => {
  try {
    const response = await api.get('/user/group')
    if (response.data.code === 200) {
      const currentUserId = store.state.user?.User_Id
      if (!currentUserId) return 'student'
      
      const targetGroupId = parseInt(groupId)
      
      const allGroups = [
        ...(response.data.project_group || []),
        ...(response.data.study_group || [])
      ]
      
      const targetGroup = allGroups.find(group => group.group_id === targetGroupId)
      
      if (targetGroup && targetGroup.teacher_id === parseInt(currentUserId)) {
        return 'teacher'
      }
      
      return 'student'
    }
  } catch (error) {
    console.error('判断用户角色失败:', error)
  }
  
  return 'student'
}

const handleTeachingBulkActions = () => {
  // 批量处理教学消息的逻辑
  ElMessage.info('批量处理功能开发中...')
}

const handleQuickReply = (message) => {
  emit('quick-reply', message)
}

const formatTime = (timeStr) => {
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now - time
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const minutes = Math.floor(diff / (60 * 1000))
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(() => {
  restoreActiveTab()
})
</script>

<style scoped>
.teacher-notification {
  width: 100%;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stats-card.unread {
  border-left: 4px solid #409EFF;
}

.stats-card.today {
  border-left: 4px solid #67C23A;
}

.stats-card.important {
  border-left: 4px solid #F56C6C;
}

.stats-card.teaching {
  border-left: 4px solid #8B5CF6;
}

.stats-card.management {
  border-left: 4px solid #06B6D4;
}

.stats-content {
  padding: 20px;
}

.stats-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stats-label {
  color: #606266;
  font-size: 14px;
}

/* 主容器布局 */
.message-main-container {
  display: flex;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 70vh;
  min-height: 500px;
  overflow: hidden;
}

/* 左侧分类栏 */
.sidebar-tabs {
  width: 260px;
  flex-shrink: 0;
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding: 0 20px 16px;
  margin-bottom: 6px;
}

.sidebar-tab-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  border-left: 3px solid transparent;
  margin: 2px 0;
}

.sidebar-tab-item:hover {
  background-color: #e8f4ff;
  color: #409EFF;
}

.sidebar-tab-item.active {
  background-color: #e8f4ff;
  color: #409EFF;
  border-left-color: #409EFF;
  font-weight: 600;
}

/* 教学相关分类的特殊样式 */
.sidebar-tab-item.teaching:hover {
  background-color: #f3f0ff;
  color: #8B5CF6;
}

.sidebar-tab-item.teaching.active {
  background-color: #f3f0ff;
  color: #8B5CF6;
  border-left-color: #8B5CF6;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.tab-label {
  font-size: 14px;
}

.sidebar-tab-badge {
  margin-left: 8px;
}

/* 右侧消息内容区域 */
.message-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
  flex-shrink: 0;
}

.message-content-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.content-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.message-count {
  color: #909399;
  font-size: 14px;
}

.message-content-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #fafafa;
}

.empty-state {
  padding: 60px 0;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.message-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.message-item.unread {
  border-left: 4px solid #409EFF;
  background: linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%);
}

.message-item.important {
  border-left: 4px solid #F56C6C;
}

.message-item.teaching {
  border-left: 4px solid #8B5CF6;
  background: linear-gradient(90deg, #f9f7ff 0%, #ffffff 100%);
}

.message-item.urgent {
  box-shadow: 0 0 0 2px #F56C6C;
  animation: urgentPulse 2s infinite;
}

@keyframes urgentPulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.5); }
  50% { box-shadow: 0 0 0 4px rgba(245, 108, 108, 0.3); }
}

.message-left {
  display: flex;
  gap: 16px;
  flex: 1;
}

.message-icon {
  margin-top: 4px;
}

.message-details {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.message-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
  line-height: 1.4;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.important-mark,
.teaching-mark {
  display: flex;
  align-items: center;
}

.message-text {
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.teaching-info {
  background: #f9f7ff;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid #8B5CF6;
}

.teaching-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.group-info,
.student-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-time {
  color: #909399;
  font-size: 12px;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: #409EFF;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .message-main-container {
    flex-direction: column;
    height: auto;
    min-height: 60vh;
  }
  
  .sidebar-tabs {
    width: 100%;
    max-height: 250px;
    order: 1;
    background: white;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
    padding: 16px 0;
  }
  
  .stats-section .el-col {
    margin-bottom: 12px;
  }
}
</style>
