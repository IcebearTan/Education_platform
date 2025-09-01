<template>
  <div
    ref="panelRef"
    class="live-checkin-panel"
    :class="{ 
      expanded: isExpanded,
      'theme-dark': !isDarkMode,
      'theme-light': isDarkMode
    }"
    :style="{ height: isExpanded ? dynamicHeight : '380px' }"
    @click="togglePanel"
  >
    <!-- 展开/折叠控制按钮 -->
    <!-- <div class="panel-header" >
      <h2>实时状态面板</h2>
      <el-icon class="toggle-icon" :class="{ rotated: isExpanded }">
        <ArrowDown />
      </el-icon>
    </div> -->

    <!-- 面板内容 -->
    <div class="panel-content" v-show="isExpanded">
      <div class="content-grid">
        <!-- 左侧：问候语和打卡状态 -->
        <div class="left-section">
          <div class="greeting-card">
            <!-- 使用独立的问候组件 -->
            <UserGreeting 
              :user-info="userInfo"
              :show-stats="true"
              :study-stats="studyStats"
              :weather-info="weatherInfo"
              :is-dark-mode="isDarkMode"
              :is-collapsed="!isExpanded"
            />

            <!-- 使用独立的打卡状态组件 -->
            <CheckinStatus
              ref="checkinStatusRef"
              :checkin-info="checkinInfo"
              :is-dark-mode="isDarkMode"
              :is-collapsed="false"
              @checkin="handleCheckinEvent"
              @checkout="handleCheckoutEvent"
              @request-checkin="showCheckinDialog"
              @request-checkout="showCheckoutDialog"
            />
          </div>
        </div>

        <!-- 右侧：实时座位图 -->
        <div class="right-section">
          <div class="seat-map-card">
            <div class="card-header">
              <h4>实时座位图</h4>
              <div class="last-update">
                <el-icon><Refresh /></el-icon>
                <span>最后更新: {{ lastUpdateTime }}</span>
              </div>
            </div>
            
            <RealTimeSeatMap
              :current-user-id="userInfo.id"
              :default-room-id="defaultRoomId"
              @seat-click="handleSeatClick"
              @room-change="handleRoomChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 折叠状态的简化内容 -->
    <div class="panel-collapsed-content" v-show="!isExpanded">
      <div class="collapsed-grid">
        <!-- 左侧：保持与展开时相同的占比 -->
        <div class="collapsed-left-section">
          <div class="collapsed-greeting-card">
            <UserGreeting 
              :user-info="userInfo"
              :show-stats="false"
              :study-stats="studyStats"
              :weather-info="weatherInfo"
              :is-dark-mode="isDarkMode"
              :is-collapsed="true"
            />
            <CheckinStatus
              ref="checkinStatusCollapsedRef"
              :checkin-info="checkinInfo"
              :is-dark-mode="isDarkMode"
              :is-collapsed="true"
              @checkin="handleCheckinEvent"
              @checkout="handleCheckoutEvent"
              @request-checkin="showCheckinDialog"
              @request-checkout="showCheckoutDialog"
            />
          </div>
        </div>
        <!-- 右侧：保持占位，但内容简化或隐藏 -->
        <div class="collapsed-right-section">
          <div class="collapsed-placeholder">
            <span class="placeholder-text">点击展开查看更多</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 签到确认弹框 -->
    <el-dialog
      v-model="checkinDialogVisible"
      title="开始学习"
      width="320px"
      center
      append-to-body
    >
      <div class="dialog-content">
        <p>确认开始今日的学习吗？</p>
      </div>
      <template #footer>
        <el-button @click="checkinDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCheckin" :loading="checkinLoading">
          确认签到
        </el-button>
      </template>
    </el-dialog>

    <!-- 签退确认弹框 -->
    <el-dialog
      v-model="checkoutDialogVisible"
      title="结束学习"
      width="320px"
      center
      append-to-body
    >
      <div class="dialog-content">
        <p>本次学习时长：{{ checkoutStudyDuration }}</p>
        <p>确认结束今日的学习吗？</p>
      </div>
      <template #footer>
        <el-button @click="checkoutDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleCheckout" :loading="checkoutLoading">
          确认签退
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElIcon, ElTag, ElButton, ElDialog } from 'element-plus'
import { 
  ArrowDown, 
  Refresh
} from '@element-plus/icons-vue'
import RealTimeSeatMap from './RealTimeSeatMap.vue'
import UserGreeting from './UserGreeting.vue'
import CheckinStatus from './CheckinStatus.vue'

// Props
const props = defineProps({
  // 默认是否展开
  defaultExpanded: {
    type: Boolean,
    default: true
  },
  // 默认房间ID
  defaultRoomId: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['checkin', 'checkout', 'seat-click', 'room-change'])

// 响应式数据
const isExpanded = ref(props.defaultExpanded)
const lastUpdateTime = ref('')
const checkinLoading = ref(false)
const checkoutLoading = ref(false)
const panelRef = ref(null)
const checkinStatusRef = ref(null)
const dynamicHeight = ref('300px')
const checkinDialogVisible = ref(false)
const checkoutDialogVisible = ref(false)
const checkoutStudyDuration = ref('')

// 白天黑夜模式
const isDarkMode = ref(false)

// 检查当前时间来决定主题
const checkTimeTheme = () => {
  const hour = new Date().getHours()
  // 6点到18点为白天模式，其他时间为黑夜模式
  isDarkMode.value = hour < 6 || hour >= 18
}

// 计算动态高度
const calculateExpandedHeight = () => {
  if (!panelRef.value) return
  
  nextTick(() => {
    const panel = panelRef.value
    const rect = panel.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    
    // 计算面板顶部到视口顶部的距离
    const topOffset = rect.top
    
    // 预留底部边距 (可根据实际情况调整)
    const bottomMargin = 20
    
    // 计算可用高度
    const availableHeight = viewportHeight - topOffset - bottomMargin
    
    dynamicHeight.value = `${Math.max(availableHeight, 500)}px`
  })
}

// 用户信息
const userInfo = ref({
  id: 'user123',
  name: '张三',
  avatar: null,
  role: '学生'
})

// 学习统计数据
const studyStats = ref({
  todayHours: '2.5h',
  weekHours: '15.5h',
  totalDays: '7天'
})

// 天气信息
const weatherInfo = ref({
  description: '晴',
  temperature: 25
})

// 打卡信息
const checkinInfo = ref({
  checkedIn: false,
  checkedOut: false,
  checkinTime: null,
  checkoutTime: null,
  location: null,
  studyDuration: null
})

// 计算属性
// (已移除 checkinStatus，现在由 CheckinStatus 组件内部处理)

// 方法
function togglePanel() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    calculateExpandedHeight()
  }
}

function updateLastUpdateTime() {
  const now = new Date()
  lastUpdateTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

function showCheckinDialog() {
  checkinDialogVisible.value = true
}

function showCheckoutDialog(data) {
  checkoutStudyDuration.value = data.studyDuration
  checkoutDialogVisible.value = true
}

async function handleCheckin() {
  checkinLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 调用子组件的签到方法
    if (checkinStatusRef.value) {
      checkinStatusRef.value.handleCheckin()
    }
    
    checkinDialogVisible.value = false
  } catch (error) {
    console.error('签到失败:', error)
  } finally {
    checkinLoading.value = false
  }
}

async function handleCheckout() {
  checkoutLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 调用子组件的签退方法
    if (checkinStatusRef.value) {
      checkinStatusRef.value.handleCheckout()
    }
    
    checkoutDialogVisible.value = false
  } catch (error) {
    console.error('签退失败:', error)
  } finally {
    checkoutLoading.value = false
  }
}

function handleCheckinEvent(checkinData) {
  checkinInfo.value = checkinData
  emit('checkin', checkinData)
}

function handleCheckoutEvent(checkoutData) {
  checkinInfo.value = checkoutData
  emit('checkout', checkoutData)
}

function handleSeatClick(seat) {
  emit('seat-click', seat)
}

function handleRoomChange(roomId) {
  emit('room-change', roomId)
}

// 定时器
let updateTimer = null

// 生命周期
onMounted(() => {
  updateLastUpdateTime()
  checkTimeTheme() // 初始化主题
  updateTimer = setInterval(() => {
    updateLastUpdateTime()
    checkTimeTheme() // 定期检查主题
  }, 30000) // 30秒更新一次
  
  // 监听窗口大小变化
  window.addEventListener('resize', calculateExpandedHeight)
  
  // 初始计算高度
  if (isExpanded.value) {
    calculateExpandedHeight()
  }
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
  window.removeEventListener('resize', calculateExpandedHeight)
})
</script>

<style scoped>
.live-checkin-panel {
  width: 100%;
  height: 500px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(20px);
  margin-top: 5px
}

/* 白天主题 - 温暖晴天配色 */
.live-checkin-panel.theme-light {
  background: linear-gradient(135deg, 
    #e0effe 0%,  /* 温暖的米黄色 */
    #ddfffb 20%, /* 浅橙白 */
    #edffc5 32%, /* 淡黄色 */
    #faeaff 48%, /* 温暖金色 */
    #ecfffa 80%, /* 柔和桃色 */
    #ffffff 100% /* 淡粉色 */
  );
  box-shadow: 0 20px 60px rgba(255, 223, 162, 0.25);
}

/* 黑夜主题 - 强烈黑色对比 */
.live-checkin-panel.theme-dark {
  background: linear-gradient(135deg, 
    #000000 0%, 
    #1a1a1a 20%, 
    #2d2d2d 40%, 
    #404040 60%, 
    #525252 80%, 
    #666666 100%
  );
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

/* 添加星空效果（黑夜模式） */
.live-checkin-panel.theme-dark::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 4s ease-in-out infinite alternate;
  opacity: 0.6;
  pointer-events: none;
}

@keyframes twinkle {
  0% { opacity: 0.4; }
  100% { opacity: 0.9; }
}

/* 添加温暖阳光效果（白天模式） */
.live-checkin-panel.theme-light::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(255, 228, 181, 0.6) 0%, transparent 40%),
    radial-gradient(circle at 40% 70%, rgba(255, 248, 220, 0.5) 0%, transparent 35%),
    radial-gradient(circle at 90% 80%, rgba(255, 239, 213, 0.4) 0%, transparent 30%);
  pointer-events: none;
  z-index: 1;
  border-radius: 24px;
  animation: sunlight-dance 20s ease-in-out infinite;
  opacity: 0.7;
}

/* @keyframes sunlight-dance {
  0%, 100% { 
    opacity: 0.7;
    transform: scale(1) rotate(0deg);
  }
  25% { 
    opacity: 0.8;
    transform: scale(1.02) rotate(1deg);
  }
  50% { 
    opacity: 0.75;
    transform: scale(1.01) rotate(0deg);
  }
  75% { 
    opacity: 0.8;
    transform: scale(1.02) rotate(-1deg);
  }
} */

.panel-header {
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header:hover {
  background: rgba(255, 255, 255, 0.15);
}

.panel-header h2 {
  margin: 0;
  color: white;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.toggle-icon {
  color: white;
  font-size: 18px;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.panel-content {
  padding: 32px;
  position: relative;
  z-index: 2;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 32px;
  height: 100%;
}

/* 折叠状态的布局 */
.panel-collapsed-content {
  padding: 20px 24px;
  position: relative;
  z-index: 2;
}

.collapsed-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
  height: 100%;
}

.collapsed-left-section, .collapsed-right-section {
  height: 100%;
}

.collapsed-greeting-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 20px;
  height: auto;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.theme-light .collapsed-greeting-card {
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #1a365d;
  box-shadow: 0 8px 32px rgba(135, 206, 235, 0.2);
}

.theme-dark .collapsed-greeting-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05);
}

.collapsed-placeholder {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 20px;
  height: auto;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.theme-light .collapsed-placeholder {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(135, 206, 235, 0.15);
}

.theme-dark .collapsed-placeholder {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.03);
}

.placeholder-text {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
}

.theme-light .placeholder-text {
  color: #4a5568;
}

.theme-dark .placeholder-text {
  color: rgba(255, 255, 255, 0.6);
}

.left-section, .right-section {
  height: 100%;
}

.greeting-card, .seat-map-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 32px;
  max-height: 575px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.theme-light .greeting-card, 
.theme-light .seat-map-card {
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #1a365d;
  box-shadow: 0 8px 32px rgba(135, 206, 235, 0.2);
}

.theme-dark .greeting-card, 
.theme-dark .seat-map-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05);
}

.seat-map-card {
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.theme-light .card-header {
  border-bottom-color: rgba(26, 54, 93, 0.2);
}

.theme-dark .card-header {
  border-bottom-color: rgba(255, 255, 255, 0.15);
}

.card-header h4 {
  margin: 0;
  color: #1a365d;
  font-size: 16px;
  font-weight: 600;
}

.theme-light .card-header h4 {
  color: #1a365d;
}

.theme-dark .card-header h4 {
  color: #ffffff;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
}

.theme-light .last-update {
  color: #333333;
}

.theme-dark .last-update {
  color: rgba(255, 255, 255, 0.7);
}

.dialog-content {
  text-align: center;
  padding: 20px 0;
}

.dialog-content p {
  margin: 8px 0;
  color: #333;
  font-size: 15px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .collapsed-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .panel-content {
    padding: 24px;
  }
  
  .panel-collapsed-content {
    padding: 16px 20px;
  }
  
  .collapsed-placeholder {
    min-height: 120px;
  }
}

@media (max-width: 768px) {
  .panel-header {
    padding: 16px 20px;
  }
  
  .panel-header h2 {
    font-size: 18px;
  }
  
  .greeting-card, .seat-map-card {
    padding: 24px;
    border-radius: 20px;
  }
  
  .collapsed-greeting-card, .collapsed-placeholder {
    padding: 16px;
    border-radius: 16px;
    min-height: 160px;
  }
  
  .panel-content {
    padding: 20px;
  }
  
  .panel-collapsed-content {
    padding: 14px 18px;
  }
  
  .collapsed-grid {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .panel-header {
    padding: 12px 16px;
  }
  
  .panel-content {
    padding: 16px;
  }
  
  .panel-collapsed-content {
    padding: 12px 16px;
  }
  
  .collapsed-grid {
    gap: 12px;
  }
  
  .collapsed-greeting-card, .collapsed-placeholder {
    padding: 14px;
    border-radius: 14px;
    min-height: 140px;
  }
  
  .greeting-card, .seat-map-card {
    padding: 20px;
    border-radius: 16px;
  }
  
  .placeholder-text {
    font-size: 13px;
  }
}
</style>
