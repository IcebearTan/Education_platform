<template>
  <div v-if="!isloading" class="calendar-container" :style="{ height: checkLogin() ? 'auto' : '100px' }">
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
                  <span class="continuous-days">本次已签到 {{ calculateThisTimeDuration() }}</span>
                  <span class="continuous-days" style="display: block;">今日总签到 {{ calculateThisDayDuration() }}</span>
                </div>
              </div>
          </div>
          <div v-else class="stats-container">
            <el-button class="check-button" @click="router.push('/login')" type="primary" plain>登录/注册</el-button>
          </div>
      </div>
      
      <!-- 重新设计的月份日历区域 - 水平布局 -->
      <div class="months-container" v-if="formeCheckStatus.length > 0">
        <!-- 第一个月 -->
        <div class="month-section">
          <div class="month-header">
            <span class="month-title">{{ visibleMonths[0] }}</span>
          </div>
          <div class="month-grid">
            <div 
                v-for="(day, index) in formeCheckStatus.slice(0, monthStartIndices[1])"
                :key="index"
                class="day-cell"
                :class="{'checked': isChecked(day.status), 'today': isToday(day.date)}"
                :title="day.date + ' ' + day.total_hours + 'h'"
            >
                <div v-if="isToday(day.date, index)" class="today-marker"></div>
            </div>
          </div>
        </div>
        
        <!-- 月份间隔 - 垂直分割线 -->
        <!-- <div class="month-divider"></div> -->
        
        <!-- 第二个月 -->
        <div class="month-section">
          <div class="month-header">
            <span class="month-title">{{ visibleMonths[1] }}</span>
          </div>
          <div class="month-grid">
            <div 
                v-for="(day, index) in formeCheckStatus.slice(monthStartIndices[1])"
                :key="index + monthStartIndices[1]"
                class="day-cell"
                :class="{'checked': isChecked(day.status), 'today': isToday(day.date)}"
                :title="day.date + ' ' + day.total_hours + 'h'"
            >
                <div v-if="isToday(day.date, index + monthStartIndices[1])" class="today-marker"></div>
            </div>
          </div>
        </div>
      </div>
  </div>
  <div v-else class="calendar-container" :style="{ height: checkLogin() ? 'auto' : '100px'  }">
     isloading...
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onMounted, onUnmounted, watch} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router';

import api from '../../api';
import { el, fa } from 'element-plus/es/locale/index.mjs';

const router = useRouter();

const isloading = ref(true); // 是否加载完成
const isMasterBrowser = ref(true); // 本次加载是否为主浏览器，主浏览器的标志为存在checkTime

const checkLogin = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false; // 未登录
  }
  return true; // 已登录
}

async function isTodayChecked(){
  const checkTime = localStorage.getItem('CheckTime');

  if(todayRecord.status === "进行中" || todayRecord.status === "已完成"){
    return true; // 已签到
  }

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
  todayRecord = formeCheckStatus.value.find(record => record.date === todayDateString);

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
    // console.log("data:",res.data);
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
  isloading.value = false; // 设置加载状态为 false
}

let todayRecord = {}; // 记录今天的打卡状态

async function getLatesetCheckStatus() {
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0]; // 获取今天的日期字符串，例如 "2025-03-28"
  todayRecord = formeCheckStatus.value.find(record => record.date === todayDateString);  // 在 formeCheckStatus 数组中查找今天的记录
  console.log(todayRecord);
  
  if(todayRecord.status === "进行中"){
    const storedCheckTime = localStorage.getItem('CheckTime');
    if (storedCheckTime) {
      checkTime.value = new Date(storedCheckTime);
    }
    if(!storedCheckTime) {
      isMasterBrowser.value = false;
      console.log("没有签到时间");
      localStorage.setItem('isChecked', true);
      localStorage.setItem('lastingTime', new Date().toLocaleString());
      lastingTime.value = new Date();
      isVisible.value = true;
      ElMessage({
      message: '本次登录为不同浏览器，故本次已签到的时间不会累计显示，但实际签到时间正常',
      type: 'warning', // 类型：success, warning, info, error
      duration: 3000, // 显示时间（毫秒），默认 3000
      showClose: true, // 是否显示关闭按钮});
    })
    }
    else if(nowTime.value - checkTime.value > 6 * 60 * 60 * 1000) {
      localStorage.setItem('isChecked', false);
      isVisible.value = false;
    }
  }
  else if(todayRecord.status === "已完成"){
    console.log("已完成");
    isVisible.value = false;
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
const freshTime = ref(null);
const lastingTime = ref(null);
const timeDiff = ref(null);

const getCheckTime = () => {
  const storedCheckTime = localStorage.getItem('CheckTime');
  if (storedCheckTime) {
    checkTime.value = new Date(storedCheckTime);
  }
};
const calculateThisTimeDuration = () => {
  if (!checkTime.value && !lastingTime.value) return;

  let duration = 0; // 初始化持续时间

  if(isMasterBrowser.value)
  {
    duration = nowTime.value - checkTime.value;
  }

  else{
    duration = nowTime.value - lastingTime.value; // 计算时间差
  }

  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
};

function parseDurationToMilliseconds(duration) {
  const hourMatch = duration.match(/(\d+)小时/); // 匹配小时
  const minuteMatch = duration.match(/(\d+)分钟/); // 匹配分钟

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0; // 提取小时数
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0; // 提取分钟数

  return (hours * 60 * 60 * 1000) + (minutes * 60 * 1000); // 转换为毫秒
}

const calculateThisDayDuration = () => {
  if (!checkTime.value && !lastingTime.value) return;

  const totalDurationMilliseconds = parseDurationToMilliseconds(todayRecord.total_duration);

  let duration = 0; // 初始化持续时间

  duration = nowTime.value - freshTime.value + totalDurationMilliseconds;

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
          message: '签到成功！请在6小时内签退！',
        })
        fetchCheckStatus();
        localStorage.setItem('isChecked', true);
        localStorage.setItem('CheckTime', new Date().toLocaleString());
        // checkIsVisible();  签到后不会出现该函数中的超出6小时的情况，所以直接设置可见性
        isMasterBrowser.value = true;
        isVisible.value = true;
        getCheckTime();
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
        // checkIsVisible();  签退使不会出现其它可能，故直接更改可见性
        isVisible.value = false;
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
  
//   else{
//     ElMessageBox.confirm(
//   `本次登录为不同浏览器，请返回上次签到的浏览器进行签退
//    若要强制签退请选择确定（当前签到的时长都会清零）`, // 弹窗内容
//   '警告', // 弹窗标题
//   {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning', // 弹窗类型：success, warning, info, error
//     showClose: true, // 是否显示关闭按钮
//   }
// )
//   .then(() => {
//     // 用户点击“确定”后的逻辑
//     localStorage.setItem('isChecked', false);
//     isVisible.value = false;
//   })
//   .catch(() => {
//   });
//   }
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

  freshTime.value = new Date();
  // console.log(checklnStatus.value);
});
onUnmounted(() => {
  // saveDataToLocalStorage(); // 保存数据
});

watch(isloading, (newValue) => {
  if (!newValue) {
    getLatesetCheckStatus(); // 获取最新打卡状态
  }
});

</script>

<style scoped>
.calendar-container {
  position: relative;
  font-family: Arial, sans-serif;
  width: 100%;     
  padding: 20px; 
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calendar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  /* margin-bottom: 16px; */
}

.week-calendar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  background: #ffffff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  padding: 4px 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  min-width: 0;
  max-width: 280px;
}

.day-card {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  margin: 0 2px;
  transition: all 0.2s ease;
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
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
  margin-top: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf8f8;
  padding: 12px 20px;
  border-radius: 10px;
  border: #ffffff solid 1px;
  transition: all 0.3s ease;
  min-width: 240px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
  /* 保留空样式规则以备后用 */
  display: inline;
}

.check-button{
  width: 240px;
  height: 40px;
  font-size: 15px;
  border-radius: 10px;
}

.checked{
  background-color:#4fc3f7 !important;
}

/* 重新设计的月份容器样式 - 水平布局 */
.months-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 32px;
  width: 100%;
  max-width: 100%;
}

.month-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
}

.month-header {
  margin-bottom: 12px;
}

.month-title {
  font-size: 16px;
  font-weight: 700;
  color: #4fc3f7;
  background: linear-gradient(135deg, #4fc3f7, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  /* padding: 8px 16px; */
  border-radius: 20px;
  background-color: rgba(79, 195, 247, 0.1);
  /* border: 2px solid rgba(79, 195, 247, 0.2); */
  display: inline-block;
}

.month-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 20px);
  grid-auto-columns: 16px; 
  gap: 3px; 
  justify-content: center;
}

.month-divider {
  width: 3px;
  height: 140px;
  background: linear-gradient(180deg, transparent, rgba(79, 195, 247, 0.3), transparent);
  border-radius: 2px;
  position: relative;
  align-self: stretch;
  margin-top: 50px;
}

.month-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #4fc3f7;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
}


.day-cell {
  position: relative;
  height: 14px;
  width: 14px;
  border-radius: 3px;
  cursor: pointer;
  background: #ebedf0;
  transition: all 0.2s ease;
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

@media (max-width: 768px) {
  .calendar-container {
    width: 100%;
    max-width: 480px;
    padding: 16px;
    margin: 0 auto;
    box-sizing: border-box;
    border: 1px solid #eee;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .check-button {
    width: 100% !important;
    max-width: 300px;
    font-size: 16px;
    margin: 8px 0;
  }

  .stats-container {
    width: 100%;
    padding: 0 16px;
  }

  .stat-item {
    width: 100%;
    max-width: 300px;
    text-align: center;
    min-width: auto;
  }

  .document {
    font-size: 14px;
  }

  .months-container {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }

  .month-divider {
    width: 80%;
    height: 2px;
    margin-top: 0;
    background: linear-gradient(90deg, transparent, rgba(79, 195, 247, 0.3), transparent);
  }

  .month-divider::before {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  .month-grid {
    transform: scale(0.9);
  }

  .month-title {
    font-size: 14px;
    padding: 6px 12px;
  }

  .week-calendar {
    padding: 6px;
    margin-bottom: 12px;
  }

  .day-card {
    padding: 4px 6px;
    margin: 0 1px;
  }
}

</style>