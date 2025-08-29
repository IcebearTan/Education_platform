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
      
      <!-- <div class="personal-cards">
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
        <div class="personal-card">
          <div class="card-icon">�</div>
          <div class="card-content">
            <div class="card-value">{{ currentUserStats.streak || 0 }}天</div>
            <div class="card-label">连续学习</div>
          </div>
        </div>
      </div> -->
      
      <!-- 学习进度仪表盘 -->
      <div class="progress-dashboard">
        <div class="dashboard-header">
          <!-- <h5>学习进度仪表盘</h5> -->
        </div>
        <div class="circular-progress">
          <svg class="progress-ring" width="120" height="120">
            <circle
              class="progress-ring-background"
              stroke="#e6f7ff"
              stroke-width="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              class="progress-ring-circle"
              stroke="#1890ff"
              stroke-width="8"
              stroke-linecap="round"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
              :stroke-dasharray="326.73"
              :stroke-dashoffset="326.73 - (326.73 * (currentUserStats.progress || 0)) / 100"
            />
          </svg>
          <div class="progress-center">
            <div class="progress-value">{{ currentUserStats.progress || 0 }}%</div>
            <div class="progress-label">总进度</div>
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
          
          <div class="progress-indicator">
            <div class="progress-percentage">{{ user.progress }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElAvatar, ElSkeleton } from 'element-plus'
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

// 状态管理
const progressList = ref([])
const isLoading = ref(false)
const userAvatars = ref({})
const defaultAvatarUrl = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const currentUserStats = ref(null)

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
  return mockApiRequest(
    // 真实API调用
    async () => {
      const res = await api({
        url: '/learningProgress/group',
        method: 'get',
        params: { Group_Id: props.groupId }
      })
      if (res.data.code === 200) {
        return res.data
      }
      throw new Error('API返回错误')
    },
    // Mock响应
    async () => {
      const response = await mockApiResponses.getLearningProgressRank(props.groupId)
      return {
        code: 200,
        data: response.data
      }
    }
  )
}

// 获取学习进度数据
const fetchLearningProgress = async () => {
  if (!props.groupId) return
  
  isLoading.value = true
  try {
    const response = await getMockProgressData()
    
    if (response.code === 200) {
      // 处理新的mock数据结构
      const rankData = response.data || []
      
      // 转换数据格式以兼容现有UI
      const processedData = rankData.map((student, index) => ({
        id: student.id,
        name: student.name,
        progress: student.progress,
        completedTasks: student.completedTasks,
        totalTasks: student.totalTasks,
        studyHours: student.studyHours,
        rank: student.rank || index + 1,
        // 兼容原有字段
        username: student.name,
        chapter: Math.floor(student.progress / 10),
        section: Math.floor(student.progress / 5) % 5,
        courseName: 'JavaScript进阶开发',
        chapterName: `第${Math.floor(student.progress / 10)}章`,
        sectionName: `第${Math.floor(student.progress / 5) % 5}节`
      }))

      progressList.value = processedData
      
      // 设置当前用户统计信息
      if (props.currentUserId) {
        const currentUser = processedData.find(s => s.id == props.currentUserId)
        if (currentUser) {
          currentUserStats.value = {
            progress: currentUser.progress,
            completedTasks: currentUser.completedTasks,
            totalTasks: currentUser.totalTasks,
            studyHours: currentUser.studyHours,
            rank: currentUser.rank,
            streak: Math.floor(Math.random() * 10) + 5, // 随机生成连续学习天数
            // 兼容原有字段
            chapter: currentUser.chapter,
            section: currentUser.section,
            courseName: currentUser.courseName,
            chapterName: currentUser.chapterName,
            sectionName: currentUser.sectionName
          }
        }
      }
      
      // 预加载头像
      processedData.forEach(student => {
        if (student.id) {
          getUserAvatar(student.id)
        }
      })
      
      // 获取当前用户头像
      if (currentUserStats.value && props.currentUserId) {
        getUserAvatar(props.currentUserId)
      }
    } else {
      console.warn('获取学习进度数据失败')
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
// const getProgressColor = (progress) => {
//   if (progress >= 80) return '#67c23a'
//   if (progress >= 60) return '#e6a23c'
//   if (progress >= 40) return '#f56c6c'
//   return '#909399'
// }

// 获取表现等级
// const getPerformanceLevel = (progress) => {
//   if (progress >= 90) return '优秀'
//   if (progress >= 75) return '良好'
//   if (progress >= 60) return '一般'
//   return '需努力'
// }

// 获取表现样式类
// const getPerformanceClass = (progress) => {
//   if (progress >= 90) return 'excellent'
//   if (progress >= 75) return 'good'
//   if (progress >= 60) return 'average'
//   return 'poor'
// }

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

.card-label {
  font-size: 11px;
  color: #666;
}

.progress-dashboard {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #fff 0%, #f8fafe 100%);
  border-radius: 12px;
  border: 1px solid #e1f0ff;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h5 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.circular-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.35s;
}

.progress-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  line-height: 1;
}

.progress-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 13px;
  color: #666;
}

.detail-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-progress-bar {
  width: 60px;
  height: 6px;
  background: #e8f4fd;
  border-radius: 3px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.detail-value {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
  min-width: 45px;
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

.progress-indicator {
  text-align: right;
}

.progress-percentage {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  padding: 4px 12px;
  background: linear-gradient(135deg, #e6f7ff, #f0f9ff);
  border-radius: 16px;
  border: 1px solid #bae7ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personal-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .progress-dashboard {
    padding: 16px;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .progress-ring {
    width: 100px;
    height: 100px;
  }
  
  .progress-value {
    font-size: 20px;
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
}
</style>
