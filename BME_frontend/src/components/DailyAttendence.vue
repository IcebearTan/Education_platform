<template>
  <div class="calendar-container">
      <div class="calendar-header">
          <div class="week-calendar">
              <div 
                  v-for="(day, index) in sevenDays" 
                  :key="index"
                  class="day-card"
                  :class="{ 
                      'today': day.isToday,
                  }"
              >
                  <div 
                      class="day-week"
                      :class="{ weekend: day.isWeekend }"  
                  >{{ day.week }}</div>
                  <div class="day-number">{{ day.date.getDate() }}</div>
              </div>
          </div>
          <div class="stats-container"> <!-- 统计容器 -->
              <div v-if="!isVisible">
                <el-button class="check-button" @click="checkln(nowday)" type="success" plain>打卡</el-button>
              </div>
              <div v-else>
                <div class="stat-item">
                  <div class="document">
                    <span class="continuous-days">连续打卡 {{ continuousDays }} 天</span>
                  </div>
                </div>
              </div>
              <!-- <div>
                
              </div> -->
          </div>
          <div class="month-labels">
              <span 
                  v-for="(month, index) in visibleMonths" 
                  :key="month"
                  :style="{left: monthStartIndices[index]*2.4 + 'px'}">{{ month }}</span>
          </div>
      </div>
      <div class="calendar-grid">
          <div 
              v-for="(day, index) in calendarDays"
              :key="index"
              class="day-cell"
              :class="{ 'checked': isChecked(day.date), 'today': isToday(day.date) }"
              :title="getTooltipText(day)"
              @mouseover="hoverDay = day.date"
              @mouseleave="hoverDay = null"
          >
              <div v-if="isToday(day.date)" class="today-marker"></div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onMounted, onUnmounted } from 'vue';

// 修正获取当前日期
const now = new Date();
const nowyear = ref(now.getFullYear());
const nowmonth = ref(now.getMonth() + 1);
const nowday = ref(now.getDate());


// 顶部每周日历
const sevenDays = computed(() => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateKey = date.toISOString().split('T')[0];
      const weekNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      days.push({
          date: date,
          week: weekNames[date.getDay()],
          count: props.attendanceData[dateKey] || 0,
          isToday: i === 0,
          isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
  }
  return days;
});

const props = defineProps({
  title: {
      type: String,
      default: '出勤日历'
  },
  attendanceData: {
      type: Object,
      default: () => ({})
  }
});

const hoverDay = ref(null);
const monthsToShow = 2; // 显示最近2个月

// 生成日历数据
const monthStartIndices = ref([]);
const calendarDays = computed(() => {
  const days = [];
  const today = new Date();
  monthStartIndices.value = [];

  for (let i = 0; i < monthsToShow ; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();

    //记录每个月的起始索引
    monthStartIndices.value.push(days.length);

    // 生成当月所有天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      days.push({
        date: currentDate,
        count: props.attendanceData[currentDate.toLocaleDateString('en-CA')] || 0
      });
    }
  }
return days;
});

// 可见月份标签
const visibleMonths = computed(() => {
  return [...new Set(calendarDays.value.map(day => 
      `${day.date.getMonth() + 1}月`
  ))];
});

// 从本地加载打卡数据
const loadDataFromLocalStorage = () => {
  const savedChecklnStatus = localStorage.getItem('checklnStatus');
  if (savedChecklnStatus) {
      checklnStatus.value = JSON.parse(savedChecklnStatus);
  }
  const savedContinuousDays = localStorage.getItem('continuousDays');
  if (savedContinuousDays) {
      continuousDays.value = parseInt(savedContinuousDays);
  }
  // 获取上次打卡日期
  const lastCheckedDate = localStorage.getItem('lastCheckedDate');
  if (lastCheckedDate) {
      const [lastYear, lastMonth, lastDay] = lastCheckedDate.split('-').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      // 判断是否为同一天
      if (lastYear === currentYear && lastMonth === currentMonth && lastDay === currentDay) {
          isVisible.value = true; // 同一天，已打卡，显示连续打卡天数
      } else {
          // 新的一天，重置连续打卡逻辑
          if (!checklnStatus.value[nowday.value]) {
              continuousDays.value = 0;
          }
      }
  }
}
// 将打卡数据保存到本地
const saveDataToLocalStorage = () => {
  localStorage.setItem('checklnStatus', JSON.stringify(checklnStatus.value));
  localStorage.setItem('continuousDays', continuousDays.value.toString());
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  // 保存当前日期作为上次打卡日期
  localStorage.setItem('lastCheckedDate', `${currentYear}-${currentMonth}-${currentDay}`);
}

// 打卡显示情况
const isVisible = ref(false);

const checklnStatus = ref({}); // 记录打卡状态
const continuousDays = ref(0); // 连续打卡天数

const isChecked = (date) => {
  return checklnStatus.value[date.toLocaleDateString('en-CA')];
}

const checkln = (day) => {
  const userInput = prompt('请输入今日验证码:');
  const correctInput = '1234';
  if (userInput === correctInput) { 
      if (day === nowday.value) {
          const dateKey = new Date(nowyear.value, nowmonth.value - 1, day).toLocaleDateString('en-CA');
          if (!isChecked(new Date(nowyear.value, nowmonth.value - 1, day))) {
              checklnStatus.value[dateKey] = true;
              if (continuousDays.value === 0 || checklnStatus.value[new Date(nowyear.value, nowmonth.value - 1, day - 1).toLocaleDateString('en-CA')]) {
                  continuousDays.value++;
              } else {
                  continuousDays.value = 1;
              }
              isVisible.value = true;
              alert('今日打卡成功！');
              saveDataToLocalStorage(); // 保存数据
          }
      }
  } else {
      alert('验证码错误，打卡失败！');
  }
}

const isToday = (date) => {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && 
      date.getMonth() === now.getMonth() && 
      date.getDate() === now.getDate();
}

const getTooltipText = (day) => {
  return  `${day.date.getFullYear()}-${day.date.getMonth() + 1}-${day.date.getDate()}`;
}

onMounted(() => {
  loadDataFromLocalStorage(); // 加载本地数据
});
onUnmounted(() => {
  saveDataToLocalStorage(); // 保存数据
});
</script>

<style scoped>
.calendar-container {
  position: relative;
  font-family: Arial, sans-serif;
  max-width: 220px; 
  width: 100%;     
  padding: 10px; 
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.calendar-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.week-calendar {
  display: flex;
  margin-bottom: 5px;
  background: #ffffff;
  border-radius: 8px;
  font-size: 15px;
  font-weight:800;
}

.day-card {
  display:flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  padding:4px;
  border-radius: 5px;
  cursor:pointer;
}

.day-number {
  font-size: 0.8em;
  font-weight: 800;
  color: #969696;
}

.day-week {
  font-size: 0.7em;
  color: rgb(169, 169, 169);
  margin: 2px 0;
}

.day-week.weekend {
  color: #ff4444 !important; 
  font-size: 10px;
  font-weight:800;
}

.today {
  /* border: 2px solid #4fc3f7; */
  background: #f0faff;
}

.stats-container {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  /* gap: 8px; */
  background: #faf8f8;
  padding: 8px 16px;
  border-radius: 6px;
  /* box-shadow: 0 0px 2px #4fc3f7; */
}

.document{
  text-align: center;
  font-size: 15px;
  color: #6c757d;
}

.continuous-days{
  /* font-size: 1.4em;
  color:black; */
}

.check-button{
  width: 220px;
}

.month-labels {
  display: flex;
  justify-content: space-between;
  color: #969696;
  font-size: 1rem;
  font-weight:700;
  order: 3; 
  margin-bottom:10px;
  margin-left:62px;
  position:relative;
  width:100%;
}

.month-labels span {
    position: absolute;
    top: 0;
    white-space:nowrap;
}

.checked{
  background-color:#4fc3f7 !important;
}

.calendar-grid {
  display: grid;
  grid-auto-flow: column;
  max-width: 299px;
  grid-template-rows: repeat(7, 20px);
  grid-auto-columns: 16px; 
  gap: 3px; 
  overflow: hidden;
  justify-content: center;
}

.day-cell {
  position: relative;
  height: 14px;
  width: 14px;
  border-radius: 3px;
  cursor: pointer;
  background: #ebedf0;
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
</style>    