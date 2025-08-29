<template>
  <div class="group-activity">
    <!-- 时间范围选择 -->
    <div class="time-selector">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="handleDateRangeChange"
      />
      <el-button @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <!-- 当前正在打卡的成员 -->
    <div class="current-checkin">
      <el-card class="checkin-card">
        <template #header>
          <div class="card-header">
            <el-icon><Clock /></el-icon>
            <span>当前正在打卡的成员</span>
            <el-tag type="success" size="small">{{ currentCheckInMembers.length }}人在线</el-tag>
          </div>
        </template>
        
        <div v-if="currentCheckInMembers.length === 0" class="empty-state">
          <el-empty :image-size="80" description="当前没有成员在线打卡" />
        </div>
        
        <div v-else class="checkin-grid">
          <div 
            v-for="member in currentCheckInMembers" 
            :key="member.id" 
            class="checkin-box"
          >
            <el-avatar :size="60" :src="member.avatar" class="member-avatar">
              {{ member.name.charAt(0) }}
            </el-avatar>
            <div class="member-name">{{ member.name }}</div>
            <div class="checkin-duration">{{ calculateDuration(member.checkInTime) }}</div>
            <div class="checkin-start-time">{{ formatTime(member.checkInTime) }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 出勤概览 -->
    <div class="attendance-overview">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <el-icon><Calendar /></el-icon>
            <span>出勤统计概览</span>
            <span class="time-range">{{ formatDateRange() }}</span>
          </div>
        </template>
        
        <div class="overview-stats">
          <div class="stat-item">
            <div class="stat-value">{{ attendanceStats.totalDays }}</div>
            <div class="stat-label">统计天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ attendanceStats.avgAttendance }}%</div>
            <div class="stat-label">平均出勤率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ attendanceStats.totalMembers }}</div>
            <div class="stat-label">小组成员</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ attendanceStats.currentOnline }}</div>
            <div class="stat-label">当前在线</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 成员出勤统计 -->
    <div class="member-attendance">
      <el-card class="attendance-card">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>成员出勤统计</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索成员"
                size="small"
                style="width: 200px"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </template>
        
        <el-table :data="filteredAttendanceData" stripe v-loading="loading">
          <el-table-column type="index" label="排名" width="60" />
          <el-table-column label="成员信息" width="180">
            <template #default="scope">
              <div class="member-cell">
                <el-avatar :size="32" :src="scope.row.avatar">
                  {{ scope.row.name.charAt(0) }}
                </el-avatar>
                <div class="member-info">
                  <div class="name">{{ scope.row.name }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="attendanceDays" label="出勤天数" width="120" sortable>
            <template #default="scope">
              <span class="attendance-days">{{ scope.row.attendanceDays }}</span>
              <span class="total-days">/ {{ attendanceStats.totalDays }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="attendanceRate" label="出勤率" width="180" sortable>
            <template #default="scope">
              <el-progress 
                :percentage="scope.row.attendanceRate" 
                :color="getAttendanceColor(scope.row.attendanceRate)"
                :stroke-width="12"
                :show-text="false"
              />
              <span class="rate-text">{{ scope.row.attendanceRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalHours" label="累计时长" width="120" sortable>
            <template #default="scope">
              <span class="total-hours">{{ scope.row.totalHours }}小时</span>
            </template>
          </el-table-column>
          <el-table-column prop="avgDailyHours" label="日均时长" width="120" sortable>
            <template #default="scope">
              <span class="avg-hours">{{ scope.row.avgDailyHours }}小时</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastCheckIn" label="最后打卡" width="160">
            <template #default="scope">
              <span v-if="scope.row.lastCheckIn">{{ formatDateTime(scope.row.lastCheckIn) }}</span>
              <span v-else class="no-checkin">未打卡</span>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredAttendanceData.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh, Calendar, Clock, User, Position, Search
} from '@element-plus/icons-vue'

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  },
  groupData: {
    type: Object,
    default: () => ({})
  }
})

// 响应式数据
const dateRange = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
let updateTimer = null

// 出勤统计数据
const attendanceStats = reactive({
  totalDays: 0,
  avgAttendance: 0,
  totalMembers: 0,
  currentOnline: 0
})

// 当前正在打卡的成员
const currentCheckInMembers = ref([])

// 成员出勤数据
const attendanceData = ref([])

// 计算属性
const filteredAttendanceData = computed(() => {
  let result = attendanceData.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(member =>
      member.name.toLowerCase().includes(keyword) ||
      member.studentId.includes(keyword)
    )
  }
  
  return result
})

// 方法
const formatDateRange = () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return '未选择时间范围'
  }
  return `${dateRange.value[0]} 至 ${dateRange.value[1]}`
}

const formatTime = (timeStr) => {
  if (!timeStr) return '未知'
  return new Date(timeStr).toLocaleTimeString()
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '未打卡'
  return new Date(dateTimeStr).toLocaleString()
}

const calculateDuration = (startTime) => {
  if (!startTime) return '0分钟'
  
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now - start
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}小时${diffMinutes}分钟`
  } else {
    return `${diffMinutes}分钟`
  }
}

const getAttendanceColor = (rate) => {
  if (rate >= 90) return '#67c23a'
  if (rate >= 80) return '#e6a23c'
  if (rate >= 60) return '#f56c6c'
  return '#909399'
}

const handleDateRangeChange = (range) => {
  console.log('时间范围变化:', range)
  fetchAttendanceData()
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const refreshData = async () => {
  await Promise.all([
    fetchAttendanceData(),
    fetchCurrentCheckInMembers()
  ])
  ElMessage.success('数据已刷新')
}

const fetchAttendanceData = async () => {
  loading.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 计算统计天数
    const days = dateRange.value && dateRange.value.length === 2 
      ? Math.ceil((new Date(dateRange.value[1]) - new Date(dateRange.value[0])) / (1000 * 60 * 60 * 24)) + 1
      : 7
    
    // 更新统计数据
    Object.assign(attendanceStats, {
      totalDays: days,
      avgAttendance: 85,
      totalMembers: 25,
      currentOnline: 8
    })
    
    // 模拟成员出勤数据
    attendanceData.value = []
    for (let i = 1; i <= 25; i++) {
      const attendanceDays = Math.floor(Math.random() * days) + Math.floor(days * 0.3)
      const attendanceRate = Math.round((attendanceDays / days) * 100)
      const totalHours = Math.round((attendanceDays * (2 + Math.random() * 6)) * 10) / 10
      const avgDailyHours = attendanceDays > 0 ? Math.round((totalHours / attendanceDays) * 10) / 10 : 0
      
      const isOnline = Math.random() < 0.3 // 30%的概率在线
      const lastCheckIn = attendanceDays > 0 
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        : null
      
      attendanceData.value.push({
        id: i,
        name: `学生${i}`,
        studentId: `202100${i.toString().padStart(2, '0')}`,
        avatar: '',
        attendanceDays,
        attendanceRate,
        totalHours,
        avgDailyHours,
        lastCheckIn,
        isOnline
      })
    }
    
    // 按出勤率排序
    attendanceData.value.sort((a, b) => b.attendanceRate - a.attendanceRate)
    
  } catch (error) {
    console.error('获取出勤数据失败:', error)
    ElMessage.error('获取出勤数据失败')
  } finally {
    loading.value = false
  }
}

const fetchCurrentCheckInMembers = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟当前打卡成员数据
    const onlineMembers = attendanceData.value.filter(member => member.isOnline)
    
    currentCheckInMembers.value = onlineMembers.slice(0, 8).map(member => ({
      id: member.id,
      name: member.name,
      studentId: member.studentId,
      avatar: member.avatar,
      checkInTime: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString() // 0-4小时前开始打卡
    }))
    
    // 更新当前在线人数
    attendanceStats.currentOnline = currentCheckInMembers.value.length
    
  } catch (error) {
    console.error('获取当前打卡成员失败:', error)
  }
}

const updateCurrentMembers = () => {
  // 定期更新当前打卡成员的持续时长
  currentCheckInMembers.value.forEach(member => {
    // 这里可以添加更新逻辑，比如检查是否有新的成员加入或离开
  })
}

// 生命周期
onMounted(async () => {
  // 设置默认时间范围为最近7天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 6) // 包含今天共7天
  dateRange.value = [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ]
  
  await Promise.all([
    fetchAttendanceData(),
    fetchCurrentCheckInMembers()
  ])
  
  // 设置定时器，每30秒更新一次当前打卡成员信息
  updateTimer = setInterval(() => {
    fetchCurrentCheckInMembers()
  }, 30000)
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style scoped>
.group-activity {
  max-width: 100%;
  padding: 0;
}

.time-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.attendance-overview {
  margin-bottom: 24px;
}

.overview-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.time-range {
  margin-left: auto;
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.current-checkin {
  margin-bottom: 24px;
}

.checkin-card {
  border-radius: 12px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.checkin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 16px 0;
  max-height: 300px;
  overflow-y: auto;
}

.checkin-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: #F0F9EB; /* 更淡的透明绿色 */
  border: 2px solid #67C23A; /* 明亮的绿色边框 */
  border-radius: 12px;
  color: #67C23A;
  text-align: center;
  min-height: 160px;
  justify-content: space-between;
  box-shadow: 0 2px 8px 0 rgba(26, 217, 138, 0.06);
}

.member-avatar {
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.checkin-box .member-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  line-height: 1.2;
}

.checkin-duration {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  opacity: 0.9;
}

.checkin-start-time {
  font-size: 12px;
  opacity: 0.8;
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.checkin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #ebeef5;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.member-details {
  flex: 1;
}

.member-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.member-id {
  font-size: 12px;
  color: #909399;
}

.checkin-status {
  text-align: right;
}

.checkin-time,
.duration {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.member-attendance {
  margin-bottom: 24px;
}

.attendance-card {
  border-radius: 12px;
}

.header-actions {
  margin-left: auto;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-info .name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.member-info .student-id {
  font-size: 12px;
  color: #909399;
}

.attendance-days {
  font-weight: 600;
  color: #67c23a;
}

.total-days {
  color: #909399;
  font-size: 12px;
}

.rate-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-left: 8px;
}

.total-hours,
.avg-hours {
  font-weight: 500;
  color: #303133;
}

.no-checkin {
  color: #909399;
  font-style: italic;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .time-selector {
    flex-direction: column;
    gap: 16px;
  }
  
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .checkin-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .checkin-box {
    min-height: 140px;
    padding: 12px 6px;
  }
  
  .checkin-box .member-name {
    font-size: 13px;
  }
  
  .checkin-duration {
    font-size: 12px;
  }
  
  .checkin-start-time {
    font-size: 11px;
  }
  
  .checkin-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .checkin-status {
    text-align: left;
    width: 100%;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .time-range {
    margin-left: 0;
  }
  
  .header-actions {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .overview-stats {
    grid-template-columns: 1fr;
  }
  
  .checkin-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .member-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* 自定义滚动条 */
.checkin-list::-webkit-scrollbar,
.checkin-grid::-webkit-scrollbar {
  width: 6px;
}

.checkin-list::-webkit-scrollbar-track,
.checkin-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.checkin-list::-webkit-scrollbar-thumb,
.checkin-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.checkin-list::-webkit-scrollbar-thumb:hover,
.checkin-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 进度条颜色 */
:deep(.el-progress-bar__outer) {
  border-radius: 4px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 4px;
}
</style>
