<template>
  <div class="group-rank-container">
    <!-- Tab 切换按钮 -->
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

    <!-- 学习进度排行榜 -->
    <div v-if="activeTab === 'progress'" class="progress-section">
      <div class="progress-list">
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
            <div class="progress-detail">{{ user.chapter }}章 {{ user.section }}节</div>
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
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElAvatar } from 'element-plus'

// Tab 切换
const activeTab = ref('progress')

// 动画进度百分比
const progressFill = ref([])
const attendanceFill = ref([])

// 静态学习进度数据
const progressList = ref([
  { id: 1, name: '张三', avatar: '/src/assets/ice_bear_avatar.jpg', progress: 90, chapter: 14, section: 30 },
  { id: 2, name: '李四', avatar: '/src/assets/Jerry_Scintilla_avatar.jpg', progress: 80, chapter: 12, section: 25 },
  { id: 3, name: '王五', avatar: '/src/assets/ジエ_avatar.png', progress: 75, chapter: 11, section: 22 },
  { id: 4, name: '赵六', avatar: '/src/assets/LuMengXuan.jpg', progress: 60, chapter: 9, section: 18 },
  { id: 5, name: '陈老师', avatar: '/src/assets/ChenMinJie.jpg', progress: 100, chapter: 16, section: 35 },
])

// 静态出勤数据，增加昨日时长和总出勤次数
const attendanceList = ref([
  { id: 1, name: '张三', avatar: '/src/assets/ice_bear_avatar.jpg', yesterdayHours: 2.5, totalDays: 18 },
  { id: 2, name: '李四', avatar: '/src/assets/Jerry_Scintilla_avatar.jpg', yesterdayHours: 1.8, totalDays: 16 },
  { id: 3, name: '王五', avatar: '/src/assets/ジエ_avatar.png', yesterdayHours: 2.0, totalDays: 15 },
  { id: 4, name: '赵六', avatar: '/src/assets/LuMengXuan.jpg', yesterdayHours: 1.2, totalDays: 12 },
  { id: 5, name: '陈老师', avatar: '/src/assets/ChenMinJie.jpg', yesterdayHours: 3.0, totalDays: 20 },
])

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

onMounted(() => {
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
</script>

<style scoped>
.group-rank-container {
  width: 100%;
  margin: 0 auto;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 36px;
  border: none;
}
.tab-switch {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
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
  padding: 20px 14px 16px 14px;
  box-shadow: 0 2px 12px rgba(64,158,255,0.06);
  border: 1px solid #f0f2f5;
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
  /* 保持淡绿色填充 */
}
@media (max-width: 600px) {
  .group-rank-container {
    max-width: 100vw;
    padding: 10px 2px;
    border-radius: 10px;
  }
  .tab-switch {
    gap: 6px;
    margin-bottom: 6px;
  }
  .tab-btn {
    padding: 4px 10px;
    font-size: 13px;
    border-radius: 6px 6px 0 0;
  }
  .progress-section, .attendance-section {
    padding: 10px 2px;
    border-radius: 8px;
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