<template>
  <div class="attendance-statistics">
    <!-- 日期选择器 -->
    <div class="date-selector">
      <div class="date-inputs">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          :clearable="false"
          :shortcuts="dateShortcuts"
          :disabled-date="disabledDate"
        />
        <el-button type="primary" @click="fetchAttendanceData" :loading="isLoading" :disabled="!dateRange || dateRange.length !== 2">
          查询
        </el-button>
      </div>
    </div>

    <!-- 总览统计 -->
    <div class="overview-stats">
      <div class="stat-item">
        <div class="stat-label">总出勤天数</div>
        <div class="stat-value">{{ totalAttendanceDays }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">平均准时率</div>
        <div class="stat-value">{{ averageAttendanceRate }}%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">总出勤时长</div>
        <div class="stat-value">{{ totalHours }}h</div>
      </div>
    </div>

    <!-- 出勤排行榜 -->
    <div class="attendance-ranking">
      <div class="ranking-header">
        <h3>出勤排行榜</h3>
        <div class="sort-options">
          <el-button
            :type="sortBy === 'attendanceDays' ? 'primary' : 'default'"
            size="small"
            @click="sortBy = 'attendanceDays'"
          >
            按出勤天数
          </el-button>
          <el-button
            :type="sortBy === 'onTimeRate' ? 'primary' : 'default'"
            size="small"
            @click="sortBy = 'onTimeRate'"
          >
            按按时率
          </el-button>
          <el-button
            :type="sortBy === 'totalHours' ? 'primary' : 'default'"
            size="small"
            @click="sortBy = 'totalHours'"
          >
            按总时长
          </el-button>
        </div>
      </div>

      <div v-if="isLoading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="errorMessage" class="error-state">
        <el-empty :description="errorMessage">
          <el-button type="primary" @click="fetchAttendanceData" :loading="isLoading">
            重新查询
          </el-button>
        </el-empty>
      </div>

      <div v-else-if="sortedAttendanceList.length === 0" class="empty-data">
        <el-empty description="暂无出勤数据">
          <el-button type="primary" @click="fetchAttendanceData" :loading="isLoading">
            重新查询
          </el-button>
        </el-empty>
      </div>

      <div v-else class="ranking-list">
        <div
          v-for="(student, index) in sortedAttendanceList"
          :key="student.userId"
          class="ranking-item"
        >
          <div class="ranking-header-row" @click="toggleExpand(student.userId)">
            <div class="rank-info">
              <div class="rank-number" :class="getRankClass(index)">
                {{ index + 1 }}
              </div>
              <el-avatar :size="40" :src="userAvatars[student.userId] || defaultAvatarUrl" />
              <div class="student-info">
                <div class="student-name">{{ student.username }}</div>
                <div class="student-stats">
                  <span class="stat-item">
                    <el-icon><Calendar /></el-icon>
                    {{ student.attendanceDays }}天
                  </span>
                  <span class="stat-item">
                    <el-icon><Clock /></el-icon>
                    {{ student.onTimeRate }}%
                  </span>
                  <span class="stat-item">
                    <el-icon><Timer /></el-icon>
                    {{ student.totalHours }}h
                  </span>
                </div>
              </div>
            </div>
            <div class="expand-icon">
              <el-icon :class="{ 'expanded': expandedStudents.includes(student.userId) }">
                <ArrowDown />
              </el-icon>
            </div>
          </div>

          <!-- 展开的每日出勤详情 -->
          <el-collapse-transition>
            <div v-if="expandedStudents.includes(student.userId)" class="daily-details">
              <div v-if="student.dailyAttendance.length === 0" class="no-records">
                <div class="no-records-text">该时间段内无出勤记录</div>
              </div>
              <div v-else>
                <div class="details-header">
                  <span>日期</span>
                  <span>签到时间</span>
                  <span>签退时间</span>
                  <span>时长</span>
                  <span>状态</span>
                </div>
                <div
                  v-for="day in student.dailyAttendance"
                  :key="day.date"
                  class="detail-row"
                  :class="{ 'late': day.isLate, 'insufficient': !day.isQualified }"
                >
                  <span class="date">{{ formatDate(day.date) }}</span>
                  <span class="check-in">{{ day.checkInTime || '--' }}</span>
                  <span class="check-out">{{ day.checkOutTime || '--' }}</span>
                  <span class="duration">{{ day.duration }}h</span>
                  <span class="status">
                    <el-tag
                      v-if="day.isLate"
                      type="warning"
                      size="small"
                      effect="light"
                    >
                      迟到
                    </el-tag>
                    <el-tag
                      v-if="!day.isQualified"
                      type="danger"
                      size="small"
                      effect="light"
                    >
                      时长不足
                    </el-tag>
                    <el-tag
                      v-if="!day.isLate && day.isQualified"
                      type="success"
                      size="small"
                      effect="light"
                    >
                      正常
                    </el-tag>
                  </span>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElDatePicker, ElButton, ElAvatar, ElIcon, ElTag, ElSkeleton, ElEmpty, ElCollapseTransition, ElMessage } from 'element-plus'
import { Calendar, Clock, Timer, ArrowDown } from '@element-plus/icons-vue'
import api from '../../api'

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  }
})

// 响应式数据
const isLoading = ref(false)
const dateRange = ref([])
const attendanceData = ref([])
const expandedStudents = ref([])
const sortBy = ref('attendanceDays') // 排序方式：attendanceDays, onTimeRate, totalHours
const errorMessage = ref('') // 错误信息
const userAvatars = ref({}) // 存储用户头像 { [user_id]: avatarUrl }
const defaultAvatarUrl = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' // 默认头像路径

// 初始化日期范围（最近7天）
const initDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 6) // 最近7天数据
  
  dateRange.value = [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ]
}

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '昨天',
    value: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return [yesterday, yesterday]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return [start, end]
    }
  }
]

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 处理日期变化
const handleDateChange = (dates) => {
  if (dates && dates.length === 2) {
    const startDate = new Date(dates[0])
    const endDate = new Date(dates[1])
    const today = new Date()
    
    // 验证日期范围
    if (startDate > today) {
      ElMessage.warning('开始日期不能超过今天')
      return
    }
    
    if (endDate > today) {
      ElMessage.warning('结束日期不能超过今天')
      return
    }
    
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 31) {
      ElMessage.warning('查询时间范围不能超过31天')
      return
    }
    
    dateRange.value = dates
  }
}

// 获取用户头像
const getUserAvatar = async (userId) => {
  try {
    const res = await api({
      url: `/user/user_avatars_id`,
      method: 'get',
      params: {
        User_Id: userId
      }
    })

    if (res.data.code === 200 && res.data.User_Avatar) {
      userAvatars.value[userId] = 'data:image/jpeg;base64,' + res.data.User_Avatar
    } else {
      userAvatars.value[userId] = defaultAvatarUrl // 使用默认头像
    }
  } catch (err) {
    console.error('获取用户头像失败:', err)
    userAvatars.value[userId] = defaultAvatarUrl // 使用默认头像
  }
}

// 获取出勤数据
const fetchAttendanceData = async () => {
  if (!props.groupId || !dateRange.value || dateRange.value.length !== 2) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await api({
      url: '/user/group/attendence_by_date',
      method: 'post',
      data: {
        group_id: parseInt(props.groupId),
        startdate: dateRange.value[0],
        enddate: dateRange.value[1]
      }
    })

    if (response.data.code === 200) {
      if (response.data.data && response.data.data.members && Array.isArray(response.data.data.members)) {
        attendanceData.value = processAttendanceData(response.data.data.members)
        
        // 获取所有学生的头像
        attendanceData.value.forEach(student => {
          getUserAvatar(student.userId)
        })
        
        // 不再判断 length === 0，因为即使没有出勤数据也要显示学生列表
      } else {
        console.warn('API返回数据格式异常:', response.data)
        attendanceData.value = []
        errorMessage.value = '数据格式异常，请联系管理员'
      }
    } else {
      attendanceData.value = []
      errorMessage.value = response.data.message || '获取出勤数据失败'
    }
  } catch (error) {
    console.error('获取出勤数据失败:', error)
    attendanceData.value = []
    errorMessage.value = '网络请求失败，请检查网络连接后重试'
  } finally {
    isLoading.value = false
  }
}

// 处理出勤数据
const processAttendanceData = (data) => {
  if (!data || !Array.isArray(data)) {
    console.warn('出勤数据格式错误:', data)
    return []
  }

  return data.map(student => {
    // 确保必要字段存在
    if (!student.student_id || !student.student_name) {
      console.warn('学生数据格式错误:', student)
      return null
    }

    // 处理日常出勤记录，如果没有记录则为空数组
    const dailyAttendance = (student.daily_attendance || []).map(day => {
      // 解析时长字符串 "0小时1分钟" 格式
      const duration = parseDurationChinese(day.total_checkin_duration)
      const checkInTime = day.earliest_checkin_time
      const checkOutTime = day.latest_checkout_time
      const isLate = checkInTime && checkInTime > '08:45:00'
      const isQualified = duration >= 3 // 3小时为达标

      return {
        date: day.date,
        checkInTime: checkInTime ? checkInTime.substring(0, 5) : null,
        checkOutTime: checkOutTime ? checkOutTime.substring(0, 5) : null,
        duration: duration.toFixed(1),
        isLate,
        isQualified
      }
    })

    // 计算统计数据
    const attendanceDays = student.check_days || dailyAttendance.filter(day => day.checkInTime).length
    const onTimeDays = dailyAttendance.filter(day => day.checkInTime && !day.isLate).length
    const onTimeRate = attendanceDays > 0 ? ((onTimeDays / attendanceDays) * 100).toFixed(1) : 0
    const totalHours = dailyAttendance.reduce((sum, day) => sum + parseFloat(day.duration), 0).toFixed(1)

    return {
      userId: student.student_id,
      username: student.student_name,
      avatar: defaultAvatarUrl, // 初始使用默认头像，后续会通过API获取
      attendanceDays,
      onTimeRate: parseFloat(onTimeRate),
      totalHours: parseFloat(totalHours),
      dailyAttendance
    }
  }).filter(student => student !== null) // 过滤掉格式错误的数据
}

// 解析中文时长字符串 "0小时1分钟" 格式
const parseDurationChinese = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') return 0
  
  // 匹配 "X小时Y分钟" 格式
  const hourMatch = durationStr.match(/(\d+)小时/)
  const minuteMatch = durationStr.match(/(\d+)分钟/)
  
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
  
  return hours + minutes / 60
}

// 解析时长字符串
const parseDuration = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') return 0
  
  // 支持多种格式：HH:MM:SS 或 HH:MM 或纯数字
  const parts = durationStr.split(':')
  if (parts.length >= 2) {
    const hours = parseInt(parts[0]) || 0
    const minutes = parseInt(parts[1]) || 0
    const seconds = parts.length > 2 ? parseInt(parts[2]) || 0 : 0
    return hours + minutes / 60 + seconds / 3600
  } else if (parts.length === 1) {
    // 如果只有一个数字，假设是小时
    return parseFloat(parts[0]) || 0
  }
  return 0
}

// 排序后的出勤列表
const sortedAttendanceList = computed(() => {
  const list = [...attendanceData.value]
  
  switch (sortBy.value) {
    case 'attendanceDays':
      return list.sort((a, b) => b.attendanceDays - a.attendanceDays)
    case 'onTimeRate':
      return list.sort((a, b) => b.onTimeRate - a.onTimeRate)
    case 'totalHours':
      return list.sort((a, b) => b.totalHours - a.totalHours)
    default:
      return list
  }
})

// 总览统计
const totalAttendanceDays = computed(() => {
  return attendanceData.value.reduce((sum, student) => sum + student.attendanceDays, 0)
})

const averageAttendanceRate = computed(() => {
  if (attendanceData.value.length === 0) return 0
  const totalRate = attendanceData.value.reduce((sum, student) => sum + student.onTimeRate, 0)
  return (totalRate / attendanceData.value.length).toFixed(1)
})

const totalHours = computed(() => {
  const total = attendanceData.value.reduce((sum, student) => sum + student.totalHours, 0)
  return total.toFixed(1)
})

// 切换展开状态
const toggleExpand = (userId) => {
  const index = expandedStudents.value.indexOf(userId)
  if (index > -1) {
    expandedStudents.value.splice(index, 1)
  } else {
    expandedStudents.value.push(userId)
  }
}

// 获取排名样式
const getRankClass = (index) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 判断是否是今天、昨天
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

// 监听排序方式变化
watch(sortBy, () => {
  // 排序变化时可以添加动画效果
})

// 监听groupId变化
watch(() => props.groupId, (newGroupId) => {
  if (newGroupId) {
    // 重置数据
    attendanceData.value = []
    expandedStudents.value = []
    errorMessage.value = ''
    fetchAttendanceData()
  }
})

// 监听日期范围变化，自动查询
watch(dateRange, (newRange) => {
  if (newRange && newRange.length === 2 && props.groupId) {
    // 防抖处理，避免频繁请求
    clearTimeout(window.dateChangeTimer)
    window.dateChangeTimer = setTimeout(() => {
      fetchAttendanceData()
    }, 500)
  }
})

// 初始化
onMounted(() => {
  initDateRange()
  if (props.groupId) {
    fetchAttendanceData()
  }
})
</script>

<style scoped>
.attendance-statistics {
  padding: 20px;
  background: #f8f9fa;
}

/* 日期选择器 */
.date-selector {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.date-inputs {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 总览统计 */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
}

/* 排行榜 */
.attendance-ranking {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ranking-header h3 {
  margin: 0;
  color: #333;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.loading {
  margin: 20px 0;
}

.error-state,
.empty-data {
  text-align: center;
  padding: 40px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 4px;
}

.ranking-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.ranking-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: white;
  transition: background 0.2s;
}

.ranking-header-row:hover {
  background: #f8f9fa;
}

.ranking-header-row:active {
  background: #e9ecef;
  transform: translateY(1px);
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  background: #f0f2f5;
  color: #666;
}

.rank-number.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: white;
}

.rank-number.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #e2e8f0);
  color: white;
}

.rank-number.rank-third {
  background: linear-gradient(135deg, #cd7f32, #f6ad55);
  color: white;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.student-stats {
  display: flex;
  gap: 16px;
}

.student-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.expand-icon {
  transition: transform 0.3s;
}

.expand-icon .expanded {
  transform: rotate(180deg);
}

/* 每日详情 */
.daily-details {
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
}

.details-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  font-weight: 600;
  color: #666;
  font-size: 12px;
  background: #eff3f9;
  border-bottom: 1px solid #e4e7ed;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 10px 16px;
  font-size: 12px;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.2s;
}

.detail-row:hover {
  background: white;
}

.detail-row.late {
  background: #fef5e7;
}

.detail-row.insufficient {
  background: #fef2f2;
}

.date {
  font-weight: 600;
  color: #333;
}

.check-in,
.check-out {
  color: #666;
}

.duration {
  font-weight: 600;
  color: #409eff;
}

.status {
  display: flex;
  gap: 4px;
}

.no-records {
  padding: 40px 20px;
  text-align: center;
  background: #f8f9fa;
}

.no-records-text {
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .attendance-statistics {
    padding: 12px;
  }
  
  .date-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-inputs .el-date-editor {
    width: 100%;
  }
  
  .overview-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .ranking-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .ranking-header h3 {
    font-size: 18px;
  }
  
  .sort-options {
    flex-wrap: wrap;
    width: 100%;
  }
  
  .sort-options .el-button {
    flex: 1;
    min-width: 0;
  }
  
  .ranking-header-row {
    padding: 12px;
  }
  
  .rank-info {
    gap: 12px;
  }
  
  .student-info {
    min-width: 0;
  }
  
  .student-name {
    font-size: 14px;
  }
  
  .student-stats {
    flex-direction: column;
    gap: 4px;
  }
  
  .student-stats .stat-item {
    padding: 2px 0;
    font-size: 11px;
  }
  
  .details-header,
  .detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .details-header {
    display: none; /* 隐藏表头 */
  }
  
  .detail-row {
    display: block;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f2f5;
  }
  
  .detail-row .date:before {
    content: "日期: ";
    font-weight: 600;
    color: #666;
  }
  
  .detail-row .check-in:before {
    content: "签到: ";
    font-weight: 600;
    color: #666;
  }
  
  .detail-row .check-out:before {
    content: "签退: ";
    font-weight: 600;
    color: #666;
  }
  
  .detail-row .duration:before {
    content: "时长: ";
    font-weight: 600;
    color: #666;
  }
  
  .detail-row .status:before {
    content: "状态: ";
    font-weight: 600;
    color: #666;
  }
  
  .detail-row span {
    display: block;
    margin-bottom: 4px;
  }
  
  .detail-row .status {
    margin-top: 8px;
  }
}
</style>
