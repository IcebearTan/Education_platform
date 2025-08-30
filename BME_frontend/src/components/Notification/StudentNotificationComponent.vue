<template>
  <div class="student-notification">
    <!-- 统计信息 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ totalMessages }}</div>
              <div class="stats-label">总消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stats-card unread">
            <div class="stats-content">
              <div class="stats-number">{{ totalUnread }}</div>
              <div class="stats-label">未读消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stats-card group-stats">
            <div class="stats-content">
              <div class="stats-number">{{ groupMessages }}</div>
              <div class="stats-label">小组通知</div>
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
          :class="['sidebar-tab-item', { active: activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          <div class="tab-content">
            <el-icon>
              <component :is="typeof tab.icon === 'string' ? tab.icon : tab.icon" />
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
          </div>
        </div>
        
        <!-- 小组通知的子分类横栏 -->
        <div v-if="activeTab === 'group'" class="group-sub-tabs-horizontal">
          <div class="sub-tabs-container">
            <div 
              :class="['sub-tab-item', { active: activeGroupSubTab === 'all' }]"
              @click="switchGroupSubTab('all')"
            >
              <span class="sub-tab-label">全部</span>
              <el-badge 
                v-if="getUnreadCount('group') > 0" 
                :value="getUnreadCount('group')" 
                class="sub-tab-badge"
              />
            </div>
            <div 
              v-for="subTab in groupSubTabs" 
              :key="subTab.key"
              :class="['sub-tab-item', { active: activeGroupSubTab === subTab.key }]"
              @click="switchGroupSubTab(subTab.key)"
            >
              <el-icon class="sub-tab-icon">
                <component :is="typeof subTab.icon === 'string' ? subTab.icon : subTab.icon" />
              </el-icon>
              <span class="sub-tab-label">{{ subTab.label }}</span>
              <el-badge 
                v-if="getGroupSubUnreadCount(subTab.key) > 0" 
                :value="getGroupSubUnreadCount(subTab.key)" 
                class="sub-tab-badge"
              />
            </div>
          </div>
        </div>
        
        <div class="message-content-scrollable">
          <div v-if="isLoading" class="loading-state">
            <el-loading text="加载通知中..." />
          </div>
          
          <div v-else-if="filteredMessages.length === 0" class="empty-state">
            <el-empty 
              :image-size="120"
              :description="`暂无${getCurrentTabLabel}消息`"
            />
          </div>
          
          <div v-else class="message-list">
            <div 
              v-for="message in paginatedMessages" 
              :key="message.id"
              :class="['message-item', { unread: !message.is_read, important: message.is_important }]"
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
                    </div>
                  </div>
                  
                  <div class="message-text">{{ message.content }}</div>
                  
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
                        {{ getNavigationButtonText(message) }}
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
  Bell, Document, User, Star, Setting, Edit, Message
} from '@element-plus/icons-vue'
import api from '../../api'
import { mockNotifications, mockNotificationApiResponses, calculateUnreadCount } from '../../mock/notificationData'
import { mockApiRequest } from '../../mock/config'

// 移除props，直接使用内部状态管理
const notifications = ref({})
const totalUnread = ref(0)
const isLoading = ref(true)

const router = useRouter()
const store = useStore()

const activeTab = ref('all')
const activeGroupSubTab = ref('all') // 小组通知的子分类
const currentPage = ref(1)
const pageSize = 20

// 学生消息分类配置（小组通知、系统通知）
const messageTabs = [
  { key: 'all', label: '全部消息', icon: Bell },
  { key: 'group', label: '小组通知', icon: User },
  { key: 'system', label: '系统通知', icon: 'Setting' }
]

// 小组通知的子分类
const groupSubTabs = [
  { key: 'task', label: '任务发布', icon: Document },
  { key: 'homework', label: '作业批改', icon: 'Edit' },
  { key: 'leave', label: '请假反馈', icon: 'Message' }
]

// 本地存储键名
const ACTIVE_TAB_KEY = 'student-notification-active-tab'

// 计算属性
const allMessages = computed(() => {
  return Object.values(notifications.value).flat().sort((a, b) => 
    new Date(b.create_time) - new Date(a.create_time)
  )
})

const getCurrentMessages = computed(() => {
  if (activeTab.value === 'all') {
    return allMessages.value
  } else if (activeTab.value === 'group') {
    // 小组通知：如果选择了子分类，显示子分类内容；否则显示所有小组通知
    if (activeGroupSubTab.value === 'all') {
      // 返回所有小组相关通知（任务、作业、请假）
      const taskMsgs = notifications.value.task || []
      const homeworkMsgs = notifications.value.homework || []
      const leaveMsgs = notifications.value.leave || []
      return [...taskMsgs, ...homeworkMsgs, ...leaveMsgs].sort((a, b) => 
        new Date(b.create_time) - new Date(a.create_time)
      )
    } else {
      return notifications.value[activeGroupSubTab.value] || []
    }
  } else {
    return notifications.value[activeTab.value] || []
  }
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

const groupMessages = computed(() => {
  const taskMsgs = notifications.value.task || []
  const homeworkMsgs = notifications.value.homework || []
  const leaveMsgs = notifications.value.leave || []
  return taskMsgs.length + homeworkMsgs.length + leaveMsgs.length
})

const systemMessages = computed(() => {
  return (notifications.value.system || []).length
})

// 方法
const switchTab = (tabKey) => {
  activeTab.value = tabKey
  currentPage.value = 1
  
  // 如果切换到小组通知，默认显示全部子分类
  if (tabKey === 'group') {
    activeGroupSubTab.value = 'all'
  }
  
  localStorage.setItem(ACTIVE_TAB_KEY, tabKey)
}

const switchGroupSubTab = (subTabKey) => {
  activeGroupSubTab.value = subTabKey
  currentPage.value = 1
}

const restoreActiveTab = () => {
  const savedTab = localStorage.getItem(ACTIVE_TAB_KEY)
  if (savedTab && messageTabs.some(tab => tab.key === savedTab)) {
    activeTab.value = savedTab
  }
}

const getUnreadCount = (type) => {
  if (type === 'all') {
    return totalUnread.value
  } else if (type === 'group') {
    // 小组通知未读数 = 任务 + 作业 + 请假未读数
    const taskUnread = (notifications.value.task || []).filter(msg => !msg.is_read).length
    const homeworkUnread = (notifications.value.homework || []).filter(msg => !msg.is_read).length
    const leaveUnread = (notifications.value.leave || []).filter(msg => !msg.is_read).length
    return taskUnread + homeworkUnread + leaveUnread
  }
  return notifications.value[type]?.filter(msg => !msg.is_read).length || 0
}

const getGroupSubUnreadCount = (subType) => {
  return notifications.value[subType]?.filter(msg => !msg.is_read).length || 0
}

const getMessageType = (message) => {
  for (const [type, messages] of Object.entries(notifications.value)) {
    if (messages.some(msg => msg.id === message.id)) {
      return type
    }
  }
  return 'other'
}

const getMessageIcon = (type) => {
  const iconComponents = {
    task: Document,
    homework: Edit,
    leave: Message,
    system: Setting
  }
  return iconComponents[type] || Document
}

const getMessageIconColor = (type) => {
  const colors = {
    task: '#409EFF',
    homework: '#67C23A',
    leave: '#E6A23C',
    system: '#909399'
  }
  return colors[type] || '#409EFF'
}

const getMessageTagType = (type) => {
  const tagTypes = {
    task: 'primary',
    homework: 'success',
    leave: 'warning',
    system: 'info'
  }
  return tagTypes[type] || 'primary'
}

const getMessageTypeLabel = (type) => {
  const labels = {
    task: '任务发布',
    homework: '作业批改',
    leave: '请假反馈',
    system: '系统通知'
  }
  return labels[type] || '其他'
}

const handleMessageClick = async (message) => {
  // 点击消息时自动标记为已读
  if (!message.is_read) {
    await markAsRead(message.id)
  }
  
  // 添加视觉反馈
  ElMessage.info('正在跳转...')
  
  // 延迟跳转，让用户看到反馈
  setTimeout(() => {
    handleMessageNavigation(message)
  }, 300)
}

const markAsRead = async (messageId) => {
  try {
    await mockApiRequest(
      // 真实API调用
      () => api.post(`/notification/mark-read`, { messageId }),
      // Mock响应
      () => mockNotificationApiResponses.markAsRead(messageId)
    )
    
    // 更新本地状态
    Object.values(notifications.value).forEach(typeMessages => {
      if (Array.isArray(typeMessages)) {
        const message = typeMessages.find(msg => msg.id === messageId)
        if (message) {
          message.is_read = true
        }
      }
    })
    
    // 重新计算未读数
    totalUnread.value = calculateUnreadCount(notifications.value)
    
    ElMessage.success('标记已读成功')
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

const handleMessageNavigation = async (message) => {
  const { source_type, related_info_id, group_id, task_id, group_name } = message
  
  try {
    if (source_type === '2') { // 任务发布
      // 优先使用消息中的 group_id，如果没有则通过 API 获取
      if (group_id && group_id !== '0') {
        router.push({
          name: 'study-group-details',
          params: { groupId: group_id },
          query: { 
            group_name: group_name || '未知小组',
            taskId: related_info_id,
            tab: 'tasks'
          }
        })
        ElMessage.success('正在跳转到小组任务页面...')
        return
      }
      
      // 如果消息中没有 group_id，则通过 API 获取任务详情
      const taskResponse = await mockApiRequest(
        () => api.get(`/task/detail?id=${related_info_id}`),
        () => mockNotificationApiResponses.getTaskDetail(related_info_id)
      )
      
      if (taskResponse.code === 200 && taskResponse.data) {
        const taskGroupId = taskResponse.data.group_id
        const taskGroupName = taskResponse.data.group_name || '未知小组'
        
        router.push({
          name: 'study-group-details',
          params: { groupId: taskGroupId },
          query: { 
            group_name: taskGroupName,
            taskId: related_info_id,
            tab: 'tasks'
          }
        })
        ElMessage.success('正在跳转到小组任务页面...')
      } else {
        ElMessage.error('无法获取任务详情，跳转到小组列表')
        router.push({ name: 'study-groups' })
      }
    } else if (source_type === '1') { // 作业批改
      // 优先使用消息中的信息
      if (group_id && group_id !== '0' && task_id) {
        router.push({
          name: 'study-group-details',
          params: { groupId: group_id },
          query: { 
            group_name: group_name || '未知小组',
            taskId: task_id,
            homeworkId: related_info_id,
            tab: 'tasks'
          }
        })
        ElMessage.success('正在跳转到作业详情页面...')
        return
      }
      
      // 如果消息中缺少信息，则通过 API 获取作业详情
      const homeworkResponse = await mockApiRequest(
        () => api.get(`/homework/detail?id=${related_info_id}`),
        () => mockNotificationApiResponses.getHomeworkDetail(related_info_id)
      )
      
      if (homeworkResponse.code === 200 && homeworkResponse.data) {
        const homeworkTaskId = homeworkResponse.data.task_id
        const homeworkGroupId = homeworkResponse.data.group_id
        const homeworkGroupName = homeworkResponse.data.group_name || '未知小组'
        
        router.push({
          name: 'study-group-details',
          params: { groupId: homeworkGroupId },
          query: { 
            group_name: homeworkGroupName,
            taskId: homeworkTaskId,
            homeworkId: related_info_id,
            tab: 'tasks'
          }
        })
        ElMessage.success('正在跳转到作业详情页面...')
      } else {
        ElMessage.error('无法获取作业详情，跳转到小组列表')
        router.push({ name: 'study-groups' })
      }
    } else if (source_type === '8') { // 请假反馈
      // 请假反馈：如果有小组信息，跳转到对应小组的请假管理页面
      if (group_id && group_id !== '0') {
        router.push({
          name: 'study-group-details',
          params: { groupId: group_id },
          query: { 
            group_name: group_name || '未知小组',
            tab: 'leave'
          }
        })
        ElMessage.success('正在跳转到小组请假管理页面...')
      } else {
        // 如果没有特定小组信息，跳转到小组列表并高亮请假相关内容
        router.push({ 
          name: 'study-groups',
          query: { highlight: 'leave' }
        })
        ElMessage.success('正在跳转到学习小组页面...')
      }
    } else if (source_type === '9') { // 系统通知
      router.push({ name: 'user-info' })
      ElMessage.success('正在跳转到个人信息页面...')
    } else {
      // 其他类型消息，默认跳转到用户中心
      router.push({ name: 'user-center' })
      ElMessage.info('正在跳转到用户中心...')
    }
  } catch (error) {
    console.error('消息跳转失败:', error)
    ElMessage.error('跳转失败，请稍后重试')
    // 出现错误时跳转到小组列表页面
    router.push({ name: 'study-groups' })
  }
}

const getNavigationButtonText = (message) => {
  const { source_type } = message
  
  switch (source_type) {
    case '2': // 任务发布
      return '查看任务'
    case '1': // 作业批改
      return '查看作业'
    case '8': // 请假反馈
      return '查看请假'
    case '9': // 系统通知
      return '查看详情'
    default:
      return '查看详情'
  }
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

// 加载通知数据
const loadNotifications = async () => {
  try {
    isLoading.value = true
    
    const response = await mockApiRequest(
      // 真实API调用
      async () => {
        const res = await api.get('/notifications')
        return res.data
      },
      // Mock响应
      () => mockNotificationApiResponses.getAllNotifications()
    )
    
    if (response.code === 200) {
      notifications.value = response.data.notifications
      totalUnread.value = response.data.total_unread
      ElMessage.success('通知数据加载成功')
    } else {
      throw new Error('API返回错误')
    }
  } catch (error) {
    console.error('加载通知数据失败:', error)
    ElMessage.error('加载通知数据失败')
    // 出错时使用默认mock数据
    notifications.value = mockNotifications
    totalUnread.value = calculateUnreadCount(mockNotifications)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  restoreActiveTab()
  await loadNotifications()
})
</script>

<style scoped>
.student-notification {
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

.stats-card.group-stats {
  border-left: 4px solid #13C2C2;
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
  width: 240px;
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

/* 右侧小组通知横栏子分类样式 */
.group-sub-tabs-horizontal {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 16px 24px;
}

.sub-tabs-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sub-tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  border: 1px solid #e4e7ed;
  color: #606266;
  font-size: 14px;
  position: relative;
}

.sub-tab-item:hover {
  background: #e8f4ff;
  border-color: #c6e2ff;
  color: #409EFF;
}

.sub-tab-item.active {
  background: #409EFF;
  border-color: #409EFF;
  color: white;
}

.sub-tab-icon {
  font-size: 14px;
}

.sub-tab-label {
  font-weight: 500;
}

.sub-tab-badge {
  margin-left: 4px;
}

.sub-tab-badge :deep(.el-badge__content) {
  position: relative;
  transform: translateX(0);
  background: #f56c6c !important;
  color: white !important;
  border: none !important;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  padding: 0;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
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
  /* 当有横栏子分类时，减少一些高度 */
  max-height: calc(70vh - 120px);
}

.empty-state {
  padding: 60px 0;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
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

.important-mark {
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
    max-height: 200px;
    order: 1;
    background: white;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
    padding: 16px 0;
  }
  
  .sidebar-title {
    padding: 0 16px 12px;
    margin-bottom: 12px;
    font-size: 15px;
  }
  
  .sidebar-tab-item {
    padding: 10px 16px;
    margin: 1px 0;
  }
  
  .tab-content {
    gap: 8px;
  }
  
  .tab-label {
    font-size: 13px;
  }
  
  .message-content-wrapper {
    order: 2;
    min-height: 40vh;
  }
  
  .message-content-header {
    padding: 16px 20px;
  }
  
  .message-content-header h3 {
    font-size: 16px;
  }
  
  .message-content-scrollable {
    padding: 16px 20px;
  }
  
  .message-item {
    padding: 12px 16px;
  }
  
  .message-left {
    gap: 12px;
  }
  
  .message-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .stats-section .el-col {
    margin-bottom: 12px;
  }
}
</style>
