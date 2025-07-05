<!-- 使用vue3语法 -->
<script setup>
import api from '../../api';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';

//获取年度出勤数据
const yearAttendenceData = ref([]);

const fetchYearAttendanceData = async () => {
  try {
    const response = await api({
      url: '/records/yearly',
      method: 'get'
    })
    yearAttendenceData.value = response.data;
    // console.log(yearAttendenceData.value)

  } catch (error) {
    console.error('Error fetching year attendance data:', error);
    // ElMessage.error('获取年度出勤数据失败');
  }
};

onMounted(() => {
  fetchYearAttendanceData();
})

// 累计出勤天数

const currentYearDays = computed(() => {
  return yearAttendenceData.value.reduce((total, record) => {
    return total + (record.total_hours > 0 ? 1 : 0);
  }, 0);
})

// 最高连续出勤天数
const streakDays = computed(() => {
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  yearAttendenceData.value.forEach(record => {
    const currentDate = new Date(record.date);

    if (record.total_hours > 0) { // 只有出勤的日期才参与连续天数计算
      if (prevDate) {
        const timeDiff = currentDate.getTime() - prevDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        if (dayDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1; // 重新开始计数
        }
      } else {
        currentStreak = 1;
      }

      prevDate = currentDate;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0; // 中断连续出勤
      prevDate = null; // 重置 prevDate
    }

    maxStreak = Math.max(maxStreak, currentStreak); // 每次循环都更新 maxStreak
  });
  return maxStreak;
})

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
  // return `${day.date.toLocaleDateString()}`;
};

// 判断是否是今天
const isToday = (date) => {
  const today = new Date();
  date = new Date(date);
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
          <span style="margin-right: 20px; font-size: 14px; color: gray; font-weight: lighter;">累计出勤： {{ currentYearDays }} 天</span>
          <span style="font-size: 14px; color: gray; font-weight: lighter;">最高连续： {{ streakDays }} 天</span>
        </div>
      </div>
      <div class="month-labels">
        <span v-for="month in visibleMonths" :key="month">{{ month }}</span>
      </div> 
      <div class="calendar-grid">
        <div 
          v-for="(day, index) in yearAttendenceData"
          :key="index"
          class="day-cell"
          :class="{ 'has-attendance': yearAttendenceData[index].total_hours > 0 }"
          :style="{ 'background-color': day.count > 0 ? day.color : '' }"
          :title="yearAttendenceData[index].date"
          @mouseover="hoverDay = day.date"
          @mouseleave="hoverDay = null"
        >
          <div v-if="isToday(yearAttendenceData[index].date)" class="today-marker"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendarContainer{
  width: 100%;
  margin-bottom: 15px;
}
.calendarCard{
  /* width: 100%; */
  height: 242px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: #e7edf5 0px 0px 10px 0px;


  margin-right: 10px;
  padding: 5px;
  padding-bottom: 0;
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
  grid-auto-columns: 12px; 
  gap: 6px; 
  padding: 10px 15px 0px 10px;
}

.day-cell {
  position: relative;
  height: 12px;
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
