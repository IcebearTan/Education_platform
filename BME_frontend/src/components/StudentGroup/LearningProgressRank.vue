<template>
  <div class="learning-progress-rank">
    <div class="section-header">
      <h3 class="section-title">学习进度概览</h3>
      <div class="time-range">
        <span class="range-text">本月数据</span>
      </div>
    </div>

    <!-- 个人学习进度统计 -->
    <div v-if="currentUserStats" class="personal-stats">
      <div class="personal-header">
        <h4>我的学习表现</h4>
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
          <div class="card-icon">📚</div>
          <div class="card-content">
            <div class="card-value">{{ currentUserStats.completedTasks || 0 }}</div>
            <div class="card-label">已完成任务</div>
          </div>
        </div>
        <div class="personal-card">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <div class="card-value">{{ currentUserStats.progress || 0 }}%</div>
            <div class="card-label">学习进度</div>
          </div>
        </div>
        <div class="personal-card">
          <div class="card-icon">⏱️</div>
          <div class="card-content">
            <div class="card-value">{{ currentUserStats.studyHours || 0 }}h</div>
            <div class="card-label">学习时长</div>
          </div>
        </div>
        <div class="personal-card performance-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <div class="card-value performance-level" :class="getPerformanceClass(currentUserStats.progress || 0)">
              {{ getPerformanceLevel(currentUserStats.progress || 0) }}
            </div>
            <div class="card-label">学习评级</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习进度排行榜（简化版） -->
    <div class="progress-ranking">
      <div class="ranking-header">
        <h4>班级学习排行</h4>
      </div>

      <div v-if="isLoading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="progressList.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <p class="empty-text">暂无学习进度数据</p>
      </div>
      
      <div v-else class="progress-list">
        <div
          v-for="(user, idx) in topProgressList"
          :key="user.id"
          class="progress-item"
          :class="{ 'top-performer': idx < 3 }"
        >
          <div class="rank-badge" :class="getRankClass(idx)">
            <span v-if="idx < 3" class="rank-icon">{{ getRankIcon(idx) }}</span>
            <span v-else class="rank-number">{{ idx + 1 }}</span>
          </div>
          
          <el-avatar 
            :size="36" 
            :src="userAvatars[user.id] || defaultAvatarUrl"
            class="user-avatar"
          >
            {{ user.name?.charAt(0) }}
          </el-avatar>
          
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="progress-summary">
              {{ user.progress }}% · {{ user.courseName }}
            </div>
          </div>
          
          <div class="performance-indicator">
            <div class="performance-score" :class="getPerformanceClass(user.progress)">
              {{ getPerformanceLevel(user.progress) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的每日学习进度 -->
    <div class="daily-progress">
      <h4>我的每日学习进度</h4>
      <div class="progress-chart">
        <div class="chart-placeholder">
          <div class="progress-bars">
            <div 
              v-for="(day, index) in personalDailyProgress" 
              :key="index"
              class="progress-bar"
              :style="{ height: `${day.percentage}%` }"
              :title="`${day.date}: ${day.status === 'active' ? '活跃学习 ' + day.hours + '小时' : day.status === 'normal' ? '正常学习 ' + day.hours + '小时' : '未学习'}`"
              :class="day.status"
            >
              <span class="bar-value" v-if="day.hours > 0">{{ day.hours }}h</span>
            </div>
          </div>
          <div class="chart-labels">
            <span v-for="(day, index) in personalDailyProgress" :key="index" class="label">
              {{ day.dayName }}
            </span>
          </div>
        </div>
        
        <!-- 学习状态说明 -->
        <div class="progress-legend">
          <div class="legend-item">
            <div class="legend-color active"></div>
            <span>活跃学习</span>
          </div>
          <div class="legend-item">
            <div class="legend-color normal"></div>
            <span>正常学习</span>
          </div>
          <div class="legend-item">
            <div class="legend-color inactive"></div>
            <span>未学习</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElAvatar, ElProgress, ElSkeleton } from 'element-plus'
import api from '../../api'
import { mockApiRequest } from '../../mock/config'

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

// 状态管理
const progressList = ref([])
const isLoading = ref(false)
const userAvatars = ref({})
const defaultAvatarUrl = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const currentUserStats = ref(null)
const personalDailyProgress = ref([])

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

// 计算属性
const topProgressList = computed(() => {
  return progressList.value.slice(0, 5) // 只显示前5名
})

// 获取当前用户排名
const currentUserRank = computed(() => {
  if (!props.currentUserId || !progressList.value.length) return null
  
  const index = progressList.value.findIndex(student => student.id == props.currentUserId)
  return index >= 0 ? index + 1 : null
})

// Mock数据 - 临时用于开发
const getMockProgressData = () => {
  const mockData = {
    group_name: '测试小组',
    result: [
      {
        user_id: 2001,
        username: '张三',
        records: [{
          course_name: 'Vue3开发实战',
          chapter_name: '组件通信',
          section_name: 'Props与Events',
          chapter_num: 8,
          section_num: 3,
          course_chapters: 12
        }]
      },
      {
        user_id: 2002,
        username: '李四',
        records: [{
          course_name: 'Vue3开发实战',
          chapter_name: '路由管理',
          chapter_num: 6,
          section_num: 2,
          course_chapters: 12
        }]
      },
      {
        user_id: 2003,
        username: '王五',
        records: [{
          course_name: 'Vue3开发实战',
          chapter_name: 'Composition API',
          chapter_num: 10,
          section_num: 4,
          course_chapters: 12
        }]
      },
      {
        user_id: 2004,
        username: '赵六',
        records: [{
          course_name: 'Vue3开发实战',
          chapter_name: '基础语法',
          chapter_num: 4,
          section_num: 1,
          course_chapters: 12
        }]
      },
      {
        user_id: 2005,
        username: '钱七',
        records: [{
          course_name: 'Vue3开发实战',
          chapter_name: '高级特性',
          chapter_num: 11,
          section_num: 2,
          course_chapters: 12
        }]
      }
    ]
  }

  // 如果有当前用户ID，确保当前用户在数据中
  let currentUser = null
  if (props.currentUserId) {
    const existingUser = mockData.result.find(u => u.user_id == props.currentUserId)
    if (existingUser) {
      currentUser = existingUser
    } else {
      currentUser = {
        user_id: props.currentUserId,
        username: '我',
        records: [{
          course_name: 'Vue3开发实战',
          chapter_name: '响应式原理',
          chapter_num: Math.floor(Math.random() * 10) + 3,
          section_num: Math.floor(Math.random() * 4) + 1,
          course_chapters: 12
        }]
      }
      mockData.result.push(currentUser)
    }
  }

  // 生成个人每日学习进度数据
  const personalProgressData = []
  const today = new Date()
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const statusRandom = Math.random()
    let status, hours, percentage
    
    if (statusRandom > 0.7) {
      // 30% 概率未学习
      status = 'inactive'
      hours = 0
      percentage = 0
    } else if (statusRandom > 0.4) {
      // 30% 概率活跃学习
      status = 'active'
      hours = Math.floor(Math.random() * 4) + 4 // 4-7小时
      percentage = (hours / 8) * 100
    } else {
      // 40% 概率正常学习
      status = 'normal'
      hours = Math.floor(Math.random() * 3) + 1 // 1-3小时
      percentage = (hours / 8) * 100
    }
    
    personalProgressData.push({
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
        ...mockData,
        personalDailyProgress: personalProgressData
      }
    }
  })
}

// 获取学习进度数据
const fetchLearningProgress = async () => {
  if (!props.groupId) return
  
  isLoading.value = true
  try {
    const response = await mockApiRequest(
      // 真实API调用
      () => api({
        url: '/learningProgress/group',
        method: 'get',
        params: { Group_Id: props.groupId }
      }),
      // Mock响应
      getMockProgressData
    )
    
    if (response.data.code === 200) {
      // 处理学习进度数据
      const processedData = response.data.data.result.map(user => {
        let totalProgress = 0
        let currentChapter = 0
        let currentSection = 0
        let latestCourse = null
        let completedTasks = 0
        let studyHours = 0
        
        if (user.records && user.records.length > 0) {
          const maxProgressRecord = user.records.reduce((prev, current) => 
            (prev.chapter_num > current.chapter_num) ? prev : current
          )
          latestCourse = maxProgressRecord
          currentChapter = maxProgressRecord.chapter_num || 0
          currentSection = maxProgressRecord.section_num || 0
          
          // 计算进度
          const validRecords = user.records.filter(record => record.course_chapters > 0)
          if (validRecords.length > 0) {
            totalProgress = validRecords.reduce((sum, record) => {
              let percent = 0
              if (record.course_chapters > 0) {
                percent = (record.chapter_num / record.course_chapters) * 100
                percent = Math.min(100, Math.max(0, percent))
              }
              return sum + percent
            }, 0) / validRecords.length
            totalProgress = Math.min(100, Math.max(0, totalProgress))
          }
          
          // 模拟其他统计数据
          completedTasks = currentChapter * currentSection + Math.floor(Math.random() * 5)
          studyHours = Math.floor(totalProgress * 0.8) + Math.floor(Math.random() * 20)
        }
        
        return {
          id: user.user_id,
          name: user.username,
          progress: Math.round(totalProgress),
          chapter: currentChapter,
          section: currentSection,
          courseName: latestCourse?.course_name || '未开始学习',
          chapterName: latestCourse?.chapter_name || '',
          sectionName: latestCourse?.section_name || '',
          completedTasks: completedTasks,
          studyHours: studyHours
        }
      })
      
      // 按进度排序
      progressList.value = processedData.sort((a, b) => b.progress - a.progress)
      
      // 设置当前用户统计数据
      if (props.currentUserId) {
        const currentUserData = processedData.find(user => user.id == props.currentUserId)
        if (currentUserData) {
          currentUserStats.value = currentUserData
        }
      }
      
      // 设置个人每日学习进度
      personalDailyProgress.value = response.data.data.personalDailyProgress || []
      
      // 获取所有学生的头像
      progressList.value.forEach(student => {
        getUserAvatar(student.id)
      })
      
      // 获取当前用户头像
      if (currentUserStats.value && props.currentUserId) {
        getUserAvatar(props.currentUserId)
      }
    }
  } catch (error) {
    console.error('获取学习进度失败:', error)
  } finally {
    isLoading.value = false
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

// 获取进度条颜色
const getProgressColor = (progress) => {
  if (progress >= 80) return '#67c23a'
  if (progress >= 60) return '#e6a23c'
  if (progress >= 40) return '#f56c6c'
  return '#909399'
}

// 获取表现等级
const getPerformanceLevel = (progress) => {
  if (progress >= 90) return '优秀'
  if (progress >= 75) return '良好'
  if (progress >= 60) return '一般'
  return '需努力'
}

// 获取表现样式类
const getPerformanceClass = (progress) => {
  if (progress >= 90) return 'excellent'
  if (progress >= 75) return 'good'
  if (progress >= 60) return 'average'
  return 'poor'
}

onMounted(() => {
  fetchLearningProgress()
})

watch(() => props.groupId, (newGroupId) => {
  if (newGroupId) {
    fetchLearningProgress()
  }
}, { immediate: false })
</script>

<style scoped>
.learning-progress-rank {
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

.progress-ranking {
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
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.progress-item:hover {
  background: #f0f7ff;
  border-color: #409eff;
}

.progress-item.top-performer {
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

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.progress-summary {
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

.daily-progress h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.progress-chart {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
}

.chart-placeholder {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.progress-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 80px;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  padding-bottom: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-bar.active {
  background: linear-gradient(to top, #67c23a, #85ce61);
}

.progress-bar.active:hover {
  background: linear-gradient(to top, #529b2e, #67c23a);
  transform: scale(1.05);
}

.progress-bar.normal {
  background: linear-gradient(to top, #409eff, #79bbff);
}

.progress-bar.normal:hover {
  background: linear-gradient(to top, #337ecc, #409eff);
  transform: scale(1.05);
}

.progress-bar.inactive {
  background: linear-gradient(to top, #909399, #b4bccc);
  min-height: 10px;
}

.progress-bar.inactive:hover {
  background: linear-gradient(to top, #73767a, #909399);
  transform: scale(1.05);
}

.bar-value {
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.label {
  font-size: 12px;
  color: #666;
  text-align: center;
  flex: 1;
}

.progress-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.active {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.legend-color.normal {
  background: linear-gradient(135deg, #409eff, #79bbff);
}

.legend-color.inactive {
  background: linear-gradient(135deg, #909399, #b4bccc);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personal-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .progress-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .progress-legend {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
