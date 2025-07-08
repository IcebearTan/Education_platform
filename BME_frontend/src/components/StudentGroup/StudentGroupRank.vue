<template>
  <div class="group-rank-container">
    <!-- 固定头部 - Tab 切换按钮 -->
    <div class="tab-header">
      <div class="tab-switch">
        <button
          :class="['tab-btn', { active: activeTab === 'progress' }]"
          @click="activeTab = 'progress'"
        >学习进度排行榜</button>
        <button
          :class="['tab-btn', { active: activeTab === 'attendance' }]"
          @click="activeTab = 'attendance'"
        >出勤情况统计</button>
      </div>
    </div>

    <!-- 可滚动内容区域 -->
    <div class="content-container">
      <!-- 学习进度排行榜 -->
      <div v-if="activeTab === 'progress'" class="progress-section">
        <div v-if="isLoading" class="loading-message">加载中...</div>
        <div v-else-if="progressList.length === 0" class="empty-message">暂无数据</div>
        <div v-else class="progress-list">
          <div
            v-for="(user, idx) in progressList"
            :key="user.id"
            class="progress-item"
            :style="{
              background: `linear-gradient(90deg, #e3f1ff ${progressFill[idx]}%, #f7faff ${progressFill[idx]}%)`
            }"
          >
            <div class="rank-num" :class="['rank-' + (idx + 1)]">{{ idx + 1 }}</div>
            <el-avatar :size="32" :src="user.avatar" />
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="progress-detail">
                <div class="course-info">{{ user.courseName }}</div>
                <div class="chapter-info" v-if="user.chapterName">
                  第{{ user.chapter }}章 {{ user.chapterName }}
                </div>
                <div class="section-info" v-if="user.sectionName">
                  {{ user.sectionName }}
                </div>
              </div>
            </div>
            <div class="progress-value">{{ user.progress }}%</div>
          </div>
        </div>
      </div>

      <!-- 出勤情况统计 -->
      <div v-if="activeTab === 'attendance'" class="attendance-section">
        <div class="attendance-summary">
          <div class="summary-item">
            <div class="summary-label">昨日出勤总时长</div>
            <div class="summary-value">{{ totalYesterdayHours }} 小时</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">总出勤次数</div>
            <div class="summary-value">{{ totalAttendanceDays }}</div>
          </div>
        </div>
        <div class="attendance-list">
          <div
            v-for="(user, idx) in attendanceList"
            :key="user.id"
            class="attendance-item"
            :class="{ 'attendance-full': user.yesterdayHours >= 3, 'attendance-unfull': user.yesterdayHours < 3 }"
            :style="user.yesterdayHours >= 3
              ? { background: 'linear-gradient(90deg, #67c23a 100%, #f7faff 0%)' }
              : { background: `linear-gradient(90deg, #e6f7e6 ${attendanceFill[idx]}%, #f7faff ${attendanceFill[idx]}%)` }"
          >
            <el-avatar :size="28" :src="user.avatar" />
            <div class="user-name">{{ user.name }}</div>
            <div class="attendance-stats">
              <span class="attendance-hours">昨日 {{ user.yesterdayHours }} 小时</span>
              <span class="attendance-days">累计 {{ user.totalDays }} 次</span>
              <span v-if="user.yesterdayHours >= 3" class="attendance-status full">达标</span>
              <span v-else class="attendance-status unfull">未达标</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElAvatar } from 'element-plus'
import api from '../../api'

// 接收 Group_Id 参数
const props = defineProps({
  groupId: {
    type: String,
    required: true
  }
})

// Tab 切换
const activeTab = ref('progress')

// 动画进度百分比
const progressFill = ref([])
const attendanceFill = ref([])

// 学习进度数据（从接口获取）
const progressList = ref([])
const groupName = ref('')
const isLoading = ref(false)

// 静态出勤数据，增加昨日时长和总出勤次数
const attendanceList = ref([
  { id: 1, name: '张三', avatar: '/src/assets/ice_bear_avatar.jpg', yesterdayHours: 2.5, totalDays: 18 },
  { id: 2, name: '李四', avatar: '/src/assets/Jerry_Scintilla_avatar.jpg', yesterdayHours: 1.8, totalDays: 16 },
  { id: 3, name: '王五', avatar: '/src/assets/ジエ_avatar.png', yesterdayHours: 2.0, totalDays: 15 },
  { id: 4, name: '赵六', avatar: '/src/assets/LuMengXuan.jpg', yesterdayHours: 1.2, totalDays: 12 },
  { id: 5, name: '陈老师', avatar: '/src/assets/ChenMinJie.jpg', yesterdayHours: 3.0, totalDays: 20 },
])

// 获取学习进度数据
const fetchLearningProgress = async () => {
  if (!props.groupId) return
  
  isLoading.value = true
  try {
    const response = await api({
      url: '/learningProgress/group',
      method: 'get',
      params: { Group_Id: props.groupId }
    })
    
    if (response.data.code === 200) {
      groupName.value = response.data.data.group_name
      console.log('获取小组名称:', groupName.value)
      
      // 处理学习进度数据
      const processedData = response.data.data.result.map(user => {
        // 计算用户的总体进度
        let totalProgress = 0
        let totalChapters = 0
        let currentChapter = 0
        let currentSection = 0
        let latestCourse = null
        
        if (user.records && user.records.length > 0) {
          // 找到进度最高的课程记录
          const maxProgressRecord = user.records.reduce((prev, current) => 
            (prev.progress > current.progress) ? prev : current
          )
          
          latestCourse = maxProgressRecord
          currentChapter = maxProgressRecord.chapter_num || 0
          currentSection = maxProgressRecord.section_num || 0
          
          // 计算总体进度（所有课程的平均进度）
          const validRecords = user.records.filter(record => record.progress > 0)
          if (validRecords.length > 0) {
            totalProgress = validRecords.reduce((sum, record) => {
              const courseProgress = (record.progress / record.course_chapters) * 100
              return sum + courseProgress
            }, 0) / validRecords.length
          }
        }
        
        return {
          id: user.user_id,
          name: user.username,
          avatar: `/src/assets/ice_bear_avatar.jpg`, // 默认头像，可以根据需要修改
          progress: Math.round(totalProgress),
          chapter: currentChapter,
          section: currentSection,
          courseName: latestCourse?.course_name || '未开始学习',
          chapterName: latestCourse?.chapter_name || '',
          sectionName: latestCourse?.section_name || ''
        }
      })
      
      // 按进度排序
      progressList.value = processedData.sort((a, b) => b.progress - a.progress)
    }
  } catch (error) {
    console.error('获取学习进度失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 总出勤次数
const totalAttendanceDays = computed(() => attendanceList.value.reduce((sum, u) => sum + u.totalDays, 0))
// 昨日总出勤时长
const totalYesterdayHours = computed(() => attendanceList.value.reduce((sum, u) => sum + u.yesterdayHours, 0).toFixed(1))

// 动画填充函数
function animateFill(list, fillArr, getPercent) {
  fillArr.value.length = 0
  for (let i = 0; i < list.value.length; i++) fillArr.value.push(0)
  // 动画：所有条同时从0递增到目标值，速度从慢到快（ease-out）
  list.value.forEach((item, idx) => {
    const target = getPercent(item)
    let current = 0
    let frame = 0
    const totalFrames = 36 // 动画帧数
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 2)
    }
    const step = () => {
      frame++
      const percent = frame / totalFrames
      if (percent < 1) {
        current = Math.round(target * easeOut(percent))
        fillArr.value[idx] = current
        requestAnimationFrame(step)
      } else {
        fillArr.value[idx] = target
      }
    }
    requestAnimationFrame(step)
  })
}

onMounted(async () => {
  await fetchLearningProgress()
  animateFill(progressList, progressFill, u => u.progress)
  animateFill(attendanceList, attendanceFill, u => Math.round(u.yesterdayHours / 3 * 100))
})

watch(activeTab, (tab) => {
  if (tab === 'progress') {
    animateFill(progressList, progressFill, u => u.progress)
  } else {
    animateFill(attendanceList, attendanceFill, u => Math.round(u.yesterdayHours / 3 * 100))
  }
})

// 监听 groupId 变化
watch(() => props.groupId, async (newGroupId) => {
  if (newGroupId) {
    await fetchLearningProgress()
    if (activeTab.value === 'progress') {
      animateFill(progressList, progressFill, u => u.progress)
    }
  }
}, { immediate: false })
</script>

<style scoped>
.group-rank-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  border: none;
}

/* 固定头部容器 */
.tab-header {
  flex-shrink: 0;
  background: #fff;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  z-index: 10;
}

.tab-switch {
  display: flex;
  gap: 12px;
  margin: 0;
}

/* 可滚动内容容器 */
.content-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  background: #f8f9fa;
}
.tab-btn {
  flex: 1;
  background: #f7faff;
  border: none;
  border-radius: 8px 8px 0 0;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  outline: none;
}
.tab-btn.active {
  background: #fff;
  color: #409eff;
  box-shadow: 0 -2px 8px rgba(64,158,255,0.06);
  border-bottom: 2px solid #409eff;
  z-index: 1;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 18px;
  letter-spacing: 1px;
  text-align: left;
}
.progress-section, .attendance-section {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(64,158,255,0.06);
  border: 1px solid #f0f2f5;
  margin: 0 16px;
  min-height: 400px;
}
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.progress-item {
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, background 0.6s cubic-bezier(.4,1.6,.6,1);
  border: 1px solid #e6ecf3;
  /* 进度条背景已由行内 style 控制 */
}
.progress-item, .attendance-item {
  background: #f7faff;
}
.rank-num {
  width: 32px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  color: #bfc8d8;
  letter-spacing: 1px;
}
.rank-1 { color: #FFD700; text-shadow: 0 0 8px #fffbe6; }
.rank-2 { color: #C0C0C0; text-shadow: 0 0 8px #f5f5f5; }
.rank-3 { color: #CD7F32; text-shadow: 0 0 8px #fbeee0; }
.user-info {
  flex: 1;
  min-width: 0;
}
.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}
.progress-detail {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}

.course-info {
  font-size: 12px;
  color: #409eff;
  font-weight: 600;
  margin-bottom: 2px;
}

.chapter-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 1px;
}

.section-info {
  font-size: 11px;
  color: #999;
}

.loading-message, .empty-message {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
}
.attendance-section {
  margin-top: 0;
}
.attendance-summary {
  display: flex;
  gap: 32px;
  margin-bottom: 18px;
}
.summary-item {
  flex: 1;
  background: #f7faff;
  border-radius: 10px;
  padding: 12px 0;
  text-align: center;
  border: 1px solid #e6ecf3;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.summary-label {
  font-size: 15px;
  color: #888;
  margin-bottom: 4px;
}
.summary-value {
  font-size: 22px;
  font-weight: 800;
  color: #409eff;
  letter-spacing: 1px;
}
.attendance-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.attendance-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f7faff;
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  border: 1px solid #e6ecf3;
  transition: background 0.2s;
}
.attendance-item:hover {
  background: #eaf6ff;
}
.attendance-stats {
  display: flex;
  gap: 18px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-left: auto;
  align-items: center;
}
.attendance-hours {
  color: #67c23a;
}
.attendance-days {
  color: #409eff;
}
.attendance-status.full {
  color: #fff;
  background: #67c23a;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 13px;
  margin-left: 8px;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(103,194,58,0.08);
}
.attendance-status.unfull {
  color: #67c23a;
  background: #e6f7e6;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 13px;
  margin-left: 8px;
  font-weight: 700;
  border: 1px solid #67c23a;
}
.attendance-item.attendance-full {
  background: linear-gradient(90deg, #67c23a 100%, #f7faff 0%) !important;
  color: #fff;
}
.attendance-item.attendance-full .user-name,
.attendance-item.attendance-full .attendance-hours,
.attendance-item.attendance-full .attendance-days {
  color: #fff;
}
.attendance-item.attendance-unfull {
  /* 保持淡绿色填充效果，背景通过 :style 动态设置 */
  border: 1px solid #e6f7e6;
}
@media (max-width: 600px) {
  .group-rank-container {
    height: 100vh;
  }
  
  .tab-header {
    padding: 8px 0;
  }
  
  .tab-switch {
    gap: 6px;
    padding: 0 8px;
  }
  
  .tab-btn {
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 6px 6px 0 0;
  }
  
  .content-container {
    padding: 8px 0;
  }
  
  .progress-section, .attendance-section {
    padding: 16px;
    border-radius: 8px;
    margin: 0 8px;
    min-height: 300px;
  }
  
  .progress-item, .attendance-item {
    padding: 8px 4px;
    gap: 8px;
    border-radius: 7px;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .progress-value, .attendance-value {
    font-size: 13px;
  }
  
  .section-title {
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .summary-label {
    font-size: 12px;
  }
  
  .summary-value {
    font-size: 16px;
  }
}
</style>