<template>
  <div class="checkin-status" :class="{ 'theme-dark': isDarkMode }">
    <!-- 展开状态下的计时器 -->
    <div class="study-timer-expanded" v-if="!isCollapsed && checkinInfo.checkedIn && !checkinInfo.checkedOut">
      <div class="timer-display-expanded">
        <span class="timer-text">学习时长</span>
        <div class="timer-value-expanded">{{ currentStudyDuration }}</div>
      </div>
    </div>

    <!-- 折叠状态下的计时器 -->
    <div class="study-timer-collapsed" v-if="isCollapsed && checkinInfo.checkedIn && !checkinInfo.checkedOut">
      <div 
        class="timer-display timer-collapsed jelly-hover"
        :class="{ 
          'timer-jelly-hover': isHovering
        }"
        @click="requestCheckout"
        @mouseenter="startHoverAnimation"
        @mouseleave="endHoverAnimation"
      >
        <div class="timer-content-wrapper">
          <div class="timer-content content-switching">
            <!-- 学习时长显示 -->
            <div class="timer-info" :class="{ 'info-hidden': isHovering }">
              <span class="timer-value">{{ currentStudyDuration }}</span>
              <span class="timer-label">学习中</span>
            </div>
            <!-- 结束按钮显示 -->
            <div class="timer-button" :class="{ 'button-visible': isHovering }">
              <span class="timer-button-text">结束学习</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 折叠状态下的其他状态显示 -->
    <div class="study-status-collapsed" v-if="isCollapsed && (!checkinInfo.checkedIn || checkinInfo.checkedOut)">
      <div class="status-display" 
           :class="{ 
             'status-jelly-hover': !checkinInfo.checkedIn && isHovering
           }"
           @click="!checkinInfo.checkedIn ? requestCheckin() : null"
           @mouseenter="!checkinInfo.checkedIn ? startHoverAnimation() : null"
           @mouseleave="!checkinInfo.checkedIn ? endHoverAnimation() : null">
        <div class="status-content-wrapper">
          <div class="status-content" :class="{ 'content-switching': !checkinInfo.checkedIn }">
            <!-- 提示文本 -->
            <div class="status-info" :class="{ 'info-hidden': !checkinInfo.checkedIn && isHovering }">
              <span class="status-text">
                {{ !checkinInfo.checkedIn ? '点击开始' : '今日完成' }}
              </span>
              <span class="status-icon" v-if="!checkinInfo.checkedIn">▶</span>
            </div>
            <!-- 开始按钮显示 -->
            <div class="status-button" :class="{ 'button-visible': !checkinInfo.checkedIn && isHovering }">
              <span class="button-text">开始学习</span>
              <div class="button-icon">●</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 打卡按钮 -->
    <div class="checkin-actions" v-if="!isCollapsed">
      <el-button 
        v-if="!checkinInfo.checkedIn"
        type="primary" 
        size="large" 
        @click="requestCheckin"
        :loading="loading"
        round
        class="custom-button primary-button"
      >
        开始学习
      </el-button>
      <el-button 
        v-else-if="!checkinInfo.checkedOut"
        type="danger" 
        size="large" 
        @click="requestCheckout"
        :loading="loading"
        round
        class="custom-button danger-button"
      >
        结束学习
      </el-button>
      <div v-else class="completed-status">
        今日学习已完成
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElButton, ElDialog } from 'element-plus'

// Props
const props = defineProps({
  // 打卡信息
  checkinInfo: {
    type: Object,
    default: () => ({
      checkedIn: false,
      checkedOut: false,
      checkinTime: null,
      checkoutTime: null
    })
  },
  // 主题模式
  isDarkMode: {
    type: Boolean,
    default: false
  },
  // 折叠状态
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['checkin', 'checkout', 'request-checkin', 'request-checkout'])

// 响应式数据
const loading = ref(false)
const studyStartTime = ref(null)
const currentStudyDuration = ref('00:00:00')
const isHovering = ref(false)

// 动画控制方法
const startHoverAnimation = () => {
  isHovering.value = true
}

const endHoverAnimation = () => {
  isHovering.value = false
}

// 定时器
let studyTimer = null

// 计算学习时长
const updateStudyDuration = () => {
  if (!studyStartTime.value) return
  
  const now = new Date()
  const startTime = new Date(studyStartTime.value)
  const diff = now - startTime
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  currentStudyDuration.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 方法
function requestCheckin() {
  emit('request-checkin')
}

function requestCheckout() {
  emit('request-checkout', { studyDuration: currentStudyDuration.value })
}

function handleCheckin() {
  loading.value = true
  
  const now = new Date()
  studyStartTime.value = now.toISOString()
  
  const checkinData = {
    ...props.checkinInfo,
    checkedIn: true,
    checkinTime: now.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 开始计时
  studyTimer = setInterval(updateStudyDuration, 1000)
  
  emit('checkin', checkinData)
  loading.value = false
}

function handleCheckout() {
  loading.value = true
  
  const checkoutData = {
    ...props.checkinInfo,
    checkedOut: true,
    checkoutTime: new Date().toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }),
    studyDuration: currentStudyDuration.value
  }
  
  // 停止计时
  if (studyTimer) {
    clearInterval(studyTimer)
    studyTimer = null
  }
  
  emit('checkout', checkoutData)
  loading.value = false
}

// 生命周期
onMounted(() => {
  // 如果已经签到但未签退，恢复计时
  if (props.checkinInfo.checkedIn && !props.checkinInfo.checkedOut) {
    if (props.checkinInfo.checkinTime) {
      const today = new Date().toDateString()
      const checkinTimeStr = `${today} ${props.checkinInfo.checkinTime}:00`
      studyStartTime.value = new Date(checkinTimeStr).toISOString()
    } else {
      // 如果没有具体的签到时间，使用当前时间作为开始时间
      studyStartTime.value = new Date().toISOString()
    }
    studyTimer = setInterval(updateStudyDuration, 1000)
    updateStudyDuration()
  }
})

// 监听checkinInfo变化
watch(() => props.checkinInfo, (newInfo) => {
  if (newInfo.checkedIn && !newInfo.checkedOut && !studyTimer) {
    // 开始计时
    if (newInfo.checkinTime) {
      const today = new Date().toDateString()
      const checkinTimeStr = `${today} ${newInfo.checkinTime}:00`
      studyStartTime.value = new Date(checkinTimeStr).toISOString()
    } else {
      studyStartTime.value = new Date().toISOString()
    }
    studyTimer = setInterval(updateStudyDuration, 1000)
    updateStudyDuration()
  } else if ((!newInfo.checkedIn || newInfo.checkedOut) && studyTimer) {
    // 停止计时
    clearInterval(studyTimer)
    studyTimer = null
  }
}, { deep: true })

onUnmounted(() => {
  if (studyTimer) {
    clearInterval(studyTimer)
  }
})

// 暴露方法给父组件
defineExpose({
  handleCheckin,
  handleCheckout
})
</script>

<style scoped>
.checkin-status {
  margin-top: 24px;
  transition: all 0.3s ease;
  height: auto;
  min-height: 50px;
}

/* 展开状态计时器样式 */
.study-timer-expanded {
  margin-bottom: 24px;
  text-align: center;
}

.timer-display-expanded {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 32px 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(135, 206, 250, 0.15);
  width: 100%;
  max-width: 425px;
}

.timer-display-expanded .timer-text {
  display: block;
  font-size: 16px;
  color: #4a5568;
  margin-bottom: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.timer-value-expanded {
  font-size: 48px;
  font-weight: 300;
  color: #2d3748;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Mono', monospace;
  letter-spacing: 3px;
  line-height: 1.2;
}

.theme-dark .timer-display-expanded {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-dark .timer-display-expanded .timer-text {
  color: rgba(255, 255, 255, 0.8);
}

.theme-dark .timer-value-expanded {
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

/* 折叠状态计时器样式 */
.study-timer-collapsed {
  /* margin-top: 24px; */
  text-align: center;
}

.study-timer {
  margin-bottom: 24px;
  text-align: center;
}

.study-status-collapsed {
  text-align: center;
}

.timer-display {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 24px 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(135, 206, 250, 0.15);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.timer-collapsed {
  padding: 12px 16px !important;
  border-radius: 24px !important;
  min-width: 120px;
  width: auto;
  display: inline-block;
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.timer-jelly-hover {
  transform: scale(1.05) !important;
  border-radius: 20px !important;
  min-width: 160px !important;
  padding: 14px 20px !important;
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
  border: 1px solid rgba(229, 62, 62, 0.3) !important;
  box-shadow: 0 12px 40px rgba(229, 62, 62, 0.4) !important;
  animation: jellyBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes jellyBounce {
  0% { transform: scale(1); }
  25% { transform: scale(0.95) scaleX(1.1); }
  50% { transform: scale(1.02) scaleX(0.98); }
  75% { transform: scale(1.01) scaleX(1.02); }
  100% { transform: scale(1.05); }
}

.timer-content-wrapper {
  position: relative;
  width: 100%;
  height: 24px;
  overflow: hidden;
}

.timer-content {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.timer-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.timer-info.info-hidden {
  opacity: 0;
  transform: translateX(-20px);
}

.timer-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.timer-button.button-visible {
  opacity: 1;
  transform: translateX(0);
  /* transform: translateY(8px); */
}

.timer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  position: relative;
}

.timer-button-text {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
  opacity: 0;
  animation: fadeInScale 0.4s ease-out 0.2s forwards;
}

.theme-dark .timer-button-text {
  color: #000000;
}

.status-display {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 8px 32px rgba(135, 206, 250, 0.15);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-width: 120px;
  width: auto;
  display: inline-block;
}

.status-jelly-hover {
  transform: scale(1.05) !important;
  border-radius: 20px !important;
  min-width: 160px !important;
  padding: 14px 20px !important;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%) !important;
  border: 1px solid rgba(45, 55, 72, 0.3) !important;
  box-shadow: 0 12px 40px rgba(45, 55, 72, 0.4) !important;
  animation: jellyBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.status-content-wrapper {
  position: relative;
  width: 100%;
  height: 24px;
  overflow: hidden;
}

.status-content {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-info.info-hidden {
  opacity: 0;
  transform: translateX(-20px);
}

.status-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-button.button-visible {
  opacity: 1;
  transform: translateX(0);
}

/* 文本和图标样式 */
.timer-value, .status-text {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
}

.timer-label {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
  opacity: 0.8;
}

.status-icon {
  font-size: 12px;
  color: #4a5568;
  opacity: 0.8;
}

.button-text {
  font-size: 16px;
  font-weight: 600;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.button-icon {
  font-size: 8px;
  color: white;
  opacity: 0.8;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}

/* 主题适配 */
.theme-dark .timer-jelly-hover {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%) !important;
  border: 1px solid rgba(252, 129, 129, 0.3) !important;
  box-shadow: 0 12px 40px rgba(252, 129, 129, 0.4) !important;
}

.theme-dark .status-jelly-hover {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 12px 40px rgba(255, 255, 255, 0.3) !important;
}

.theme-dark .timer-value,
.theme-dark .status-text {
  color: #ffffff;
}

.theme-dark .timer-label,
.theme-dark .status-icon {
  color: rgba(255, 255, 255, 0.8);
}

.theme-dark .status-jelly-hover .button-text {
  color: #000000;
}

.theme-dark .status-display {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  position: relative;
}

.status-text {
  font-size: 18px;
  font-weight: 500;
  color: #2d3748;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.status-button-text {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
  opacity: 0;
  animation: fadeInScale 0.4s ease-out 0.2s forwards;
}

.theme-dark .status-text {
  color: #ffffff;
}

.theme-dark .status-button-text {
  color: #000000;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.theme-dark .timer-display {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.timer-text {
  display: block;
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.theme-dark .timer-text {
  color: rgba(255, 255, 255, 0.8);
}

.timer-value {
  display: block;
  font-size: 36px;
  font-weight: 200;
  color: #2d3748;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Mono', monospace;
  letter-spacing: 2px;
  transition: color 0.3s ease;
}

.timer-collapsed .timer-value {
  font-size: 18px !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s ease;
}

.theme-dark .timer-value {
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.checkin-actions {
  display: flex;
  justify-content: center;
}

/* 自定义按钮样式 */
.custom-button {
  min-width: 160px;
  height: 48px;
  font-weight: 500;
  font-size: 16px;
  border: none;
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.custom-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.custom-button:hover::before {
  left: 100%;
}

.primary-button {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
}

.primary-button:hover {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(45, 55, 72, 0.4);
}

.theme-dark .primary-button {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  color: #000000;
}

.theme-dark .primary-button:hover {
  background: linear-gradient(135deg, #e6e6e6 0%, #cccccc 100%);
  box-shadow: 0 12px 40px rgba(255, 255, 255, 0.3);
}

.danger-button {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
}

.danger-button:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(229, 62, 62, 0.4);
}

.theme-dark .danger-button {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
  color: #000000;
}

.theme-dark .danger-button:hover {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  box-shadow: 0 12px 40px rgba(252, 129, 129, 0.4);
}

.completed-status {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d3748;
  font-weight: 600;
  font-size: 16px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  min-width: 160px;
}

.theme-dark .completed-status {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .checkin-status {
    margin-top: 20px;
  }
  
  .timer-display-expanded {
    padding: 24px 18px;
    max-width: 350px;
  }
  
  .timer-value-expanded {
    font-size: 40px;
    letter-spacing: 2px;
  }
  
  .timer-display-expanded .timer-text {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .timer-display, .status-display {
    padding: 20px 16px;
    border-radius: 16px;
  }
  
  .timer-collapsed, .status-display {
    padding: 10px 14px !important;
    border-radius: 20px !important;
    min-width: 100px !important;
  }
  
  .timer-jelly-hover, .status-jelly-hover {
    min-width: 140px !important;
    padding: 12px 16px !important;
  }
  
  .timer-value, .status-text, .button-text {
    font-size: 14px !important;
  }
  
  .timer-label, .status-icon {
    font-size: 11px !important;
  }
  
  .checkin-actions {
    width: 100%;
  }
  
  .custom-button {
    width: 100%;
    min-width: auto;
    height: 44px;
    font-size: 15px;
  }
  
  .completed-status {
    width: 100%;
    min-width: auto;
    border-radius: 16px;
  }
}

@media (max-width: 480px) {
  .timer-display-expanded {
    padding: 20px 16px;
    max-width: 300px;
  }
  
  .timer-value-expanded {
    font-size: 36px;
    letter-spacing: 1px;
  }
  
  .timer-display-expanded .timer-text {
    font-size: 13px;
    margin-bottom: 10px;
  }
  
  .timer-collapsed, .status-display {
    padding: 8px 12px !important;
    border-radius: 18px !important;
    min-width: 90px !important;
  }
  
  .timer-jelly-hover, .status-jelly-hover {
    min-width: 120px !important;
    padding: 10px 14px !important;
  }
  
  .timer-value, .status-text, .button-text {
    font-size: 13px !important;
  }
  
  .timer-label, .status-icon {
    font-size: 10px !important;
  }
  
  .timer-display, .status-display {
    padding: 18px 14px;
    border-radius: 14px;
  }
  
  .timer-collapsed {
    padding: 12px 14px !important;
    border-radius: 10px !important;
  }
  
  .custom-button {
    height: 42px;
    font-size: 14px;
  }
  
  .completed-status {
    padding: 14px 20px;
    font-size: 15px;
    border-radius: 14px;
  }
}
</style>
