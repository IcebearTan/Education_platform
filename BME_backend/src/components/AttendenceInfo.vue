<template>
  <div class="selectable">
    <div class="row">
      <div class="title">考勤时长</div>
      <el-select
        class="select"
        v-model="value"
        placeholder="Select"
        size="large"
        style="width: 160px"
      >
  <el-option-group label="按月筛选">
    <el-option
      v-for="item in options.filter(option => option.group === 'month')"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-option-group>
  <el-option-group label="按周筛选">
    <el-option
      v-for="item in options.filter(option => option.group === 'week')"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-option-group>
      </el-select>
      <el-button class="export-button" type="primary" size="small" @click="exportToExcel">
        导出表单为 Excel
      </el-button>
    </div>
    <div class="table">
        <el-table :data="Array.isArray(filteredData) && filteredData.length > 0 ? filteredData : attendenceInfo" style="width: 100%; max-height: 700px; overflow-y: auto;">
            <el-table-column v-for="item in tableLabel" :key="item.prop" :prop="item.prop" :label="item.label"
            :width="item.width ? item.width : 125" />
            <el-table-column fixed="right" label="" min-width="120">
                <template #="scoped">
                    <!-- <el-button type="primary" size="small" @click="handleEdit(scoped.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scoped.row)">删除</el-button> -->
                </template>
            </el-table-column>
        </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api';
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

defineProps({// 接收UserAttendence.vue组件传递的属性
  filteredData: {
    type: Array,
    default: null
  }
});

const attendenceInfo = ref([])
const tableLabel = ref([
    {
        prop: 'user_id',
        label: '用户ID',
        width: 150
    },
    {
        prop: 'user_name',
        label: '用户名',
        width: 300
    },
    {
        prop: 'student_id',
        label: '学号',
        width: 200
    },
    {
        prop: 'total_duration',
        label: '总时长',
        width: 400
    }
])
const options = ref([]);

const generateOptions = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 当前月份（从 0 开始，所以需要加 1）
  const day = today.getDate();

  // 本月
  const currentMonth = `${year}年${month}月`;

  // 上月
  let lastMonthYear = year;
  let lastMonth = month - 1;
  if (lastMonth === 0) {
    lastMonth = 12;
    lastMonthYear -= 1;
  }
  const previousMonth = `${lastMonthYear}年${lastMonth}月`;

  // 本周
  const currentDayOfWeek = today.getDay(); // 当前是星期几（0 表示周日）
  const offset = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // 计算本周的开始日期（周一）
  const startOfWeek = new Date(today);
  startOfWeek.setDate(day - offset);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatDate = (date) => {
    const y = String(date.getFullYear()).slice(2); // 获取年份后两位
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  const currentWeek = `${formatDate(startOfWeek)}-${formatDate(endOfWeek)}`;

  // 上周
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfLastWeek);
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
  const lastWeek = `${formatDate(startOfLastWeek)}-${formatDate(endOfLastWeek)}`;

  // 更新 options
  options.value = [
    { value: '本月', label: currentMonth, group: 'month' },
    { value: '上月', label: previousMonth, group: 'month' },
    { value: '本周', label: currentWeek, group: 'week' },
    { value: '上周', label: lastWeek, group: 'week' },
  ];
};

const value = ref('本月')
const formattedMonthDate = ref('')
const formattedWeekDate = ref('')

const exportToExcel = () => {
  if (attendenceInfo.value.length === 0) {
    ElMessage.warning('表单数据为空，无法导出！');
    return;
  }

  // 动态生成文件名
  let fileName = '';
  if (value.value === '本月' || value.value === '上月') {
    const [year, month] = formattedMonthDate.value.split('-');
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    fileName = `${year.slice(2)}年${monthNames[parseInt(month, 10) - 1]}考勤数据`;
  } else if (value.value === '本周' || value.value === '上周') {
    fileName = `${formattedWeekDate.value}考勤数据`;
  } else {
    fileName = '考勤数据';
  }

  // 将表单数据转换为 Excel 格式
  const worksheet = XLSX.utils.json_to_sheet(attendenceInfo.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, fileName);

  // 将 Excel 文件导出
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${fileName}.xlsx`);

  ElMessage.success('表单数据已导出为 Excel 文件！');
};

const fetchMonthAttendenceInfo = async () => {
    try {
        const response = await api({
            url: '/admin_records',
            method: 'get'
        });

        if (response.data) {
            attendenceInfo.value = response.data.map(item => {
                // 找到 monthly_records 中 year_month 等于 formattedMonthDate 的记录
                const record = item.monthly_records.find(record => {
                    return record.year_month === formattedMonthDate.value
                });

                return {
                    user_id: item.user_id,
                    user_name: item.user_name,
                    student_id: item.student_id || '无', // 如果没有 student_id，默认值为 '无'
                    total_duration: record ? record.total_duration : '无', // 如果没有匹配项，默认值
                    total_hours: record ? record.total_hours : -1, // 如果没有匹配项，默认值
                };
            });
        } else {
            ElMessage.error('获取考勤信息失败');
        }
    } catch (error) {
        ElMessage.error('获取考勤信息失败');
    }
};

const fetchWeekAttendenceInfo = async (formattedWeekDate) => {
    try {
        const response = await api({
            url: '/weekly_records',
            method: 'get'
        });

        if (response.data) {
            // 将 formattedWeekDate 拆分为 startDate 和 endDate
            const [startDate, endDate] = formattedWeekDate.split('-').map(date => {
                // 将日期从 "YYYY.MM.DD" 转换为 "YYYY-MM-DD"
                return date.replace(/\./g, '-');
            });

            attendenceInfo.value = response.data.map(item => {
                // 判断是否匹配当前周或上一周
                let record = null;
                if (item.current_week.start_date === startDate && item.current_week.end_date === endDate) {
                    record = item.current_week;
                } else if (item.last_week.start_date === startDate && item.last_week.end_date === endDate) {
                    record = item.last_week;
                }

                return {
                    user_id: item.user_id,
                    user_name: item.user_name,
                    total_duration: record ? record.total_duration : '无', // 如果没有匹配项，默认值
                    student_id: item.student_id || '无', // 如果没有 student_id，默认值为 '无'
                    total_hours: record ? record.total_hours : -1, // 如果没有匹配项，默认值
                };
            });

            console.log("筛选后的考勤信息:", attendenceInfo.value);
        } else {
            ElMessage.error('获取考勤信息失败');
        }
    } catch (error) {
        ElMessage.error('获取考勤信息失败');
    }
};

onMounted(() => {
    generateOptions();
    filterInfo();
})

watch(value, (newValue, oldValue) => {
    filterInfo()
})

async function filterInfo() {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // 获取当前月份（从 0 开始，所以需要加 1）
    let day = today.getDate(); // 获取当前日期

    if (value.value === '本月') {
        formattedMonthDate.value = `${year}-${String(month).padStart(2, '0')}`;
        // console.log('当前月份:', formattedMonthDate.value);
        await fetchMonthAttendenceInfo(formattedMonthDate.value);
    } else if (value.value === '上月') {
        month -= 1;
        if (month === 0) {
            month = 12;
            year -= 1;
        }
        formattedMonthDate.value = `${year}-${String(month).padStart(2, '0')}`;
        // console.log('上月月份:', formattedMonthDate.value);
        await fetchMonthAttendenceInfo(formattedMonthDate.value);
    } else if (value.value === '本周' || value.value === '上周') {
        const currentDayOfWeek = today.getDay(); // 获取当前是星期几（0 表示周日）
        const offset = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // 计算本周的开始日期（周一）
        let startOfWeek = new Date(today); // 克隆当前日期

        if (value.value === '本周') {
            startOfWeek.setDate(day - offset); // 本周的周一
        } else if (value.value === '上周') {
            startOfWeek.setDate(day - offset - 7); // 上周的周一
        }

        const endOfWeek = new Date(startOfWeek); // 计算周的结束日期
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // 格式化为 "YYYY.MM.DD-YYYY.MM.DD"
        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}.${m}.${d}`;
        };

        formattedWeekDate.value = `${formatDate(startOfWeek)}-${formatDate(endOfWeek)}`;
        // console.log('当前周范围:', formattedWeekDate.value);

        // 调用获取周数据的函数
        await fetchWeekAttendenceInfo(formattedWeekDate.value);
    }
}
// 暴露数据给UserAttendence.vue
defineExpose({ attendenceInfo });
</script>

<style scoped>
.title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #555;

    margin-left: 10px;
}

.selectable {
    user-select: text;
}
.row {
  display: flex;
  align-items: center; /* 垂直居中 */
  margin-bottom: 20px;
}
.select{
    position: relative;
    left: 30px;
    top: -5px; /* 向上移动 10px */
}
.export-button {
  margin-left: 20px; /* 按钮与下拉框的间距 */
  position: relative;
  left: 30px;
  top: -5px; /* 向上移动 10px */
}
</style>
