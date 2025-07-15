<template>
  <div class="sidebar-content">
    <!-- 每日打卡组件 -->
    <div class="sidebar-section">
      <DailyAttendence />
    </div>
    
    <!-- 出勤排行榜 -->
    <div class="sidebar-section">
      <!-- <div class="section-header">
        <h3 class="section-title">
          <span class="title-icon">🏆</span>
          <span>出勤排行榜</span>
        </h3>
      </div> -->
      <AttenceRankComponent />
    </div>
    
    <!-- 快捷操作区 -->
    
    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="section-title">
          <span class="title-icon">⚡</span>
          <span>快捷操作</span>
        </h3>
      </div>
      <div class="quick-actions">
        <div 
          class="action-item" 
          v-for="action in quickActions" 
          :key="action.id"
          @click="handleActionClick(action)"
        >
          <div class="action-icon">{{ action.icon }}</div>
          <div class="action-content">
            <div class="action-title">{{ action.title }}</div>
            <div class="action-desc">{{ action.description }}</div>
          </div>
          <div class="action-arrow">→</div>
        </div>
      </div>
    </div>
   
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import DailyAttendence from '../Attendence/DailyAttendence.vue';
import AttenceRankComponent from '../Attendence/AttenceRankComponent.vue';

// 定义事件
const emit = defineEmits(['action-click']);

// 快捷操作数据
const quickActions = ref([
  {
    id: 'study',
    title: '开始学习',
    description: '查看课程内容',
    icon: '📚',
    route: '/study'
  },
  // {
  //   id: 'progress',
  //   title: '学习进度',
  //   description: '查看学习情况',
  //   icon: '📊',
  //   route: '/progress'
  // },
  {
    id: 'groups',
    title: '学习小组',
    description: '查看学习小组',
    icon: '👥',
    route: '/user-center/my-groups'
  },
  {
    id: 'profile',
    title: '个人中心',
    description: '管理个人信息',
    icon: '👤',
    route: '/user'
  }
]);

// 处理快捷操作点击
const handleActionClick = (action) => {
  emit('action-click', action);
};
</script>

<style scoped>
.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.sidebar-section {
  /* min-height: 150px; */
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.04);
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 出勤排行榜无圆角、无阴影、无边框、无悬浮交互 */
.sidebar-section:nth-child(2) {
  border-radius: 0 !important;
  box-shadow: none !important;
  border: none !important;
  transition: none !important;
}
.sidebar-section:nth-child(2):hover {
  box-shadow: none !important;
  transform: none !important;
}

.sidebar-section:hover {
  box-shadow: 0 4px 30px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.section-header {
  padding: 20px 20px 0 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.title-icon {
  font-size: 20px;
}

/* 快捷操作样式 */
.quick-actions {
  padding: 0 0 12px 0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  position: relative;
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:hover {
  background: rgba(64, 158, 255, 0.05);
  transform: translateX(4px);
}

.action-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #409eff, #67c23a);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-item:hover::before {
  opacity: 1;
}

.action-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.action-desc {
  font-size: 13px;
  color: #8a8a8a;
  line-height: 1.4;
}

.action-arrow {
  font-size: 16px;
  color: #409eff;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.action-item:hover .action-arrow {
  transform: translateX(4px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar-content {
    gap: 20px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .action-item {
    padding: 14px 16px;
  }
  
  .action-icon {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
  
  .action-title {
    font-size: 15px;
  }
  
  .action-desc {
    font-size: 12px;
  }
}

@media (max-width: 900px) {
  .sidebar-content {
    gap: 16px;
  }
  
  .sidebar-section {
    border-radius: 12px;
  }
  
  .section-header {
    padding: 16px 16px 0 16px;
  }
  
  .section-title {
    font-size: 15px;
    margin-bottom: 12px;
  }
  
  .action-item {
    padding: 12px 16px;
    gap: 10px;
  }
  
  .action-icon {
    width: 32px;
    height: 32px;
    font-size: 18px;
    border-radius: 8px;
  }
  
  .action-title {
    font-size: 14px;
  }
  
  .action-desc {
    font-size: 11px;
  }
}

/* 进入动画 */
.sidebar-section {
  animation: slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.sidebar-section:nth-child(2) { animation-delay: 0.1s; }
.sidebar-section:nth-child(3) { animation-delay: 0.2s; }

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .sidebar-section {
    background: #2c2c2c;
    border-color: #4a4a4a;
  }
  
  .section-title {
    color: #e0e0e0;
  }
  
  .action-item {
    border-bottom-color: #4a4a4a;
  }
  
  .action-item:hover {
    background: rgba(64, 158, 255, 0.1);
  }
  
  .action-title {
    color: #e0e0e0;
  }
  
  .action-desc {
    color: #b0b0b0;
  }
  
  .action-icon {
    background: rgba(64, 158, 255, 0.2);
  }
}

/* 移动端隐藏侧边栏中的签到模块 */
@media (max-width: 900px) {
  .sidebar-content .sidebar-section:first-child {
    display: none;
  }
  
  /* 移动端隐藏出勤排行榜和快捷操作区 */
  .sidebar-content .sidebar-section:nth-child(2),
  .sidebar-content .sidebar-section:nth-child(3) {
    display: none;
  }
}
</style>
