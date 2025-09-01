<template>
  <div class="attendance-overview">
    <div class="section-header">
      <h3 class="section-title">出勤统计概览</h3>
      <div class="time-range">
        <span class="range-text">近30天数据</span>
      </div>
    </div>

    <!-- 个人出勤统计 -->
    <div v-if="currentUserStats" class="personal-stats">
      <div class="personal-header">
        <h4>我的出勤表现</h4>
        <div v-if="currentUserRank" class="my-rank">
          <span class="rank-text">班级排名</span>
          <div class="rank-badge" :class="getRankClass(currentUserRank - 1)">
            <span v-if="currentUserRank <= 3" class="rank-icon">{{ getRankIcon(currentUserRank - 1) }}</span>
            <span v-else class="rank-number">{{ currentUserRank }}</span>
          </div>
        </div>
      </div>
      
      <div class="personal-cards">
        <div class="personal-card">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <div class="card-value">{{ currentUserStats.attendanceDays }}</div>
            <div class="card-label">我的出勤天数</div>
          </div>
        </div>
        <div class="personal-card">
          <div class="card-icon">⏰</div>
          <div class="card-content">
            <div class="card-value">{{ currentUserStats.onTimeRate }}%</div>
            <div class="card-label">我的准时率</div>
          </div>
        </div>
        <div class="personal-card">
          <div class="card-icon">🕐</div>
          <div class="card-content">
            <div class="card-value">{{ currentUserStats.totalHours }}h</div>
            <div class="card-label">我的学习时长</div>
          </div>
        </div>
        <div class="personal-card performance-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <div class="card-value performance-level" :class="getPerformanceClass(currentUserStats.onTimeRate)">
              {{ getPerformanceLevel(currentUserStats.onTimeRate) }}
            </div>
            <div class="card-label">表现评级</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 出勤排行榜（简化版） -->
    <div class="attendance-ranking">
      <div class="ranking-header">
        <h4>班级出勤排行</h4>
      </div>

      <div v-if="isLoading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="attendanceList.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <p class="empty-text">暂无出勤数据</p>
      </div>

      <div v-else class="ranking-list">
        <div
          v-for="(student, index) in topAttendanceList"
          :key="student.userId"
          class="ranking-item"
          :class="{ 'top-performer': index < 3 }"
        >
          <div class="rank-badge" :class="getRankClass(index)">
            <span v-if="index < 3" class="rank-icon">{{ getRankIcon(index) }}</span>
            <span v-else class="rank-number">{{ index + 1 }}</span>
          </div>
          
          <el-avatar 
            :size="36" 
            :src="userAvatars[student.userId] || defaultAvatarUrl"
            class="user-avatar"
          >
            {{ student.username?.charAt(0) }}
          </el-avatar>
          
          <div class="student-info">
            <div class="student-name">{{ student.username }}</div>
            <div class="attendance-summary">
              {{ student.attendanceDays }}天 · {{ student.onTimeRate }}% 准时
            </div>
          </div>
          
          <div class="performance-indicator">
            <div class="performance-score" :class="getPerformanceClass(student.onTimeRate)">
              {{ getPerformanceLevel(student.onTimeRate) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElAvatar, ElSkeleton, ElButton } from 'element-plus'
import api from '../../api'
import { mockApiRequest } from '../../mock/config'
import { mockApiResponses } from '../../mock/studyGroupData'

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  },
  currentUserId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['view-detail'])

// 状态管理
const attendanceList = ref([])
const isLoading = ref(false)
const userAvatars = ref({})
const defaultAvatarUrl = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const currentUserStats = ref(null)

// 总览统计
const overviewStats = ref({
  totalDays: 0,
  avgOnTimeRate: 0,
  totalHours: 0
})

// 最近趋势数据
const recentTrend = ref([])
const personalDailyAttendance = ref([])

// 计算属性
const topAttendanceList = computed(() => {
  return attendanceList.value
    .sort((a, b) => {
      // 按综合评分排序：出勤天数 + 准时率
      const scoreA = a.attendanceDays * 0.6 + a.onTimeRate * 0.4
      const scoreB = b.attendanceDays * 0.6 + b.onTimeRate * 0.4
      return scoreB - scoreA
    })
    .slice(0, 5) // 只显示前5名
})

// 获取当前用户排名
const currentUserRank = computed(() => {
  if (!props.currentUserId || !attendanceList.value.length) return null
  
  const sortedList = attendanceList.value
    .sort((a, b) => {
      const scoreA = a.attendanceDays * 0.6 + a.onTimeRate * 0.4
      const scoreB = b.attendanceDays * 0.6 + b.onTimeRate * 0.4
      return scoreB - scoreA
    })
  
  const index = sortedList.findIndex(student => student.userId == props.currentUserId)
  return index >= 0 ? index + 1 : null
})

// Mock数据生成
const getMockAttendanceData = () => {
  const students = [
    { userId: 2001, username: '张三' },
    { userId: 2002, username: '李四' },
    { userId: 2003, username: '王五' },
    { userId: 2004, username: '赵六' },
    { userId: 2005, username: '钱七' }
  ]

  const attendanceData = students.map(student => ({
    ...student,
    attendanceDays: Math.floor(Math.random() * 20) + 10,
    onTimeRate: Math.floor(Math.random() * 30) + 70,
    totalHours: Math.floor(Math.random() * 100) + 50
  }))

  // 如果有当前用户ID，确保当前用户在数据中
  let currentUser = null
  if (props.currentUserId) {
    const existingUser = attendanceData.find(s => s.userId == props.currentUserId)
    if (existingUser) {
      currentUser = existingUser
    } else {
      currentUser = {
        userId: props.currentUserId,
        username: '我',
        attendanceDays: Math.floor(Math.random() * 20) + 10,
        onTimeRate: Math.floor(Math.random() * 30) + 70,
        totalHours: Math.floor(Math.random() * 100) + 50
      }
      attendanceData.push(currentUser)
    }
  }

  // 生成最近7天趋势
  const trendData = []
  const today = new Date()
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const count = Math.floor(Math.random() * 5) + 3
    trendData.push({
      date: date.toISOString().split('T')[0],
      dayName: dayNames[date.getDay()],
      count: count,
      percentage: (count / 8) * 100 // 假设最大8人
    })
  }

  // 生成个人每日出勤数据
  const personalAttendanceData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const statusRandom = Math.random()
    let status, hours, percentage
    
    if (statusRandom > 0.8) {
      // 20% 概率缺勤
      status = 'absent'
      hours = 0
      percentage = 0
    } else if (statusRandom > 0.7) {
      // 10% 概率迟到
      status = 'late'
      hours = Math.floor(Math.random() * 4) + 2 // 2-5小时
      percentage = (hours / 8) * 100
    } else {
      // 70% 概率正常出勤
      status = 'attended'
      hours = Math.floor(Math.random() * 3) + 6 // 6-8小时
      percentage = (hours / 8) * 100
    }
    
    personalAttendanceData.push({
      date: date.toISOString().split('T')[0],
      dayName: dayNames[date.getDay()],
      status: status,
      hours: hours,
      percentage: percentage
    })
  }

  return Promise.resolve({
    data: {
      code: 200,
      data: {
        attendanceList: attendanceData,
        currentUser: currentUser,
        overview: {
          totalDays: Math.floor(Math.random() * 25) + 15,
          avgOnTimeRate: Math.floor(Math.random() * 20) + 80,
          totalHours: Math.floor(Math.random() * 200) + 300
        },
        recentTrend: trendData,
        personalDailyAttendance: personalAttendanceData
      }
    }
  })
}

// 获取出勤数据
const fetchAttendanceData = async () => {
  if (!props.groupId) return
  
  isLoading.value = true
  try {
    const response = await mockApiRequest(
      // 真实API调用
      () => api({
        url: `/attendance/group/${props.groupId}/overview`,
        method: 'get'
      }),
      // Mock响应
      getMockAttendanceData
    )
    
    if (response.data.code === 200) {
      attendanceList.value = response.data.data.attendanceList
      currentUserStats.value = response.data.data.currentUser
      overviewStats.value = response.data.data.overview
      recentTrend.value = response.data.data.recentTrend
      personalDailyAttendance.value = response.data.data.personalDailyAttendance || []
      
      // 获取用户头像
      attendanceList.value.forEach(student => {
        getUserAvatar(student.userId)
      })
      
      // 获取当前用户头像
      if (currentUserStats.value && props.currentUserId) {
        getUserAvatar(props.currentUserId)
      }
    }
  } catch (error) {
    console.error('获取出勤数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 获取用户头像
const getUserAvatar = async (userId) => {
  try {
    const res = await api({
      url: `/user/user_avatars_id`,
      method: 'get',
      params: { User_Id: userId }
    })

    if (res.data.code === 200 && res.data.User_Avatar) {
      userAvatars.value[userId] = 'data:image/jpeg;base64,' + res.data.User_Avatar
    } else {
      userAvatars.value[userId] = defaultAvatarUrl
    }
  } catch (err) {
    console.error('获取用户头像失败:', err)
    userAvatars.value[userId] = defaultAvatarUrl
  }
}

// 获取排名样式类
const getRankClass = (index) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return 'rank-normal'
}

// 获取排名图标
const getRankIcon = (index) => {
  const icons = ['🏆', '🥈', '🥉']
  return icons[index] || (index + 1)
}

// 获取表现等级
const getPerformanceLevel = (onTimeRate) => {
  if (onTimeRate >= 95) return '优秀'
  if (onTimeRate >= 85) return '良好'
  if (onTimeRate >= 75) return '一般'
  return '需改进'
}

// 获取表现样式类
const getPerformanceClass = (onTimeRate) => {
  if (onTimeRate >= 95) return 'excellent'
  if (onTimeRate >= 85) return 'good'
  if (onTimeRate >= 75) return 'average'
  return 'poor'
}

onMounted(() => {
  fetchAttendanceData()
})

watch(() => props.groupId, (newGroupId) => {
  if (newGroupId) {
    fetchAttendanceData()
  }
}, { immediate: false })
</script>

<style scoped>
.attendance-overview {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.time-range {
  font-size: 12px;
  color: #999;
}

.personal-stats {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%);
  border-radius: 12px;
  border: 1px solid #e1f0ff;
}

.personal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.personal-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.my-rank {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-text {
  font-size: 12px;
  color: #666;
}

.personal-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.personal-card {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8f4fd;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

.personal-card.performance-card {
  background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
  border-color: #ffeaa7;
}

.card-icon {
  font-size: 20px;
  margin-right: 10px;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 2px;
}

.card-value.performance-level {
  font-size: 14px;
}

.card-label {
  font-size: 11px;
  color: #666;
}

.attendance-ranking {
  margin-bottom: 24px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ranking-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.loading-state,
.empty-state {
  padding: 20px;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-text {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: #f0f7ff;
  border-color: #409eff;
}

.ranking-item.top-performer {
  background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
  border-color: #ffd700;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 12px;
  font-weight: 600;
  font-size: 12px;
}

.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #b7860b;
}

.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #666;
}

.rank-third {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  color: #8b4513;
}

.rank-normal {
  background: #e8e8e8;
  color: #666;
}

.rank-icon {
  font-size: 14px;
}

.user-avatar {
  margin-right: 12px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.attendance-summary {
  font-size: 12px;
  color: #666;
}

.performance-indicator {
  text-align: right;
}

.performance-score {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.performance-score.excellent {
  background: #f0f9ff;
  color: #1890ff;
}

.performance-score.good {
  background: #f6ffed;
  color: #52c41a;
}

.performance-score.average {
  background: #fff7e6;
  color: #fa8c16;
}

.performance-score.poor {
  background: #fff1f0;
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personal-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ranking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
