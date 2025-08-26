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

      <!-- 根据用户身份加载对应的组件 -->
      <TeacherNotificationComponent 
        v-if="isTeacher"
        :notifications="notifications"
        :total-unread="totalUnread"
        @mark-read="markAsRead"
        @mark-all-read="markAllAsRead"
        @refresh="refreshMessages"
        @quick-reply="handleQuickReply"
      />
      
      <StudentNotificationComponent 
        v-else
        :notifications="notifications"
        :total-unread="totalUnread"
        @mark-read="markAsRead"
        @mark-all-read="markAllAsRead"
        @refresh="refreshMessages"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { 
  Check, Refresh
} from '@element-plus/icons-vue'
import api from '../api'
import MenuComponent from '../components/MenuComponent.vue'
import TeacherNotificationComponent from '../components/Notification/TeacherNotificationComponent.vue'
import StudentNotificationComponent from '../components/Notification/StudentNotificationComponent.vue'

const router = useRouter()
const store = useStore()

// 响应式数据
const notifications = ref({
  task: [],
  homework: [],
  leave: [],
  notice: [],
  error: [],
  teaching: [],
  student_management: [],
  analytics: [],
  system: [],
  other: []
})

const totalUnread = ref(0)
const loading = ref(false)

// 用户身份判断
const isTeacher = computed(() => {
  return store.state.user?.User_Mode === 'admin'
})

// 方法
const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await api.get('/information/reminder/query')
    if (response.data.code === 200) {
      // 基础消息类型
      const baseNotifications = response.data.data.reminders
      
      // 如果是导师，添加额外的教学相关消息
      if (isTeacher.value) {
        // 模拟获取教学相关消息（实际项目中应该从API获取）
        const teachingNotifications = await fetchTeachingNotifications()
        notifications.value = {
          ...baseNotifications,
          ...teachingNotifications
        }
      } else {
        notifications.value = baseNotifications
      }
      
      totalUnread.value = response.data.data.total_unread
    }
  } catch (error) {
    console.error('获取消息失败:', error)
    ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
  }
}

const fetchTeachingNotifications = async () => {
  try {
    // 模拟教学相关消息数据
    return {
      teaching: [
        {
          id: Date.now() + 1,
          title: '小组1有新的任务提交',
          content: '学生张三提交了"数据结构练习"作业，等待批阅',
          create_time: new Date().toISOString(),
          is_read: false,
          is_important: true,
          source_type: '4',
          related_info_id: '123',
          group_name: '数据结构学习小组',
          student_count: 25
        }
      ],
      student_management: [
        {
          id: Date.now() + 2,
          title: '学生请假申请',
          content: '学生李四申请请假3天，原因：生病',
          create_time: new Date().toISOString(),
          is_read: false,
          is_important: false,
          source_type: '5',
          related_info_id: '456'
        }
      ],
      analytics: [],
      system: []
    }
  } catch (error) {
    console.error('获取教学消息失败:', error)
    return { teaching: [], student_management: [], analytics: [], system: [] }
  }
}

const refreshMessages = () => {
  fetchNotifications()
  ElMessage.success('消息已刷新')
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

const handleQuickReply = (message) => {
  // 处理快速回复功能
  ElMessage.info('快速回复功能开发中...')
  console.log('快速回复消息:', message)
}

// 定时刷新消息
let refreshTimer = null

onMounted(() => {
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
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
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
}

/* 防止滚动条导致的布局偏移 */
body {
  overflow-x: hidden;
}

/* 优化滚动性能 */
.notification-view * {
  -webkit-overflow-scrolling: touch;
}

/* 防止字体加载导致的布局跳动 */
.notification-header h1 {
  font-display: swap;
}
</style>
