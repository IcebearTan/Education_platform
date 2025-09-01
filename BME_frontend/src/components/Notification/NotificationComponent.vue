<template>
  <div 
    class="notification-container"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 消息图标和未读数量徽章 -->
    <div class="notification-trigger">
      <el-icon :size="20" class="notification-icon">
        <Bell />
      </el-icon>
      <el-badge 
        v-if="totalUnread > 0" 
        :value="totalUnread > 99 ? '99+' : totalUnread" 
        class="notification-badge"
      />
    </div>

    <!-- 悬停时显示的消息面板 -->
    <div v-if="isHoverVisible" class="notification-hover-panel">
      <!-- 消息分类 -->
      <div class="message-categories">
        <div 
          v-for="tab in messageTabs" 
          :key="tab.key"
          class="category-item"
          @click="handleCategoryClick(tab.key)"
        >
          <div class="category-icon">
            <el-icon :color="tab.color" :size="14">
              <component :is="tab.icon" />
            </el-icon>
          </div>
          <div class="category-info">
            <span class="category-label">{{ tab.label }}</span>
            <el-badge 
              v-if="getUnreadCount(tab.key) > 0" 
              :value="getUnreadCount(tab.key)" 
              class="category-badge"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, User, Tools, Setting } from '@element-plus/icons-vue'
import api from '../../api'

const router = useRouter()

// 定义 props
const props = defineProps({
  showHover: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const notifications = ref({
  'group-notification': [
    { id: 1, title: '小组任务更新', is_read: false },
    { id: 2, title: '新的作业发布', is_read: false },
    { id: 3, title: '小组讨论回复', is_read: true }
  ],
  'group-management': [
    { id: 4, title: '学生提交申请', is_read: false }
  ],
  'system-notification': [
    { id: 5, title: '系统维护通知', is_read: false },
    { id: 6, title: '功能更新', is_read: true }
  ]
})

const totalUnread = ref(0)

// 内部悬停状态管理
const internalHover = ref(false)

// 获取当前用户角色
const getCurrentUserRole = () => {
  try {
    const myAppDataString = localStorage.getItem('my-app')
    if (!myAppDataString) return 'student'
    
    const myAppData = JSON.parse(myAppDataString)
    const user = myAppData.user
    
    // 检查用户角色 - 扩展检查逻辑以适应不同的数据结构
    if (user && (
      user.role === 'teacher' || 
      user.user_type === 'teacher' || 
      user.isTeacher || 
      user.User_Mode === 'admin'
    )) {
      return 'teacher'
    }
    
    return 'student'
  } catch (error) {
    console.error('获取用户角色失败:', error)
    return 'student'
  }
}

const userRole = ref(getCurrentUserRole())

// 根据用户角色动态生成消息分类配置
const messageTabs = computed(() => {
  const baseTabs = [
    { 
      key: 'group-notification', 
      label: '小组通知', 
      icon: User, 
      route: '/notifications?category=group',
      color: '#409EFF'
    },
    { 
      key: 'system-notification', 
      label: '系统通知', 
      icon: Setting, 
      route: '/notifications?category=system',
      color: '#E6A23C'
    }
  ]

  // 如果是教师，添加小组管理选项
  if (userRole.value === 'teacher') {
    baseTabs.splice(1, 0, {
      key: 'group-management',
      label: '小组管理',
      icon: Tools,
      route: '/user-center/teaching-management',
      color: '#67C23A'
    })
  }

  return baseTabs
})

// 计算属性
const showHover = computed(() => props.showHover)

// 综合悬停状态：外部传入的状态或内部悬停状态
const isHoverVisible = computed(() => props.showHover || internalHover.value)

// 鼠标事件处理
const handleMouseEnter = () => {
  internalHover.value = true
}

const handleMouseLeave = () => {
  internalHover.value = false
}

// 方法
const fetchNotifications = async () => {
  try {
    // 计算总未读数
    let unreadCount = 0
    Object.values(notifications.value).forEach(msgList => {
      unreadCount += msgList.filter(msg => !msg.is_read).length
    })
    totalUnread.value = unreadCount

    // 实际项目中这里调用真实的API
    // const response = await api.get('/information/reminder/query')
    // if (response.data.code === 200) {
    //   notifications.value = response.data.data.reminders
    //   totalUnread.value = response.data.data.total_unread
    // }
  } catch (error) {
    console.error('获取消息失败:', error)
  }
}

const getUnreadCount = (type) => {
  return notifications.value[type]?.filter(msg => !msg.is_read).length || 0
}

// 点击分类跳转到对应页面
const handleCategoryClick = (categoryKey) => {
  console.log('点击分类:', categoryKey)
  const tab = messageTabs.value.find(tab => tab.key === categoryKey)
  
  if (tab && tab.route) {
    router.push(tab.route)
  } else {
    localStorage.setItem('notification-active-tab', categoryKey)
    router.push('/notifications')
  }
}

// 查看全部消息
const handleViewAll = () => {
  router.push('/notifications')
}

// 监听showHover变化，用于调试
watch(() => props.showHover, (newVal) => {
  console.log('showHover changed:', newVal)
}, { immediate: true })

// 定时刷新消息
let refreshTimer = null

onMounted(() => {
  console.log('NotificationComponent mounted')
  console.log('用户角色:', userRole.value)
  console.log('消息分类:', messageTabs.value)
  
  fetchNotifications()
  // 每30秒刷新一次消息
  refreshTimer = setInterval(fetchNotifications, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.notification-container {
  position: relative;
  display: inline-block;
}

.notification-trigger {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.notification-trigger:hover {
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f3ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.notification-icon {
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.notification-trigger:hover .notification-icon {
  color: #409EFF;
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  transform: scale(0.8);
  z-index: 10;
}

.notification-hover-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  overflow: hidden;
  margin-top: 6px;
  animation: slideDown 0.2s ease-out;
  /* 添加一些padding-top来创建无缝的悬停区域 */
}

/* 在悬停面板和触发器之间创建一个无形的连接区域 */
.notification-hover-panel::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 0;
  right: 0;
  height: 6px;
  background: transparent;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%);
}

.panel-header h4 {
  margin: 0;
  font-size: 15px;
  color: #303133;
  font-weight: 600;
}

.total-count {
  font-size: 12px;
  color: #409EFF;
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f3ff 100%);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.message-categories {
  padding: 8px;
  background: white;
}

.category-item {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  border: 1px solid transparent;
}

.category-item:last-child {
  margin-bottom: 0;
}

.category-item:hover {
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-color: #d0d0d0;
  transform: translateX(2px);
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-label {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.category-badge {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.category-badge :deep(.el-badge__content) {
  background: #f56c6c;
  border: none;
  font-size: 11px;
  min-width: 14px;
  height: 14px;
  line-height: 14px;
  padding: 0;
  border-radius: 50%;
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  text-align: center;
}

.view-all-text {
  font-size: 13px;
  color: #409EFF;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-text:hover {
  color: #337ecc;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-hover-panel {
    width: 160px;
    left: auto;
    right: 0;
    transform: none;
  }
  
  .category-item {
    padding: 6px 8px;
  }
  
  .category-label {
    font-size: 12px;
  }
}
</style>
