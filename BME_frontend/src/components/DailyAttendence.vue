<template>
  <div class="calendar-container" :style="{ height: checkLogin() ? '100%' : '100px' }">
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
          <div v-if="checkLogin()" class="stats-container"> <!-- 统计容器 -->
              <div v-if="!isVisible">
                <el-button class="check-button" @click="open" type="success" plain>
                  <div v-if="isTodayChecked()">今日已累计 {{ toayTotal }} 小时</div>
                  <div v-else>签到</div>
                </el-button>
              </div>
              <div v-else class="stat-item" @click="openCheckOut">
                <div class="document">
                  <span class="continuous-days">已签到 {{ calculateDuration() }}</span>
                </div>
              </div>
          </div>
          <div v-else class="stats-container">
            <el-button class="check-button" @click="router.push('/login')" type="primary" plain>登录/注册</el-button>
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
            v-for="(day, index) in formeCheckStatus"
            :key="index"
            class="day-cell"
            :class="{ 'checked': isChecked(formeCheckStatus[index].status), 'today': isToday(day.date) }"
            :title="formeCheckStatus[index].date + ' ' + formeCheckStatus[index].total_hours + 'h'"
        >
            <div v-if="isToday(formeCheckStatus[index].date, index)" class="today-marker"></div>
        </div>
        
      </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router';

import api from '../api';

const router = useRouter();

const checkLogin = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false; // 未登录
  }
  return true; // 已登录
}
const isTodayChecked = () => {
  const checkTime = localStorage.getItem('CheckTime');
  if (checkTime) {
    const checkDate = new Date(checkTime);
    const today = new Date();
    return checkDate.getDay() === today.getDay();
  }
  return false;
}
const toayTotal = computed(() => {
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0]; // 获取今天的日期字符串，例如 "2025-03-28"

  // 在 formeCheckStatus 数组中查找今天的记录
  const todayRecord = formeCheckStatus.value.find(record => record.date === todayDateString);

  // 如果找到今天的记录，则返回 total_hours，否则返回 0
  return todayRecord ? todayRecord.total_hours : 0;
});

// 获取打卡状态
const formeCheckStatus = ref([]);
// 可见月份标签
const visibleMonths = ref([]);
// 生成日历数据
const monthStartIndices = ref([0]);
const fetchCheckStatus = async () => {
  try {
      const res = await api({
          url: '/records',
          method: 'get'
      });
    // console.log(res.data);
    formeCheckStatus.value = [
      ...res.data.previous_month.records,
      ...res.data.current_month.records,
    ];
    monthStartIndices.value.push(res.data.current_month.records.length)

    // 提取月份
    const previousMonthName = extractMonth(res.data.previous_month.month_name);
    const currentMonthName = extractMonth(res.data.current_month.month_name);
    visibleMonths.value = [
      previousMonthName,
      currentMonthName
    ];
    // console.log(visibleMonths.value);

    
  } catch (error) {
      console.error(error);
  }
}
// 提取月份的函数
const extractMonth = (monthName) => {
  // 使用正则表达式匹配月份
  const match = monthName.match(/(\d+)月/);
  if (match && match[1]) {
    return `${match[1]}月`;
  } else {
    console.error("月份格式不正确:", monthName);
    return monthName; // 返回原始值，避免出错
  }
};

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

// 打卡显示情况
const isVisible = ref(false);
const checkIsVisible = () => {
  // console.log(localStorage.getItem('isChecked'));
  if (localStorage.getItem('isChecked') === "true" && nowTime.value - checkTime.value <= 4 * 60 * 60 * 1000) {
    console.log();
    isVisible.value = true;
    getCheckTime();
  } else {
    isVisible.value = false;
  }
}

const checklnStatus = ref({}); // 记录打卡状态
const continuousDays = ref(0); // 连续打卡天数

const isChecked = (status) => {
  // return checklnStatus.value[date.toLocaleDateString('en-CA')];
  if (status === "进行中" || status === "已完成") {
      return true;
  } else {
      return false;
  }
}

const nowTime = ref(new Date());
const checkTime = ref(null);
const timeDiff = ref(null);

const getCheckTime = () => {
  const storedCheckTime = localStorage.getItem('CheckTime');
  if (storedCheckTime) {
    checkTime.value = new Date(storedCheckTime);
  }
};
const calculateDuration = () => {
  if (!checkTime.value) return;

  const duration = nowTime.value - checkTime.value;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
};

// 提交签到函数
const submitCheckCode = async (code) => {
  try {
      const res = await api({
        url: '/check',
        method: 'post',
        data: {
          "check_code": code
        }
      });
      if (res.status === 200) {
        ElMessage({
          type: 'success',
          message: '签到成功！请在4小时内签退！',
        })
        fetchCheckStatus();
        localStorage.setItem('isChecked', true);
        localStorage.setItem('CheckTime', new Date().toLocaleString());
        checkIsVisible();
      } else {
        ElMessage({
          type: 'error',
          message: res
        })
      }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: error
    })
  }
}
const submitCheckOutCode = async (code) => {
  try {
      const res = await api({
        url: '/check',
        method: 'post',
        data: {
          "check_code": code
        }
      });
      if (res.status === 200) {
        ElMessage({
          type: 'success',
          message: '签退成功！',
        })
        fetchCheckStatus();
        localStorage.setItem('isChecked', false);
        checkIsVisible();
      } else {
        ElMessage({
          type: 'error',
          message: res
        })
      }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: error
    })
  }
}

const open = () => {
  ElMessageBox.prompt('请输入签到码', '签到', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    lockScroll: false,
  })
    .then(({ value }) => {
      submitCheckCode(value);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消签到',
      })
    })
}
const openCheckOut = () => {
  ElMessageBox.prompt('请输入签退码', '签退', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    lockScroll: false,
  })
    .then(({ value }) => {
      submitCheckOutCode(value);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消签退',
      })
    })
}

const todayIndex = ref(0);
const isToday = (date, index) => {
  const now = new Date();
  date = new Date(date);
  if (now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
    return true;
    todayIndex.value = index;

  } else {
    return false;
  }
}

const getTooltipText = (day) => {
  // return  `${day.date.getFullYear()}-${day.date.getMonth() + 1}-${day.date.getDate()}`;
}

onMounted(() => {
  // loadDataFromLocalStorage(); // 加载本地数据
  // console.log(isVisible.value);
  fetchCheckStatus();
  getCheckTime(); // 获取上次签到时间
  checkIsVisible(); // 检查是否显示打卡
  
  setInterval(() => {
    nowTime.value = new Date();
  }, 1000)

  // console.log(checklnStatus.value);
});
onUnmounted(() => {
  // saveDataToLocalStorage(); // 保存数据
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
  border: #ffffff solid 1px;

  transition: all 0.132s ease-in-out;

  /* box-shadow: 0 0px 2px #4fc3f7; */
}

.stat-item:hover {
  border: #4fc3f7 solid 1px;
  cursor: pointer;
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