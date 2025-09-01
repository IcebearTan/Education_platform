<template>
  <div class="user-greeting" :class="{ 'theme-dark': isDarkMode, 'collapsed': isCollapsed }">
    <!-- 问候语头部 -->
    <div class="greeting-header">
      <h3>{{ greetingMessage }}</h3>
    </div>

    <!-- 当前时间日期 -->
    <div class="datetime-display" v-if="showDateTime">
      <!-- 折叠状态下隐藏时间 -->
      <div class="time" v-if="!isCollapsed">{{ currentTime }}</div>
      <div class="date-info">
        <span class="date">{{ currentDate }}</span>
        <span class="week">{{ currentWeek }}</span>
      </div>
      <div class="weather" v-if="weatherInfo">
        <span>{{ weatherInfo.description }} {{ weatherInfo.temperature }}°</span>
      </div>
      <div class="motivation" v-if="showMotivation && motivationText">
        <span>{{ motivationText }}</span>
      </div>
    </div>

    <!-- 学习统计 -->
    <!-- <div class="study-stats" v-if="showStats && studyStats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ studyStats.todayHours }}</div>
          <div class="stat-label">今日</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ studyStats.weekHours }}</div>
          <div class="stat-label">本周</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ studyStats.totalDays }}</div>
          <div class="stat-label">连续</div>
        </div>
      </div>
    </div> -->

    <!-- 激励语句 -->
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  // 用户信息
  userInfo: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '用户',
      avatar: null,
      role: null
    })
  },
  // 是否显示日期时间
  showDateTime: {
    type: Boolean,
    default: true
  },
  // 是否显示学习统计
  showStats: {
    type: Boolean,
    default: true
  },
  // 是否显示激励语句
  showMotivation: {
    type: Boolean,
    default: true
  },
  // 天气信息
  weatherInfo: {
    type: Object,
    default: null
  },
  // 学习统计数据
  studyStats: {
    type: Object,
    default: () => ({
      todayHours: '2.5h',
      weekHours: '15.5h',
      totalDays: '7天'
    })
  },
  // 主题模式
  isDarkMode: {
    type: Boolean,
    default: false
  },
  // 是否折叠状态
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const currentTime = ref('')
const currentDate = ref('')
const currentWeek = ref('')

// 激励语句库
const motivationTexts = [
  '今天也要加油学习哦！',
  '每一次努力都是为了更好的自己',
  '学而时习之，不亦说乎',
  '知识就是力量，坚持就是胜利',
  '今日学习，明日收获',
  '积少成多，积沙成塔',
  '勤奋是成功的阶梯',
  '学习使人进步，努力成就梦想'
]

// 计算属性
const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  
  if (hour < 6) return '深夜了，注意休息'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了，早点休息'
})

const motivationText = computed(() => {
  // 根据时间或随机选择激励语句
  const index = new Date().getDate() % motivationTexts.length
  return motivationTexts[index]
})

// 方法
function updateDateTime() {
  const now = new Date()
  
  // 更新时间
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  // 更新日期
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // 更新星期
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentWeek.value = weekdays[now.getDay()]
}

// 定时器
let timeTimer = null

// 生命周期
onMounted(() => {
  if (props.showDateTime) {
    updateDateTime()
    timeTimer = setInterval(updateDateTime, 1000)
  }
})

onUnmounted(() => {
  if (timeTimer) {
    clearInterval(timeTimer)
  }
})
</script>

<style scoped>
.user-greeting {
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s ease;
}

/* 折叠状态样式 */
.user-greeting.collapsed {
  gap: 16px;
}

.user-greeting.collapsed .greeting-header h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.user-greeting.collapsed .datetime-display {
  padding: 20px 24px;
}

.user-greeting.collapsed .date-info {
  margin-bottom: 12px;
}

.user-greeting.collapsed .motivation {
  padding: 12px 20px;
  font-size: 13px;
}

.greeting-header h3 {
  margin: 0;
  font-size: 32px;
  font-weight: 300;
  color: #2d3748;
  text-align: center;
  letter-spacing: -0.8px;
  transition: all 0.3s ease;
}

.theme-dark .greeting-header h3 {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.datetime-display {
  text-align: center;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(135, 206, 250, 0.15);
}

.theme-dark .datetime-display {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05);
}

.time {
  font-size: 52px;
  font-weight: 100;
  color: #2d3748;
  margin-bottom: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -2px;
  transition: color 0.3s ease;
}

.theme-dark .time {
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.date-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.date {
  font-size: 16px;
  color: #4a5568;
  font-weight: 500;
  transition: color 0.3s ease;
}

.theme-dark .date {
  color: rgba(255, 255, 255, 0.8);
}

.week {
  font-size: 16px;
  color: #4a5568;
  font-weight: 500;
  transition: color 0.3s ease;
}

.theme-dark .week {
  color: rgba(255, 255, 255, 0.8);
}

.weather {
  font-size: 15px;
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 12px;
  transition: color 0.3s ease;
}

.theme-dark .weather {
  color: #ffffff;
}

.motivation {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #2d3748;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.theme-dark .motivation {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.study-stats {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.theme-dark .study-stats {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
}

.theme-dark .stat-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
  transition: color 0.3s ease;
}

.theme-dark .stat-value {
  color: #ffffff;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.3s ease;
}

.theme-dark .stat-label {
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .greeting-header h3 {
    font-size: 28px;
  }
  
  .user-greeting.collapsed .greeting-header h3 {
    font-size: 20px;
  }
  
  .time {
    font-size: 44px;
  }
  
  .datetime-display {
    padding: 28px 20px;
    border-radius: 20px;
  }
  
  .user-greeting.collapsed .datetime-display {
    padding: 16px 18px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    padding: 16px 12px;
    border-radius: 12px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .user-greeting {
    gap: 20px;
  }
  
  .user-greeting.collapsed {
    gap: 12px;
  }
  
  .greeting-header h3 {
    font-size: 24px;
  }
  
  .user-greeting.collapsed .greeting-header h3 {
    font-size: 18px;
  }
  
  .time {
    font-size: 40px;
    letter-spacing: -1px;
  }
  
  .datetime-display {
    padding: 24px 16px;
    border-radius: 16px;
  }
  
  .user-greeting.collapsed .datetime-display {
    padding: 14px 16px;
  }
  
  .study-stats {
    padding: 20px;
    border-radius: 16px;
  }
  
  .motivation {
    padding: 14px 20px;
    font-size: 13px;
    border-radius: 12px;
  }
  
  .user-greeting.collapsed .motivation {
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>
