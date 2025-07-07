<template>
  <div class="group-rank-container">
    <!-- 学习进度排行榜 -->
    <div class="progress-section">
      <h3 class="section-title">学习进度排行榜</h3>
      <div class="progress-list">
        <div v-for="(user, idx) in progressList" :key="user.id" class="progress-item">
          <div class="rank-num" :class="['rank-' + (idx + 1)]">{{ idx + 1 }}</div>
          <el-avatar :size="32" :src="user.avatar" />
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="progress-bar-track">
              <div class="progress-bar" :style="{ width: user.progress + '%' }"></div>
            </div>
          </div>
          <div class="progress-value">{{ user.progress }}%</div>
        </div>
      </div>
    </div>

    <!-- 出勤情况统计 -->
    <div class="attendance-section">
      <h3 class="section-title">出勤情况统计</h3>
      <div class="attendance-summary">
        <div class="summary-item">
          <div class="summary-label">总出勤率</div>
          <div class="summary-value">{{ totalAttendanceRate }}%</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">总出勤天数</div>
          <div class="summary-value">{{ totalAttendanceDays }}</div>
        </div>
      </div>
      <div class="attendance-list">
        <div v-for="user in attendanceList" :key="user.id" class="attendance-item">
          <el-avatar :size="28" :src="user.avatar" />
          <div class="user-name">{{ user.name }}</div>
          <div class="attendance-bar-track">
            <div class="attendance-bar" :style="{ width: user.rate + '%' }"></div>
          </div>
          <div class="attendance-value">{{ user.days }}天 / {{ user.rate }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElAvatar } from 'element-plus'

// 静态学习进度数据
const progressList = ref([
  { id: 1, name: '张三', avatar: '/src/assets/ice_bear_avatar.jpg', progress: 90 },
  { id: 2, name: '李四', avatar: '/src/assets/Jerry_Scintilla_avatar.jpg', progress: 80 },
  { id: 3, name: '王五', avatar: '/src/assets/ジエ_avatar.png', progress: 75 },
  { id: 4, name: '赵六', avatar: '/src/assets/LuMengXuan.jpg', progress: 60 },
  { id: 5, name: '陈老师', avatar: '/src/assets/ChenMinJie.jpg', progress: 100 },
])

// 静态出勤数据
const attendanceList = ref([
  { id: 1, name: '张三', avatar: '/src/assets/ice_bear_avatar.jpg', days: 18, rate: 90 },
  { id: 2, name: '李四', avatar: '/src/assets/Jerry_Scintilla_avatar.jpg', days: 16, rate: 80 },
  { id: 3, name: '王五', avatar: '/src/assets/ジエ_avatar.png', days: 15, rate: 75 },
  { id: 4, name: '赵六', avatar: '/src/assets/LuMengXuan.jpg', days: 12, rate: 60 },
  { id: 5, name: '陈老师', avatar: '/src/assets/ChenMinJie.jpg', days: 20, rate: 100 },
])

const totalAttendanceDays = computed(() => attendanceList.value.reduce((sum, u) => sum + u.days, 0))
const totalAttendanceRate = computed(() => {
  if (!attendanceList.value.length) return 0
  return Math.round(attendanceList.value.reduce((sum, u) => sum + u.rate, 0) / attendanceList.value.length)
})
</script>

<style scoped>
.group-rank-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: #f9fbfd;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(64,158,255,0.08);
  padding: 24px 16px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  border: 1.5px solid #e6ecf3;
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
  background: #f7faff;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, background 0.2s;
  border: 1px solid #e6ecf3;
}
.progress-item:hover {
  background: #eaf6ff;
  box-shadow: 0 4px 16px rgba(64,158,255,0.10);
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
.progress-bar-track {
  width: 100%;
  height: 10px;
  background: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
  border-radius: 8px;
  transition: width 0.5s;
}
.progress-value {
  width: 54px;
  text-align: right;
  font-size: 16px;
  color: #409eff;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.attendance-section {
  margin-top: 16px;
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
.attendance-bar-track {
  flex: 1;
  height: 10px;
  background: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 12px;
}
.attendance-bar {
  height: 100%;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  border-radius: 8px;
  transition: width 0.5s;
}
.attendance-value {
  width: 90px;
  text-align: right;
  font-size: 15px;
  color: #67c23a;
  font-weight: 600;
  letter-spacing: 0.5px;
}
@media (max-width: 600px) {
  .group-rank-container {
    max-width: 100vw;
    padding: 10px 2px;
    border-radius: 10px;
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