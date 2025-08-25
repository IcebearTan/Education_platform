<template>
  <div class="teaching-analytics">
    <!-- 时间范围选择 -->
    <div class="time-selector">
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm:ss"
        @change="handleDateRangeChange"
      />
      <el-button @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-section">
      <div class="metric-card">
        <div class="metric-icon">
          <el-icon size="24"><User /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ analytics.totalStudents }}</div>
          <div class="metric-label">总学生数</div>
          <div class="metric-trend">
            <span :class="getTrendClass(analytics.studentTrend)">
              {{ analytics.studentTrend > 0 ? '+' : '' }}{{ analytics.studentTrend }}%
            </span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <el-icon size="24"><Document /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ analytics.totalTasks }}</div>
          <div class="metric-label">发布任务</div>
          <div class="metric-trend">
            <span :class="getTrendClass(analytics.taskTrend)">
              {{ analytics.taskTrend > 0 ? '+' : '' }}{{ analytics.taskTrend }}%
            </span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <el-icon size="24"><Check /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ analytics.avgCompletion }}%</div>
          <div class="metric-label">平均完成率</div>
          <div class="metric-trend">
            <span :class="getTrendClass(analytics.completionTrend)">
              {{ analytics.completionTrend > 0 ? '+' : '' }}{{ analytics.completionTrend }}%
            </span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <el-icon size="24"><Star /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ analytics.avgScore }}</div>
          <div class="metric-label">平均成绩</div>
          <div class="metric-trend">
            <span :class="getTrendClass(analytics.scoreTrend)">
              {{ analytics.scoreTrend > 0 ? '+' : '' }}{{ analytics.scoreTrend }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <h3>学习活跃度趋势</h3>
          <el-select v-model="activityPeriod" @change="updateActivityChart">
            <el-option label="最近7天" value="week" />
            <el-option label="最近30天" value="month" />
            <el-option label="最近90天" value="quarter" />
          </el-select>
        </div>
        <div ref="activityChartRef" class="chart-content"></div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>任务完成情况</h3>
        </div>
        <div ref="taskChartRef" class="chart-content"></div>
      </div>
    </div>

    <!-- 详细分析 -->
    <div class="analysis-section">
      <!-- 学生表现排行 -->
      <div class="analysis-card">
        <h3>学生表现排行</h3>
        <div class="ranking-list">
          <div v-for="(student, index) in topStudents" :key="student.id" class="ranking-item">
            <div class="rank-number">{{ index + 1 }}</div>
            <el-avatar :size="32" :src="student.avatar">{{ student.name.charAt(0) }}</el-avatar>
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-score">平均分：{{ student.avgScore }}</div>
            </div>
            <div class="student-stats">
              <el-tag type="success">{{ student.completedTasks }}个任务</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务分析 -->
      <div class="analysis-card">
        <h3>任务完成分析</h3>
        <div class="task-analysis">
          <div class="analysis-item">
            <div class="analysis-label">最受欢迎任务</div>
            <div class="analysis-value">{{ analytics.popularTask }}</div>
          </div>
          <div class="analysis-item">
            <div class="analysis-label">平均完成时间</div>
            <div class="analysis-value">{{ analytics.avgCompletionTime }}小时</div>
          </div>
          <div class="analysis-item">
            <div class="analysis-label">最难任务</div>
            <div class="analysis-value">{{ analytics.hardestTask }}</div>
          </div>
          <div class="analysis-item">
            <div class="analysis-label">提交率</div>
            <div class="analysis-value">{{ analytics.submissionRate }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出功能 -->
    <div class="export-section">
      <el-button type="primary" @click="exportReport">
        <el-icon><Download /></el-icon>
        导出分析报告
      </el-button>
      <el-button @click="exportRawData">
        <el-icon><DocumentCopy /></el-icon>
        导出原始数据
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh, User, Document, Check, Star,
  Download, DocumentCopy
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
const activityPeriod = ref('week')
const activityChartRef = ref()
const taskChartRef = ref()

// 分析数据
const analytics = reactive({
  totalStudents: 0,
  studentTrend: 0,
  totalTasks: 0,
  taskTrend: 0,
  avgCompletion: 0,
  completionTrend: 0,
  avgScore: 0,
  scoreTrend: 0,
  popularTask: '',
  avgCompletionTime: 0,
  hardestTask: '',
  submissionRate: 0
})

const topStudents = ref([])

// 方法
const getTrendClass = (trend) => {
  if (trend > 0) return 'trend-up'
  if (trend < 0) return 'trend-down'
  return 'trend-neutral'
}

const handleDateRangeChange = (range) => {
  console.log('时间范围变化:', range)
  fetchAnalyticsData()
}

const updateActivityChart = () => {
  console.log('更新活跃度图表，周期:', activityPeriod.value)
  initActivityChart()
}

const refreshData = async () => {
  await fetchAnalyticsData()
  ElMessage.success('数据已刷新')
}

const exportReport = () => {
  ElMessage.info('导出分析报告功能开发中')
}

const exportRawData = () => {
  ElMessage.info('导出原始数据功能开发中')
}

const fetchAnalyticsData = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    Object.assign(analytics, {
      totalStudents: 25,
      studentTrend: 8.5,
      totalTasks: 12,
      taskTrend: 15.2,
      avgCompletion: 78,
      completionTrend: 5.3,
      avgScore: 84,
      scoreTrend: -2.1,
      popularTask: '数学作业第一章',
      avgCompletionTime: 2.5,
      hardestTask: '物理实验报告',
      submissionRate: 92
    })
    
    topStudents.value = [
      {
        id: 1,
        name: '赵六',
        avatar: '',
        avgScore: 95,
        completedTasks: 12
      },
      {
        id: 2,
        name: '张三',
        avatar: '',
        avgScore: 88,
        completedTasks: 11
      },
      {
        id: 3,
        name: '李四',
        avatar: '',
        avgScore: 85,
        completedTasks: 10
      },
      {
        id: 4,
        name: '王五',
        avatar: '',
        avgScore: 78,
        completedTasks: 8
      }
    ]
    
  } catch (error) {
    console.error('获取分析数据失败:', error)
    ElMessage.error('获取分析数据失败')
  }
}

const initActivityChart = async () => {
  await nextTick()
  
  if (!activityChartRef.value) return
  
  // 这里应该使用图表库如ECharts初始化图表
  // 由于没有引入图表库，这里只是示例
  activityChartRef.value.innerHTML = `
    <div style="height: 300px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; border-radius: 8px; color: #909399;">
      <div style="text-align: center;">
        <p>活跃度趋势图</p>
        <p style="font-size: 12px;">需要集成图表库（如ECharts）来显示真实图表</p>
      </div>
    </div>
  `
}

const initTaskChart = async () => {
  await nextTick()
  
  if (!taskChartRef.value) return
  
  // 这里应该使用图表库如ECharts初始化图表
  taskChartRef.value.innerHTML = `
    <div style="height: 300px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; border-radius: 8px; color: #909399;">
      <div style="text-align: center;">
        <p>任务完成情况图</p>
        <p style="font-size: 12px;">需要集成图表库（如ECharts）来显示真实图表</p>
      </div>
    </div>
  `
}

// 生命周期
onMounted(async () => {
  // 设置默认时间范围为最近30天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  dateRange.value = [
    start.toISOString().slice(0, 19).replace('T', ' '),
    end.toISOString().slice(0, 19).replace('T', ' ')
  ]
  
  await fetchAnalyticsData()
  await initActivityChart()
  await initTaskChart()
})
</script>

<style scoped>
.teaching-analytics {
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

.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.metric-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-trend {
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.trend-neutral {
  color: #909399;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #303133;
}

.chart-content {
  height: 300px;
}

.analysis-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.analysis-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analysis-card h3 {
  margin: 0 0 20px 0;
  color: #303133;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 32px;
  height: 32px;
  background: #409EFF;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
}

.student-info {
  flex: 1;
  margin-left: 12px;
}

.student-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.student-score {
  font-size: 12px;
  color: #909399;
}

.task-analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.analysis-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.analysis-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.analysis-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.export-section {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .time-selector {
    flex-direction: column;
    gap: 16px;
  }
  
  .metrics-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-section,
  .analysis-section {
    grid-template-columns: 1fr;
  }
  
  .task-analysis {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .export-section {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .metrics-section {
    grid-template-columns: 1fr;
  }
  
  .task-analysis {
    grid-template-columns: 1fr;
  }
}
</style>
