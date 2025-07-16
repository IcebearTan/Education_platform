<template>
  <div class="notification-view" :class="{ loading: loading }">
    <!-- 顶部菜单 -->
    <div class="notification-menu-wrapper">
      <MenuComponent />
    </div>
    
    <div class="notification-container">
      <div class="notification-header">
        <h1>消息中心</h1>
        <div class="header-actions">
          <el-button type="primary" @click="markAllAsRead" v-if="totalUnread > 0">
            <el-icon><Check /></el-icon>
            全部已读
          </el-button>
          <el-button @click="refreshMessages">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stats-card">
              <div class="stats-content">
                <div class="stats-number">{{ totalMessages }}</div>
                <div class="stats-label">总消息</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card unread">
              <div class="stats-content">
                <div class="stats-number">{{ totalUnread }}</div>
                <div class="stats-label">未读消息</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card today">
              <div class="stats-content">
                <div class="stats-number">{{ todayMessages }}</div>
                <div class="stats-label">今日消息</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card important">
              <div class="stats-content">
                <div class="stats-number">{{ importantMessages }}</div>
                <div class="stats-label">重要消息</div>
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
                          查看详情
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { 
  Bell, Document, User, Warning, InfoFilled, Notification, 
  Check, Refresh, Search, Star 
} from '@element-plus/icons-vue'
import api from '../api'
import MenuComponent from '../components/MenuComponent.vue'

const router = useRouter()
const store = useStore()

// 响应式数据
const activeTab = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = 20

const notifications = ref({
  task: [],
  homework: [],
  leave: [],
  notice: [],
  error: [],
  other: []
})

const totalUnread = ref(0)
const loading = ref(false)

// 本地存储键名
const ACTIVE_TAB_KEY = 'notification-active-tab'

// 消息分类配置
const messageTabs = [
  { key: 'all', label: '全部消息', icon: Bell },
  { key: 'task', label: '任务', icon: Document },
  { key: 'homework', label: '作业', icon: Document },
  { key: 'notice', label: '通知', icon: Notification },
  { key: 'leave', label: '请假', icon: User },
  { key: 'error', label: '错误', icon: Warning },
  { key: 'other', label: '其他', icon: InfoFilled }
]

// 计算属性
const allMessages = computed(() => {
  return Object.values(notifications.value).flat().sort((a, b) => 
    new Date(b.create_time) - new Date(a.create_time)
  )
})

const getCurrentMessages = computed(() => {
  if (activeTab.value === 'all') {
    return allMessages.value
  }
  return notifications.value[activeTab.value] || []
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

// 方法
const switchTab = (tabKey) => {
  activeTab.value = tabKey
  currentPage.value = 1 // 切换分类时重置页码
  // 保存当前选择的分类到本地存储
  localStorage.setItem(ACTIVE_TAB_KEY, tabKey)
}

// 从本地存储恢复分类状态
const restoreActiveTab = () => {
  const savedTab = localStorage.getItem(ACTIVE_TAB_KEY)
  if (savedTab && messageTabs.some(tab => tab.key === savedTab)) {
    activeTab.value = savedTab
  }
}

const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await api.get('/information/reminder/query')
    if (response.data.code === 200) {
      notifications.value = response.data.data.reminders
      totalUnread.value = response.data.data.total_unread
    }
  } catch (error) {
    console.error('获取消息失败:', error)
    ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
  }
}

const refreshMessages = () => {
  fetchNotifications()
  ElMessage.success('消息已刷新')
}

const getUnreadCount = (type) => {
  if (type === 'all') {
    return totalUnread.value
  }
  return notifications.value[type]?.filter(msg => !msg.is_read).length || 0
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
    homework: Document, 
    notice: Notification,
    leave: User,
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
    error: '错误',
    other: '其他'
  }
  return labels[type] || '其他'
}

const handleMessageClick = async (message) => {
  // 先标记为已读
  await markAsRead(message.id)
  // 然后进行跳转
  handleMessageNavigation(message)
}

const markAsRead = async (messageId) => {
  try {
    await api.post('/information/reminder/read', { id: messageId })
    // 更新本地状态
    Object.values(notifications.value).forEach(msgList => {
      const msg = msgList.find(m => m.id === messageId)
      if (msg) {
        msg.is_read = true
        totalUnread.value = Math.max(0, totalUnread.value - 1)
      }
    })
    ElMessage.success('已标记为已读')
  } catch (error) {
    console.error('标记消息已读失败:', error)
    ElMessage.error('操作失败')
  }
}

const markAllAsRead = async () => {
  try {
    await api.post('/information/reminder/read_all')
    // 更新本地状态
    Object.values(notifications.value).forEach(msgList => {
      msgList.forEach(msg => msg.is_read = true)
    })
    totalUnread.value = 0
    ElMessage.success('已标记全部消息为已读')
  } catch (error) {
    console.error('全部标记已读失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleMessageNavigation = async (message) => {
  const { source_type, related_info_id } = message
  
  if (source_type === '2') { // 任务相关
    try {
      // 通过任务ID获取对应的小组ID
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
        // 默认跳转到我的小组
        router.push('/user-center/study-groups')
      }
    } catch (error) {
      console.error('获取任务详情失败:', error)
      router.push('/user-center/study-groups')
    }
  } else if (source_type === '1') { // 作业相关
    try {
      // 通过作业ID获取对应的任务和小组信息
      const homeworkResponse = await api.get(`/homework/detail?id=${related_info_id}`)
      if (homeworkResponse.data.code === 200) {
        const taskId = homeworkResponse.data.data.task_id
        const groupId = homeworkResponse.data.data.group_id
        const groupName = homeworkResponse.data.data.group_name || '未知小组'
        
        // 判断用户在该小组中的身份
        const userRole = await determineUserRoleInGroup(groupId)
        
        if (userRole === 'teacher') {
          // 跳转到教学管理详情页面
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
          // 跳转到学习小组详情页面
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
    // 跳转到通知分类
    router.push(`/notifications?type=notice&id=${related_info_id}`)
  } else {
    // 其他类型默认跳转到用户中心
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
      
      // 在所有小组中查找目标小组
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
  
  return 'student' // 默认返回学生身份
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

// 定时刷新消息
let refreshTimer = null

onMounted(() => {
  // 恢复保存的分类状态
  restoreActiveTab()
  
  // 页面加载时添加loading状态
  loading.value = true
  
  fetchNotifications().finally(() => {
    // 确保有最小加载时间，避免闪烁
    setTimeout(() => {
      loading.value = false
    }, 200)
  })
  
  // 每30秒刷新一次消息
  refreshTimer = setInterval(fetchNotifications, 30000)
  
  // 监听窗口大小变化，防止滚动条变化导致的闪烁
  const handleResize = () => {
    // 防抖处理
    clearTimeout(window.resizeTimer)
    window.resizeTimer = setTimeout(() => {
      // 可以在这里添加窗口大小变化后的处理逻辑
    }, 100)
  }
  
  window.addEventListener('resize', handleResize)
  
  // 清理函数
  const cleanup = () => {
    window.removeEventListener('resize', handleResize)
    if (window.resizeTimer) {
      clearTimeout(window.resizeTimer)
    }
  }
  
  // 保存清理函数供onUnmounted使用
  window.__notificationCleanup = cleanup
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 执行清理函数
  if (window.__notificationCleanup) {
    window.__notificationCleanup()
    delete window.__notificationCleanup
  }
})
</script>

<style scoped>
/* 全局滚动条样式优化，防止闪烁 */
html {
  overflow-y: scroll; /* 始终显示垂直滚动条 */
}

.notification-view {
  min-height: 100vh;
  background-color: #f5f7fa;
  /* 防止内容加载时的闪烁 */
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

/* 页面加载时的过渡效果 */
.notification-view.loading {
  opacity: 0.8;
}

.notification-menu-wrapper {
  background: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: center;
  padding: 0;
  /* 固定高度，防止菜单加载时的跳动 */
  min-height: 60px;
}

.notification-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  /* 防止内容宽度变化导致的闪烁 */
  width: calc(100% - 40px);
  box-sizing: border-box;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px 32px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  /* 防止内容加载时的高度跳动 */
  min-height: 80px;
  box-sizing: border-box;
}

.notification-header h1 {
  margin: 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
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
  height: 70vh; /* 固定高度，避免页面滚动条 */
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
  /* border-bottom: 1px solid #e4e7ed; */
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

/* 移除原有的独立样式，保持消息项样式不变 */
.filter-section {
  /* 这些样式已被新布局替代 */
  display: none;
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
  .notification-view {
    padding: 16px;
  }
  
  .notification-container {
    width: calc(100% - 32px);
    padding: 16px;
  }
  
  .notification-header {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    min-height: 120px;
  }
  
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

/* 防止滚动条导致的布局偏移 */
body {
  overflow-x: hidden;
}

/* 优化滚动性能 */
.notification-view * {
  -webkit-overflow-scrolling: touch;
}

/* 自定义滚动条样式 */
.sidebar-tabs::-webkit-scrollbar,
.message-content-scrollable::-webkit-scrollbar {
  width: 6px;
}

.sidebar-tabs::-webkit-scrollbar-track,
.message-content-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar-tabs::-webkit-scrollbar-thumb,
.message-content-scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar-tabs::-webkit-scrollbar-thumb:hover,
.message-content-scrollable::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 防止字体加载导致的布局跳动 */
.notification-header h1,
.stats-number,
.message-title,
.sidebar-title,
.message-content-header h3 {
  font-display: swap;
}
</style>
