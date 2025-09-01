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
                  <div v-if="isTodayCheckedComputed">今日已累计 {{ toayTotal }} 小时</div>
                  <div v-else>签到</div>
                </el-button>
              </div>
              <div v-else-if="isOvertime()">
                <el-button class="check-button" @click="openCheckOut" type="danger">
                  <i class="el-icon-warning"></i>
                  <span>本次已超时作废 - 请签退</span>
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
            <div class="welcome-text-simple"> - 欢迎来到训练营 - </div>
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
                :class="{'checked': isChecked(day), 'today': isToday(day.date)}"
                :title="getTooltipText(day)"
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
                :class="{'checked': isChecked(day), 'today': isToday(day.date)}"
                :title="getTooltipText(day)"
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
/*
 * 多端同步打卡时间功能说明：
 * 
 * 1. 双接口架构：
 *    - /latest_checktime: 获取今日实时打卡状态 {check_in_time, check_out_time, date, duration, has_record, user_id, username}
 *    - /records: 获取历史打卡记录 {date, status, total_duration, total_hours} (保持原有结构)
 * 
 * 2. 多端同步机制：
 *    - 完全基于服务器数据，不使用localStorage
 *    - 页面加载时调用 /latest_checktime 获取实时状态
 *    - 每30秒自动调用 /latest_checktime 检测其他设备操作
 *    - 签到/签退成功后立即获取最新状态
 * 
 * 3. 数据处理：
 *    - todayRecord: 来自 /latest_checktime，用于实时状态判断和时间计算
 *    - formeCheckStatus: 来自 /records，用于日历历史显示
 *    - 所有时间计算均基于服务器时间，确保多端一致性
 * 
 * 4. 状态同步：
 *    - 检测其他端签到/签退操作，实时更新本地状态
 *    - 提供用户友好的同步提示信息
 *    - 确保多端状态完全一致
 * 
 * 5. 超时处理：
 *    - 自动检测签到超过6小时的情况
 *    - 显示超时警告，提示用户签退
 */

import { ref, computed } from 'vue';
import { onMounted, onUnmounted, watch} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router';

import api from '../../api';
import { el, fa } from 'element-plus/es/locale/index.mjs';

const router = useRouter();

const isloading = ref(true); // 是否加载完成

const checkLogin = () => {
  const token = localStorage.getItem('token');
  return !!token;
}

async function isTodayChecked(){
  // 基于最新接口数据判断（不依赖localStorage）
  if(todayRecord && todayRecord.has_record && todayRecord.check_in_time){
    return true; // 已签到
  }
  return false;
}

// 改为响应式的计算属性，确保能实时更新
const isTodayCheckedComputed = computed(() => {
  // 基于最新接口数据判断（不依赖localStorage）
  if(todayRecord.value && todayRecord.value.has_record && todayRecord.value.check_in_time){
    return true; // 已签到
  }
  return false;
});

const toayTotal = computed(() => {
  // 主要基于 /records 接口的历史数据计算今日累计时长
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];
  const historyRecord = formeCheckStatus.value.find(record => record.date === todayDateString);
  
  if (historyRecord && historyRecord.total_hours) {
    // 直接使用历史记录中的总时长
    return historyRecord.total_hours;
  }
  
  // 如果历史记录中没有今日数据，但有实时签到数据，则计算当前签到时长
  if (todayRecord.value && todayRecord.value.check_in_time && !todayRecord.value.check_out_time) {
    const checkInTime = new Date(todayRecord.value.check_in_time);
    const currentDuration = nowTime.value - checkInTime;
    const currentHours = currentDuration / (1000 * 60 * 60);
    return Math.max(0, currentHours.toFixed(1));
  }
  
  // // 如果已签退，尝试从 /latest_checktime 接口获取 duration
  // if (todayRecord.value && todayRecord.value.duration) {
  //   if (typeof todayRecord.value.duration === 'number') {
  //     return todayRecord.value.duration;
  //   } else if (typeof todayRecord.value.duration === 'string') {
  //     const hourMatch = todayRecord.value.duration.match(/(\d+)小时/);
  //     return hourMatch ? parseInt(hourMatch[1], 10) : 0;
  //   }
  // }
  
  return 0; // 默认返回0
});

// 获取打卡状态（历史记录，用于日历显示）
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
    // console.log("records data:",res.data);
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
  // 移动到 onMounted 的 Promise.all 完成后再设置
}

// 获取今日最新打卡状态（用于多端同步和实时状态）
const fetchLatestCheckTime = async () => {
  try {
    const res = await api({
      url: '/lateset_checktime',
      method: 'get'
    });
    console.log("latest_checktime data:", res.data);
    return res.data;
  } catch (error) {
    console.error('获取今日最新打卡状态失败:', error);
    return null;
  }
};

const todayRecord = ref({}); // 记录今天的打卡状态（来自 /latest_checktime），改为响应式

async function getLatesetCheckStatus() {
  // 获取今日最新打卡状态（不依赖本地存储）
  todayRecord.value = await fetchLatestCheckTime();
  console.log('今日最新打卡状态:', todayRecord.value);
  
  if (!todayRecord.value) {
    // 获取失败，设置为初始状态
    isVisible.value = false;
    return;
  }
  
  // 基于服务器数据判断状态（完全不依赖localStorage）
  if(todayRecord.value.has_record && todayRecord.value.check_in_time){
    if(!todayRecord.value.check_out_time) {
      // 已签到但未签退，状态为"进行中"
      const serverCheckTime = new Date(todayRecord.value.check_in_time);
      
      // 调试信息：打印时间解析结果
      console.log('时间解析调试:', {
        原始服务器时间: todayRecord.value.check_in_time,
        解析后的时间: serverCheckTime.toISOString(),
        当前本地时间: new Date().toISOString(),
        时间差: new Date() - serverCheckTime,
        是否有效时间: !isNaN(serverCheckTime.getTime())
      });
      
      checkTime.value = serverCheckTime;
      
      // 检查是否超过6小时（这个逻辑可以保留或由服务器处理）
      if(nowTime.value - serverCheckTime > 6 * 60 * 60 * 1000) {
        console.log("签到已超过6小时");
      }
    } else {
      // 已签到且已签退，状态为"已完成"
      console.log("今日打卡已完成");
    }
  } else {
    // 没有打卡记录，初始状态
    console.log("今日未打卡");
  }
  
  // 根据服务器数据更新界面显示状态
  checkIsVisible();
}

// 获取今日打卡信息的独立函数，用于多端同步（已移至 fetchLatestCheckTime）

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

// 基于服务器数据判断是否显示打卡界面（完全不依赖localStorage）
const checkIsVisible = () => {
  if (todayRecord.value && todayRecord.value.has_record && todayRecord.value.check_in_time) {
    if (!todayRecord.value.check_out_time) {
      // 已签到未签退，显示签退界面
      isVisible.value = true;
    } else {
      // 已签退完成，隐藏签退界面，回到显示今日累计状态
      isVisible.value = false;
    }
  } else {
    // 没有打卡记录，隐藏界面
    isVisible.value = false;
  }
}

const checklnStatus = ref({}); // 记录打卡状态
const continuousDays = ref(0); // 连续打卡天数

// 检查是否超时未签退（超过6小时）
const isOvertime = () => {
  if (!todayRecord.value || !todayRecord.value.check_in_time || todayRecord.value.check_out_time) {
    return false; // 未签到或已签退
  }
  
  const checkInTime = new Date(todayRecord.value.check_in_time);
  // 使用响应式的 nowTime.value 而不是 new Date()，确保Vue能检测到依赖变化
  const diffHours = (nowTime.value - checkInTime) / (1000 * 60 * 60);
  
  return diffHours > 6; // 超过6小时
};

const isChecked = (record) => {
  // 适配原有数据结构：根据 status 判断是否已打卡（用于日历显示）
  if (record && (record.status === "已完成" || record.status === "进行中")) {
      return true;
  } else {
      return false;
  }
}

const nowTime = ref(new Date());
const checkTime = ref(null);
const freshTime = ref(null);
const timeDiff = ref(null);

const calculateThisTimeDuration = () => {
  // 计算本次签到的持续时间，基于服务器数据
  if (!todayRecord.value || !todayRecord.value.check_in_time || todayRecord.value.check_out_time) {
    return "0h 0m 0s"; // 未签到或已签退
  }

  const checkInTime = new Date(todayRecord.value.check_in_time);
  
  // 检查时间是否有效
  if (isNaN(checkInTime.getTime())) {
    console.warn('无效的签到时间:', todayRecord.value.check_in_time);
    return "0h 0m 0s";
  }
  
  // 使用响应式的 nowTime.value 而不是 new Date()，确保Vue能检测到依赖变化
  const duration = nowTime.value - checkInTime;
  
  // 如果时长为负数，说明时间有问题，返回0
  if (duration < 0) {
    console.warn('计算出负数时长，服务器时间可能有问题:', {
      checkInTime: checkInTime.toISOString(),
      nowTime: nowTime.value.toISOString(),
      duration: duration
    });
    return "0h 0m 0s";
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
  // 计算今日总签到时长，基于服务器数据
  let totalDurationMilliseconds = 0;
  
  // 首先获取已完成的打卡时长（从服务器数据）
  if (todayRecord.value && todayRecord.value.duration) {
    if (typeof todayRecord.value.duration === 'number') {
      // 如果是数字，假设是小时数，转换为毫秒
      totalDurationMilliseconds = todayRecord.value.duration * 60 * 60 * 1000;
    } else if (typeof todayRecord.value.duration === 'string') {
      // 如果是字符串，使用原有的解析函数
      totalDurationMilliseconds = parseDurationToMilliseconds(todayRecord.value.duration);
    }
  } else {
    // 如果最新接口没有 duration，尝试从历史记录获取
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const historyRecord = formeCheckStatus.value.find(record => record.date === todayDateString);
    
    if (historyRecord && historyRecord.total_duration) {
      totalDurationMilliseconds = parseDurationToMilliseconds(historyRecord.total_duration);
    }
  }

  // 如果当前正在签到中，加上本次签到的时长
  if (todayRecord.value && todayRecord.value.check_in_time && !todayRecord.value.check_out_time) {
    const checkInTime = new Date(todayRecord.value.check_in_time);
    
    // 检查时间是否有效
    if (!isNaN(checkInTime.getTime())) {
      // 使用响应式的 nowTime.value 而不是 new Date()，确保Vue能检测到依赖变化
      const currentSessionDuration = nowTime.value - checkInTime;
      
      // 只有当前时长为正数时才加上
      if (currentSessionDuration > 0) {
        totalDurationMilliseconds += currentSessionDuration;
      } else {
        console.warn('当前签到时长为负数，跳过累加:', {
          checkInTime: checkInTime.toISOString(),
          nowTime: nowTime.value.toISOString(),
          duration: currentSessionDuration
        });
      }
    } else {
      console.warn('无效的签到时间，跳过累加:', todayRecord.value.check_in_time);
    }
  }

  const hours = Math.floor(totalDurationMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((totalDurationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalDurationMilliseconds % (1000 * 60)) / 1000);

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

      // 重新获取打卡状态以获得服务器最新时间
      await fetchCheckStatus();

      // 获取最新的今日打卡状态
      todayRecord.value = await fetchLatestCheckTime();

      if (todayRecord.value && todayRecord.value.check_in_time) {
        const serverCheckTime = new Date(todayRecord.value.check_in_time);
        checkTime.value = serverCheckTime;
      } else {
        // 如果服务器没有返回时间，使用当前时间作为备用
        checkTime.value = new Date();
      }

      isVisible.value = true;
    } else {
      ElMessage({
        type: 'error',
        message: res
      })
    }
  } catch (error) {
    if (error?.response?.status === 409) {
      ElMessage({
        type: 'error',
        message: '签到码已被使用',
      })
    } else if (error?.response?.status === 403) {
      ElMessage({
        type: 'error',
        message: 'IP不在106或110网段，请连接正确的网络后重试',
      })
    }
    else {
      ElMessage({
        type: 'error',
        message: error?.response?.data?.message || error,
      })
    }
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
        await fetchCheckStatus();
        // 重新获取最新状态
        todayRecord.value = await fetchLatestCheckTime();
        isVisible.value = false;
      } else if (res.status === 409) {
        ElMessage({
          type: 'error',
          message: '签退码已被使用',
        })
      } else {
        ElMessage({
          type: 'error',
          message: res.data?.message || res,
        })
      }
  } catch (error) {
    if (error?.response?.status === 409) {
      ElMessage({
        type: 'error',
        message: '签退码已被使用',
      })
    } else if (error?.response?.status === 403) {
      ElMessage({
        type: 'error',
        message: 'IP不在106或110网段，请连接正确的网络后重试',
      })
    }
    else {
      ElMessage({
        type: 'error',
        message: error?.response?.data?.message || error,
      })
    }
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
  if (!day) return '';
  
  let tooltipText = day.date;
  
  // 适配原有数据结构处理打卡信息
  if (day.status && day.status !== "未签到") {
    tooltipText += `\n状态: ${day.status}`;
    if (day.total_duration && day.total_duration !== "0小时0分钟") {
      tooltipText += `\n时长: ${day.total_duration}`;
    }
    if (day.total_hours && day.total_hours > 0) {
      tooltipText += `\n总计: ${day.total_hours}小时`;
    }
  } else {
    // 没有打卡记录
    tooltipText += '\n状态: 未打卡';
  }
  
  return tooltipText;
};

onMounted(async () => {
  // 未登录时不请求数据，直接展示登录按钮
  if (!checkLogin()) {
    isloading.value = false;
    return;
  }
  
  // 并行获取数据，避免等待时间过长
  const fetchPromises = [
    fetchCheckStatus(),
    getLatesetCheckStatus() // 直接在这里调用，不等待 isloading 变化
  ];
  
  try {
    await Promise.all(fetchPromises);
    console.log('所有数据获取完成，开始计时');
  } catch (error) {
    console.error('数据获取失败:', error);
  } finally {
    // 无论成功与否，都设置加载完成状态
    isloading.value = false;
  }
  
  // 实时更新当前时间
  setInterval(() => {
    nowTime.value = new Date();
  }, 1000);
  
  // 每30秒同步一次打卡状态，实现多端同步
  setInterval(async () => {
    if (checkLogin()) {
      const currentTodayRecord = { ...todayRecord.value }; // 保存当前状态
      
      // 重新获取最新状态
      todayRecord.value = await fetchLatestCheckTime();
      
      if (currentTodayRecord && todayRecord.value) {
        // 检查状态变化（比如其他端签退了）
        if (!currentTodayRecord.check_out_time && todayRecord.value.check_out_time) {
          isVisible.value = false;
          ElMessage({
            message: '检测到其他设备已签退，状态已同步',
            type: 'info',
            duration: 3000
          });
        }
        // 检查是否其他端签到了
        else if (!currentTodayRecord.check_in_time && todayRecord.value.check_in_time) {
          const serverCheckTime = new Date(todayRecord.value.check_in_time);
          checkTime.value = serverCheckTime;
          isVisible.value = true;
          ElMessage({
            message: '检测到其他设备已签到，状态已同步',
            type: 'info',
            duration: 3000
          });
        }
      }
      
      // 更新界面显示
      checkIsVisible();
    }
  }, 30000); // 30秒同步一次
  
  freshTime.value = new Date();
});
onUnmounted(() => {
  // saveDataToLocalStorage(); // 保存数据
});

</script>

<style scoped>
.calendar-container {
  position: relative;
  font-family: Arial, sans-serif;
  width: 100%;
  min-height: 175px;     
  padding: 20px;
  padding-top: 15px;
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
  margin: 0 1px;
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
  flex-direction: column;
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
  border: #faf8f8 solid 1px;
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

.welcome-text-simple {
  color: #b0b0b0;
  font-size: 1em;
  font-weight: 400;
  margin-bottom: 8px;
  letter-spacing: 1px;
  text-align: center;
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
    flex-direction: row;
    gap: 16px;
    align-items: center;
    overflow-x: auto;
    justify-content: center;
  }

  .month-divider {
    width: 3px;
    height: 100px;
    margin-top: 24px;
    background: linear-gradient(180deg, transparent, rgba(79, 195, 247, 0.3), transparent);
  }

  .month-divider::before {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .month-grid {
    transform: scale(0.85);
    margin: 0 8px;
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

/* 超时未签退警示样式 */
.overtime-warning {
  margin-top: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #ff4757, #ff6b7a);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  animation: overtime-pulse 2s infinite;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.overtime-warning i {
  font-size: 14px;
  color: #fff;
}

/* 超时警示脉冲动画 */
@keyframes overtime-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 4px 16px rgba(255, 71, 87, 0.6);
  }
}

</style>