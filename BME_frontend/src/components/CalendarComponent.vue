<!-- 使用vue3语法 -->
<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';

onMounted(() => {
  
})
// 本地定义示例数据
const attendanceData = ref({
  '2025-06-15': 2,
  '2025-01-14': 2,
  '2025-02-14': 2,
  '2025-04-14': 2,
  '2025-05-14': 2,
  '2025-07-14': 2,
  '2025-08-14': 2,
  '2025-09-14': 2,
  '2025-10-14': 2,
  '2025-11-14': 2,
  '2025-12-14': 2,
  [new Date().toLocaleDateString('en-CA')]: 2 // 今日数据
});

// 定义每个月的颜色
// const monthColors = [
//   '#b9e7fc', // 一月
//   '#a6e2fe', // 二月
//   '#8dd7f9', // 三月
//   '#85d4f8', // 四月
//   '#7fd3fa', // 五月
//   '#70cef9', // 六月
//   '#66caf8', // 七月
//   '#5fc9fb', // 八月
//   '#41c1fd', // 九月
//   '#2ebbfc', // 十月
//   '#19b6ff', // 十一月
//   '#03acfb'  // 十二月
// ];
// 累计出勤天数
const currentYearDays = computed(() => {
  const currentYear = new Date().getFullYear();
  return Object.keys(attendanceData.value).reduce((total, dateStr) => {
    const date = new Date(dateStr);
    if (date.getFullYear() === currentYear) {
      return total + (attendanceData.value[dateStr] > 0 ? 1 : 0);
    }
    return total;
  }, 0);
});

// 最高连续出勤天数
const streakDays = computed(() => {
  const dates = Object.keys(attendanceData.value).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  dates.forEach(dateStr => {
    const currentDate = new Date(dateStr);
    if (prevDate) {
      // 计算日期差（考虑时区问题）
      const timeDiff = currentDate.getTime() - prevDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff === 1) {
        currentStreak++;
      } else if (dayDiff > 1) {
        currentStreak = 1; // 重新开始计数
      }
    } else {
      currentStreak = 1;
    }
    
    maxStreak = Math.max(maxStreak, currentStreak);
    prevDate = currentDate;
  });

  return maxStreak;
});

// 生成日历数据
const calendarDays = computed(() => {
  const days = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  
  for (let month = 0; month < 12; month++) {
    const date = new Date(currentYear, month, 1);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    
    // 生成当月所有天数
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, monthIndex, d);
      const dateKey = currentDate.toLocaleDateString('en-CA');
      days.push({
        date: currentDate,
        count: attendanceData.value[dateKey] || 0,
        month: monthIndex, // 添加月份索引
        // color: monthColors[monthIndex] // 添加月份颜色
      });
    }
  }
  return days;
});

// 可见月份标签
const visibleMonths = computed(() => {
  const today = new Date();
  const currentYear = today.getFullYear();
  return Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
});

//判断是否出勤
const hasAttendance = (day) => day.count > 0;

// 工具提示文本
const getTooltipText = (day) => {
  return `${day.date.toLocaleDateString()}`;
};

// 判断是否是今天
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const hoverDay = ref(null);
</script>

<template>
  <div class="calendarContainer">
    <div class="calendarCard">
      <div class="calendarHeader">
        <div style="font-size: 18px;">出勤日历</div>
        <div>
          <span style="margin-right: 10px; font-size: 14px; color: gray; font-weight: lighter;">累计出勤： {{ currentYearDays }} 天</span>
          <span style="font-size: 14px; color: gray; font-weight: lighter;">最高连续： {{ streakDays }} 天</span>
        </div>
      </div>
      <div class="month-labels">
        <span v-for="month in visibleMonths" :key="month">{{ month }}</span>
      </div> 
      <div class="calendar-grid">
        <div 
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{ 'has-attendance': day.count > 0 }"
          :style="{ 'background-color': day.count > 0 ? day.color : '' }"
          :title="getTooltipText(day)"
          @mouseover="hoverDay = day.date"
          @mouseleave="hoverDay = null"
        >
          <div v-if="isToday(day.date)" class="today-marker"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendarContainer{
  width: 100%;
  /* height: 300px; */
  /* background-color: #fff; */
  /* border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-right: 10px; */
  /* margin-top: 10px; */
  margin-bottom: 10px;
}
.calendarCard{
  /* width: 100%; */
  height: 250px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  margin-right: 10px;
  padding: 10px;
}
.calendarHeader{
  height: 40px;
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
  /* padding: 0 10px; */
  font-size: 16px;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #eee;
  padding:10px 10px 0px 10px;
}
.calendar-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 12px);
  grid-auto-columns: 10px; 
  gap: 6px; 
  padding: 10px 35px 20px 40px;
}

.day-cell {
  position: relative;
  height: 10px;
  border-radius: 2px;
  cursor: pointer;
  background: #ebedf0;
}

.has-attendance { 
opacity: 0.8; 
background-color: #5fc9fb;        
}

.day-cell:hover {
  transform: scale(1.2);
  z-index: 1;
}

.today-marker {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 4px;
  height: 4px;
  background: #ff6b6b;
  border-radius: 50%;
}
.calendars{
  width: 160px;
  height: 150px;

  border-radius: 5px;
  background-color: #6666665b;

  margin: 1px;
  margin-top: 20px;
}
.month-labels {
  display: flex;
  justify-content: space-between;
  color: #969696;
  font-size: 0.9em;
  order: 3; 
  /* margin-top: 10px; */
  padding: 25px 60px 0px 60px;
}
</style>
