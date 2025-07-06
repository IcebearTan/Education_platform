<template>
  <div class="ranking-container">
    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalMembers }}</div>
          <div class="stat-label">成员总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-number">{{ averageProgress.toFixed(1) }}%</div>
          <div class="stat-label">平均进度</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-info">
          <div class="stat-number">{{ activeMembers }}</div>
          <div class="stat-label">活跃成员</div>
        </div>
      </div>
    </div>

    <!-- 前三名领奖台 -->
    <div class="podium-section">
      <h2 class="section-title">🏆 排行榜前三甲</h2>
      <div class="podium-group">
        <div 
          v-for="(user, index) in topThree" 
          :key="user.id"
          class="podium-item" 
          :class="getPodiumClass(index)"
          @click="viewUserDetail(user)"
        >
          <div class="crown" v-if="index === 0">👑</div>
          <div class="avatar-frame">
            <img :src="user.avatar" class="avatar" :alt="user.name">
            <div class="rank-badge">{{ index + 1 }}</div>
          </div>
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <div class="score-info">
              <span class="chapter">第 {{ user.chapter_num }} 章</span>
              <span class="progress">{{ getProgressPercentage(user) }}%</span>
            </div>
            <div class="medals" v-if="user.medals && user.medals.length">
              <span 
                v-for="medal in user.medals.slice(0, 3)" 
                :key="medal"
                class="medal"
                :title="medal"
              >🏅</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完整排名列表 -->
    <div class="ranking-list-section">
      <div class="section-header">
        <h2 class="section-title">📊 完整排名</h2>
        <div class="filter-tabs">
          <button 
            v-for="tab in filterTabs" 
            :key="tab.key"
            class="filter-tab"
            :class="{ active: currentFilter === tab.key }"
            @click="currentFilter = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      
      <div class="ranking-list">
        <div 
          v-for="(user, index) in filteredRankingList" 
          :key="user.id"
          class="list-item"
          :class="{ 'is-current-user': user.id === currentUserId }"
          @click="viewUserDetail(user)"
        >
          <div class="list-rank">
            <span class="rank-number">{{ user.rank }}</span>
            <div class="rank-change" v-if="user.rankChange">
              <el-icon v-if="user.rankChange > 0" class="rank-up"><ArrowUp /></el-icon>
              <el-icon v-else-if="user.rankChange < 0" class="rank-down"><ArrowDown /></el-icon>
              <span class="change-number">{{ Math.abs(user.rankChange) }}</span>
            </div>
          </div>
          
          <div class="user-avatar-section">
            <img :src="user.avatar" class="list-avatar" :alt="user.name">
            <div class="online-status" :class="{ online: user.isOnline }"></div>
          </div>
          
          <div class="list-info">
            <div class="user-header">
              <h4>{{ user.name }}</h4>
              <div class="user-tags">
                <el-tag v-if="user.role === 'teacher'" type="warning" size="small">老师</el-tag>
                <el-tag v-if="user.isActive" type="success" size="small">活跃</el-tag>
              </div>
            </div>
            
            <div class="progress-section">
              <div class="progress-track">
                <div 
                  class="progress-bar" 
                  :style="{ 
                    width: `${getProgressPercentage(user)}%`,
                    background: getProgressColor(user)
                  }"
                ></div>
              </div>
              <div class="progress-text">
                {{ user.chapter_num }}/{{ user.total_chapters }} 章节
              </div>
            </div>
            
            <div class="user-stats">
              <span class="stat-item">
                <el-icon><Clock /></el-icon>
                {{ user.studyTime }}h
              </span>
              <span class="stat-item">
                <el-icon><Trophy /></el-icon>
                {{ user.points || 0 }}分
              </span>
              <span class="stat-item">
                <el-icon><Calendar /></el-icon>
                {{ formatLastActive(user.lastActive) }}
              </span>
            </div>
          </div>
          
          <div class="list-actions">
            <div class="score-display">
              <div class="main-score">{{ getProgressPercentage(user) }}%</div>
              <div class="sub-score">第 {{ user.chapter_num }} 章</div>
            </div>
            <el-button 
              size="small" 
              type="primary" 
              text
              @click.stop="viewProfile(user)"
              :disabled="props.disableAllAction"
            >
              查看
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户详情弹窗 -->
    <el-dialog 
      v-model="userDetailVisible" 
      :title="`${selectedUser?.name} 的详细信息`"
      width="500px"
      v-if="selectedUser"
    >
      <div class="user-detail-content">
        <div class="detail-header">
          <img :src="selectedUser.avatar" class="detail-avatar" :alt="selectedUser.name">
          <div class="detail-info">
            <h3>{{ selectedUser.name }}</h3>
            <el-tag :type="selectedUser.role === 'teacher' ? 'warning' : 'primary'">
              {{ selectedUser.role === 'teacher' ? '老师' : '学生' }}
            </el-tag>
          </div>
        </div>
        
        <div class="detail-stats">
          <div class="detail-stat">
            <label>当前进度:</label>
            <span>第 {{ selectedUser.chapter_num }}/{{ selectedUser.total_chapters }} 章 ({{ getProgressPercentage(selectedUser) }}%)</span>
          </div>
          <div class="detail-stat">
            <label>学习时长:</label>
            <span>{{ selectedUser.studyTime }} 小时</span>
          </div>
          <div class="detail-stat">
            <label>获得积分:</label>
            <span>{{ selectedUser.points || 0 }} 分</span>
          </div>
          <div class="detail-stat">
            <label>最后活跃:</label>
            <span>{{ formatLastActive(selectedUser.lastActive) }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="userDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowUp, ArrowDown, Clock, Trophy, Calendar } from '@element-plus/icons-vue'

// 接收禁用操作按钮的 prop
const props = defineProps({
  disableAllAction: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const currentFilter = ref('all')
const userDetailVisible = ref(false)
const selectedUser = ref(null)
const currentUserId = ref('user-001') // 当前登录用户ID

// 筛选选项
const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '活跃用户' },
  { key: 'students', label: '学生' },
  { key: 'teachers', label: '老师' }
]

// 模拟排名数据
const rankingData = ref([
  {
    id: 'user-001',
    name: '张三',
    avatar: '/src/assets/ice_bear_avatar.jpg',
    chapter_num: 8,
    total_chapters: 10,
    rank: 1,
    rankChange: 2,
    studyTime: 45,
    points: 850,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    isOnline: true,
    isActive: true,
    role: 'student',
    medals: ['学霸', '积极分子', '进步之星']
  },
  {
    id: 'user-002',
    name: '李四',
    avatar: '/src/assets/Jerry_Scintilla_avatar.jpg',
    chapter_num: 7,
    total_chapters: 10,
    rank: 2,
    rankChange: -1,
    studyTime: 38,
    points: 720,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5小时前
    isOnline: false,
    isActive: true,
    role: 'student',
    medals: ['坚持不懈']
  },
  {
    id: 'user-003',
    name: '王五',
    avatar: '/src/assets/ジエ_avatar.png',
    chapter_num: 6,
    total_chapters: 10,
    rank: 3,
    rankChange: 1,
    studyTime: 32,
    points: 640,
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
    isOnline: false,
    isActive: true,
    role: 'student',
    medals: ['新手上路']
  },
  {
    id: 'user-004',
    name: '陈老师',
    avatar: '/src/assets/ChenMinJie.jpg',
    chapter_num: 10,
    total_chapters: 10,
    rank: 4,
    rankChange: 0,
    studyTime: 60,
    points: 1000,
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
    isOnline: true,
    isActive: true,
    role: 'teacher',
    medals: ['教学能手', '学霸导师']
  },
  {
    id: 'user-005',
    name: '赵六',
    avatar: '/src/assets/LuMengXuan.jpg',
    chapter_num: 5,
    total_chapters: 10,
    rank: 5,
    rankChange: -2,
    studyTime: 25,
    points: 480,
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
    isOnline: false,
    isActive: false,
    role: 'student',
    medals: []
  },
  {
    id: 'user-006',
    name: '孙七',
    avatar: '/src/assets/ice_bear_avatar.jpg',
    chapter_num: 4,
    total_chapters: 10,
    rank: 6,
    rankChange: 1,
    studyTime: 18,
    points: 360,
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
    isOnline: false,
    isActive: false,
    role: 'student',
    medals: ['新手']
  },
  {
    id: 'user-007',
    name: '周八',
    avatar: '/src/assets/Jerry_Scintilla_avatar.jpg',
    chapter_num: 3,
    total_chapters: 10,
    rank: 7,
    rankChange: -1,
    studyTime: 12,
    points: 240,
    lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
    isOnline: false,
    isActive: false,
    role: 'student',
    medals: []
  }
])

// 计算属性
const totalMembers = computed(() => rankingData.value.length)

const averageProgress = computed(() => {
  const total = rankingData.value.reduce((sum, user) => sum + getProgressPercentage(user), 0)
  return total / rankingData.value.length
})

const activeMembers = computed(() => {
  return rankingData.value.filter(user => user.isActive).length
})

const topThree = computed(() => {
  return rankingData.value.slice(0, 3)
})

const filteredRankingList = computed(() => {
  let filtered = [...rankingData.value]
  
  switch (currentFilter.value) {
    case 'active':
      filtered = filtered.filter(user => user.isActive)
      break
    case 'students':
      filtered = filtered.filter(user => user.role === 'student')
      break
    case 'teachers':
      filtered = filtered.filter(user => user.role === 'teacher')
      break
  }
  
  return filtered
})

// 方法
const getProgressPercentage = (user) => {
  return Math.round((user.chapter_num / user.total_chapters) * 100)
}

const getProgressColor = (user) => {
  const percentage = getProgressPercentage(user)
  if (percentage >= 80) return 'linear-gradient(90deg, #67c23a 0%, #85ce61 100%)'
  if (percentage >= 60) return 'linear-gradient(90deg, #e6a23c 0%, #f0c987 100%)'
  if (percentage >= 40) return 'linear-gradient(90deg, #409eff 0%, #79bbff 100%)'
  return 'linear-gradient(90deg, #f56c6c 0%, #f89898 100%)'
}

const getPodiumClass = (index) => {
  const classes = ['gold', 'silver', 'bronze']
  return classes[index] || ''
}

const formatLastActive = (date) => {
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (hours < 1) return '刚刚活跃'
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

const viewUserDetail = (user) => {
  selectedUser.value = user
  userDetailVisible.value = true
}

const viewProfile = (user) => {
  ElMessage.info(`查看 ${user.name} 的详细资料`)
  // 这里可以跳转到用户个人页面
}

// 生命周期
onMounted(() => {
  // 可以在这里从API获取实际数据
  // await fetchRankingData()
})
</script>

<style scoped>
/* 适配嵌入式小组详情页的排行榜，整体更紧凑，字号、间距、卡片缩小，保证风格统一 */
.ranking-container {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: auto;
  background: none;
  box-shadow: none;
  padding: 0;
  margin: 0;
}

.ranking-container::-webkit-scrollbar {
  display: none;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}

.stat-card {
  border-radius: 8px;
  padding: 6px 4px;
  gap: 4px;
  box-shadow: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 16px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.stat-number {
  font-size: 13px;
}

.stat-label {
  font-size: 10px;
}

/* 领奖台区域 */
.podium-section {
  border-radius: 8px;
  padding: 6px 2px;
  margin-bottom: 8px;
  box-shadow: none;
}

.section-title {
  font-size: 13px;
  margin-bottom: 6px;
  text-align: center;
}

.podium-group {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 4px;
  padding: 2px;
}

.podium-item {
  padding: 4px 2px;
  border-radius: 6px;
}

.avatar-frame {
  width: 32px;
  height: 32px;
  padding: 1px;
  margin-bottom: 3px;
}

.rank-badge {
  width: 10px;
  height: 10px;
  font-size: 7px;
}

.user-info h3 {
  font-size: 10px;
  margin-bottom: 2px;
  color: #2d3436;
}

.score-info {
  gap: 1px;
  margin-bottom: 2px;
}

.chapter, .progress {
  font-size: 9px;
}

.medal {
  font-size: 9px;
}

/* 排名列表区域 */
.ranking-list-section {
  border-radius: 8px;
  padding: 6px 2px;
  box-shadow: none;
}

.section-header {
  margin-bottom: 6px;
  gap: 4px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 2px 6px;
  font-size: 9px;
  border: none;
  background: #f1f3f5;
  color: #495057;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.filter-tab:hover {
  background: #e9ecef;
}

.filter-tab.active {
  background: #667eea;
  color: white;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 4px 2px;
  border-radius: 6px;
  min-width: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.list-item:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.list-item.is-current-user {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.list-rank {
  min-width: 18px;
  margin-right: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rank-number {
  font-size: 9px;
  font-weight: 700;
  color: #2d3436;
}

.rank-change {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.7rem;
  margin-top: 2px;
}

.rank-up {
  color: #00b894;
}

.rank-down {
  color: #e17055;
}

.change-number {
  font-weight: 600;
}

.user-avatar-section {
  position: relative;
  margin-right: 2px;
}

.list-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
  border: 2px solid white;
}

.online-status.online {
  background: #00b894;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.user-header h4 {
  margin: 0;
  font-size: 9px;
  font-weight: 600;
  color: #2d3436;
}

.user-tags {
  display: flex;
  gap: 6px;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 2px;
}

.progress-track {
  flex: 1;
  height: 2px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.progress-text {
  font-size: 8px;
  min-width: 20px;
  text-align: right;
}

.user-stats {
  display: flex;
  gap: 2px;
}

.stat-item {
  font-size: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #636e72;
}

.list-actions {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 2px;
  min-width: 30px;
}

.score-display {
  text-align: right;
}

.main-score {
  font-size: 9px;
  font-weight: 700;
  color: #00b894;
}

.sub-score {
  font-size: 8px;
  color: #636e72;
}

/* 用户详情弹窗 */
.user-detail-content {
  padding: 4px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.detail-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f1f3f5;
}

.detail-info h3 {
  font-size: 10px;
  margin: 0 0 8px;
  font-weight: 600;
  color: #2d3436;
}

.detail-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-stat {
  padding: 2px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-stat label {
  font-weight: 500;
  color: #636e72;
  font-size: 8px;
}

.detail-stat span {
  font-weight: 600;
  color: #2d3436;
  font-size: 8px;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .ranking-container {
    min-width: 0;
    max-width: 100vw;
    padding: 0;
  }
  .podium-group, .stats-overview, .ranking-list-section {
    padding: 0 !important;
    gap: 2px !important;
  }
  .list-item {
    flex-direction: column;
    gap: 2px;
    text-align: center;
    padding: 2px 0;
  }
  .user-header, .user-stats {
    flex-wrap: wrap;
    gap: 2px;
  }
}
</style>