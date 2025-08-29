<template>
  <div class="teacher-notification">
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
          <el-card class="stats-card group-stats">
            <div class="stats-content">
              <div class="stats-number">{{ groupMessages }}</div>
              <div class="stats-label">小组通知</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card management-stats">
            <div class="stats-content">
              <div class="stats-number">{{ managementMessages }}</div>
              <div class="stats-label">小组管理</div>
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
        
        <!-- 小组管理的子分类横栏 -->
        <div v-if="activeTab === 'management'" class="management-sub-tabs-horizontal">
          <div class="sub-tabs-container">
            <div 
              :class="['sub-tab-item', { active: activeManagementSubTab === 'all' }]"
              @click="switchManagementSubTab('all')"
            >
              <span class="sub-tab-label">全部</span>
              <el-badge 
                v-if="getUnreadCount('management') > 0" 
                :value="getUnreadCount('management')" 
                class="sub-tab-badge"
              />
            </div>
            <div 
              v-for="subTab in managementSubTabs" 
              :key="subTab.key"
              :class="['sub-tab-item', { active: activeManagementSubTab === subTab.key }]"
              @click="switchManagementSubTab(subTab.key)"
            >
              <el-icon class="sub-tab-icon">
                <component :is="typeof subTab.icon === 'string' ? subTab.icon : subTab.icon" />
              </el-icon>
              <span class="sub-tab-label">{{ subTab.label }}</span>
              <el-badge 
                v-if="getManagementSubUnreadCount(subTab.key) > 0" 
                :value="getManagementSubUnreadCount(subTab.key)" 
                class="sub-tab-badge"
              />
            </div>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { 
  Bell, Document, User, Star, Setting, Edit, Message, Tools
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

const emit = defineEmits(['mark-read'])

const router = useRouter()
const store = useStore()

const activeTab = ref('all')
const activeGroupSubTab = ref('all') // 小组通知的子分类
const activeManagementSubTab = ref('all') // 小组管理的子分类
const currentPage = ref(1)
const pageSize = 20

// 导师消息分类配置（在学生基础上增加小组管理，移除课程通知）
const messageTabs = [
  { key: 'all', label: '全部消息', icon: Bell },
  { key: 'group', label: '小组通知', icon: User },
  { key: 'management', label: '小组管理', icon: Tools },
  { key: 'system', label: '系统通知', icon: Setting }
]

// 小组通知的子分类
const groupSubTabs = [
  { key: 'task', label: '任务发布', icon: Document },
  { key: 'homework', label: '作业批改', icon: Edit },
  { key: 'leave', label: '请假反馈', icon: Message }
]

// 小组管理的子分类
const managementSubTabs = [
  { key: 'homework-submission', label: '作业提交', icon: Edit },
  { key: 'leave-application', label: '请假申请', icon: Message },
  { key: 'join-application', label: '加入申请', icon: User }
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
  } else if (activeTab.value === 'group') {
    // 小组通知：如果选择了子分类，显示子分类内容；否则显示所有小组通知
    if (activeGroupSubTab.value === 'all') {
      // 返回所有小组相关通知（任务、作业、请假）
      const taskMsgs = props.notifications.task || []
      const homeworkMsgs = props.notifications.homework || []
      const leaveMsgs = props.notifications.leave || []
      return [...taskMsgs, ...homeworkMsgs, ...leaveMsgs].sort((a, b) => 
        new Date(b.create_time) - new Date(a.create_time)
      )
    } else {
      return props.notifications[activeGroupSubTab.value] || []
    }
  } else if (activeTab.value === 'management') {
    // 小组管理：如果选择了子分类，显示子分类内容；否则显示所有管理消息
    if (activeManagementSubTab.value === 'all') {
      // 返回所有管理相关消息（作业提交、请假申请、加入申请）
      const homeworkSubmissionMsgs = props.notifications['homework-submission'] || []
      const leaveApplicationMsgs = props.notifications['leave-application'] || []
      const joinApplicationMsgs = props.notifications['join-application'] || []
      return [...homeworkSubmissionMsgs, ...leaveApplicationMsgs, ...joinApplicationMsgs].sort((a, b) => 
        new Date(b.create_time) - new Date(a.create_time)
      )
    } else {
      return props.notifications[activeManagementSubTab.value] || []
    }
  } else {
    return props.notifications[activeTab.value] || []
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
  const taskMsgs = props.notifications.task || []
  const homeworkMsgs = props.notifications.homework || []
  const leaveMsgs = props.notifications.leave || []
  return taskMsgs.length + homeworkMsgs.length + leaveMsgs.length
})

const managementMessages = computed(() => {
  const homeworkSubmissionMsgs = props.notifications['homework-submission'] || []
  const leaveApplicationMsgs = props.notifications['leave-application'] || []
  const joinApplicationMsgs = props.notifications['join-application'] || []
  return homeworkSubmissionMsgs.length + leaveApplicationMsgs.length + joinApplicationMsgs.length
})

const systemMessages = computed(() => {
  return (props.notifications.system || []).length
})

// 方法
const switchTab = (tabKey) => {
  activeTab.value = tabKey
  currentPage.value = 1
  
  // 如果切换到小组通知，默认显示全部子分类
  if (tabKey === 'group') {
    activeGroupSubTab.value = 'all'
  }
  
  // 如果切换到小组管理，默认显示全部子分类
  if (tabKey === 'management') {
    activeManagementSubTab.value = 'all'
  }
  
  localStorage.setItem(ACTIVE_TAB_KEY, tabKey)
}

const switchGroupSubTab = (subTabKey) => {
  activeGroupSubTab.value = subTabKey
  currentPage.value = 1
}

const switchManagementSubTab = (subTabKey) => {
  activeManagementSubTab.value = subTabKey
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
    return props.totalUnread
  } else if (type === 'group') {
    // 小组通知未读数 = 任务 + 作业 + 请假未读数
    const taskUnread = (props.notifications.task || []).filter(msg => !msg.is_read).length
    const homeworkUnread = (props.notifications.homework || []).filter(msg => !msg.is_read).length
    const leaveUnread = (props.notifications.leave || []).filter(msg => !msg.is_read).length
    return taskUnread + homeworkUnread + leaveUnread
  } else if (type === 'management') {
    // 小组管理未读数 = 作业提交 + 请假申请 + 加入申请未读数
    const homeworkSubmissionUnread = (props.notifications['homework-submission'] || []).filter(msg => !msg.is_read).length
    const leaveApplicationUnread = (props.notifications['leave-application'] || []).filter(msg => !msg.is_read).length
    const joinApplicationUnread = (props.notifications['join-application'] || []).filter(msg => !msg.is_read).length
    return homeworkSubmissionUnread + leaveApplicationUnread + joinApplicationUnread
  }
  return props.notifications[type]?.filter(msg => !msg.is_read).length || 0
}

const getGroupSubUnreadCount = (subType) => {
  return props.notifications[subType]?.filter(msg => !msg.is_read).length || 0
}

const getManagementSubUnreadCount = (subType) => {
  return props.notifications[subType]?.filter(msg => !msg.is_read).length || 0
}

const getMessageType = (message) => {
  for (const [type, messages] of Object.entries(props.notifications)) {
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
    management: Tools,
    system: Setting
  }
  return iconComponents[type] || Document
}

const getMessageIconColor = (type) => {
  const colors = {
    task: '#409EFF',
    homework: '#67C23A',
    leave: '#E6A23C',
    management: '#722ED1',
    system: '#909399'
  }
  return colors[type] || '#409EFF'
}

const getMessageTagType = (type) => {
  const tagTypes = {
    task: 'primary',
    homework: 'success',
    leave: 'warning',
    management: '',
    system: 'info'
  }
  return tagTypes[type] || 'primary'
}

const getMessageTypeLabel = (type) => {
  const labels = {
    task: '任务发布',
    homework: '作业批改',
    leave: '请假反馈',
    management: '小组管理',
    system: '系统通知'
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
  
  if (source_type === '2') { // 任务发布
    try {
      const taskResponse = await api.get(`/task/detail?id=${related_info_id}`)
      if (taskResponse.data.code === 200) {
        const groupId = taskResponse.data.data.group_id
        const groupName = taskResponse.data.data.group_name || '未知小组'
        
        // 导师跳转到教学管理页面
        router.push({
          name: 'TeachingGroupDetails',
          params: { groupId: groupId },
          query: { 
            group_name: groupName,
            taskId: related_info_id,
            tab: 'tasks'
          }
        })
      } else {
        ElMessage.error('无法获取任务详情')
        router.push('/user-center/teaching-management')
      }
    } catch (error) {
      console.error('获取任务详情失败:', error)
      router.push('/user-center/teaching-management')
    }
  } else if (source_type === '1') { // 作业批改
    try {
      const homeworkResponse = await api.get(`/homework/detail?id=${related_info_id}`)
      if (homeworkResponse.data.code === 200) {
        const taskId = homeworkResponse.data.data.task_id
        const groupId = homeworkResponse.data.data.group_id
        const groupName = homeworkResponse.data.data.group_name || '未知小组'
        
        router.push({
          name: 'TeachingGroupDetails',
          params: { groupId: groupId },
          query: { 
            group_name: groupName,
            taskId: taskId,
            homeworkId: related_info_id,
            tab: 'tasks'
          }
        })
      } else {
        ElMessage.error('无法获取作业详情')
        router.push('/user-center/teaching-management')
      }
    } catch (error) {
      console.error('获取作业详情失败:', error)
      router.push('/user-center/teaching-management')
    }
  } else if (source_type === '8') { // 请假反馈
    router.push('/user-center/teaching-management?tab=leave')
  } else if (source_type === '10') { // 小组管理
    router.push('/user-center/teaching-management')
  } else if (source_type === '9') { // 系统通知
    router.push('/user-center/user-info')
  } else {
    router.push('/user-center')
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

.stats-card.group-stats {
  border-left: 4px solid #13C2C2;
}

.stats-card.management-stats {
  border-left: 4px solid #722ED1;
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

.sidebar-tab-badge :deep(.el-badge__content) {
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

/* 右侧小组通知横栏子分类样式 */
.group-sub-tabs-horizontal {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 16px 24px;
}

/* 右侧小组管理横栏子分类样式 */
.management-sub-tabs-horizontal {
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
  max-height: calc(70vh - 120px);
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
