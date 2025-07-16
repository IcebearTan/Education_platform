<template>
  <div class="notification-container">
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

    <!-- 悬停时显示的简化消息面板 -->
    <div v-if="showHover" class="notification-hover-panel">
      <!-- <div class="panel-header">
        <h4>消息通知</h4>
        <span class="total-count">{{ totalUnread }} 条未读</span>
      </div> -->

      <!-- 消息分类统计 -->
      <div class="message-categories">
        <div 
          v-for="tab in messageTabs.slice(1)" 
          :key="tab.key"
          class="category-item"
          @click="handleCategoryClick(tab.key)"
        >
          <div class="category-icon">
            <el-icon :color="getCategoryColor(tab.key)" :size="16">
              <component :is="tab.icon" />
            </el-icon>
          </div>
          <div class="category-info">
            <span class="category-label">{{ tab.label }}</span>
            <!-- 小气泡放在同一行内 -->
            <el-badge 
              v-if="getUnreadCount(tab.key) > 0" 
              :value="getUnreadCount(tab.key)" 
              class="category-badge"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- 查看更多 -->
      <!-- <div class="panel-footer">
        <span class="view-all-text">点击查看全部消息</span>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Document, User, Warning, InfoFilled, Notification } from '@element-plus/icons-vue'
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
  task: [],
  homework: [],
  leave: [],
  notice: [],
  error: [],
  other: []
})
const totalUnread = ref(0)

// 消息分类配置
const messageTabs = [
  { key: 'all', label: '全部', icon: Bell },
  { key: 'task', label: '任务', icon: Document },
  { key: 'homework', label: '作业', icon: Document },
  { key: 'notice', label: '通知', icon: Notification },
  { key: 'leave', label: '请假', icon: User },
  { key: 'error', label: '错误', icon: Warning },
  { key: 'other', label: '其他', icon: InfoFilled }
]

// 计算属性
const showHover = computed(() => props.showHover)

// 方法
const fetchNotifications = async () => {
  try {
    const response = await api.get('/information/reminder/query')
    if (response.data.code === 200) {
      notifications.value = response.data.data.reminders
      totalUnread.value = response.data.data.total_unread
    }
  } catch (error) {
    console.error('获取消息失败:', error)
  }
}

const getUnreadCount = (type) => {
  if (type === 'all') {
    return totalUnread.value
  }
  return notifications.value[type]?.filter(msg => !msg.is_read).length || 0
}

const getCategoryColor = (type) => {
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

// 点击分类跳转到消息页面并设置对应分类
const handleCategoryClick = (categoryKey) => {
  // 先保存分类到本地存储
  localStorage.setItem('notification-active-tab', categoryKey)
  // 跳转到消息页面
  router.push('/notifications')
}

// 定时刷新消息
let refreshTimer = null

onMounted(() => {
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
  height: 40px; /* 设置固定高度确保垂直对齐 */
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
  width: 200px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 2000;
  overflow: hidden;
  margin-top: 4px;
  animation: slideDown 0.2s ease-out;
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
  padding: 8px 12px;
  background: white;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  transition: all 0.25s ease;
  border-radius: 6px;
  position: relative;
  margin-bottom: 1px;
  cursor: pointer; /* 添加手型光标 */
}

.category-item:hover {
  background: linear-gradient(135deg, #f5f7fa 0%, #ecf5ff 100%);
  transform: translateX(1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.category-item:hover .category-icon {
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.category-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 24px;
}

.category-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  transition: color 0.25s ease;
  line-height: 1;
}

.category-item:hover .category-label {
  color: #409EFF;
}

.category-badge {
  transform: scale(0.8);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.panel-footer {
  text-align: center;
  padding: 14px 20px;
  border-top: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%);
}

.view-all-text {
  font-size: 12px;
  color: #909399;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: color 0.3s ease;
}

.view-all-text:before {
  content: "👆";
  font-size: 14px;
}

.panel-footer:hover .view-all-text {
  color: #409EFF;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .notification-hover-panel {
    width: 180px;
    max-width: 85vw;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .message-categories {
    padding: 6px 10px;
  }
  
  .category-item {
    gap: 6px;
    padding: 3px 4px;
  }
  
  .category-label {
    font-size: 13px;
  }
  
  .category-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
