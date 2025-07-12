<script setup>
import api from '../api';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AttendenceInfo from './AttendenceInfo.vue';
import AttendenceCodeComponent from './AttendenceCodeComponent.vue';

const formInline = reactive({
  key: ''
})

const attendenceInfoRef = ref(null); // 用于获取子组件实例
const filteredAttendence = ref([]);  // 存储搜索结果

const handleSearch = () => {
  const keyword = formInline.key.trim();
  if (!attendenceInfoRef.value || !Array.isArray(attendenceInfoRef.value.attendenceInfo)) {
    filteredAttendence.value = [];
    return;
  }
  const data = attendenceInfoRef.value.attendenceInfo;
  if (!keyword) {
    filteredAttendence.value = data;
    return;
  }
  filteredAttendence.value = data.filter(item => {
    const name = item.user_name ? String(item.user_name) : '';
    const id = item.user_id ? String(item.user_id) : '';
    const studentId = item.student_id ? String(item.student_id) : '';
    return name.includes(keyword) || id.includes(keyword) || studentId.includes(keyword);
  });
}

// const codes = ref([])

// const tableLabel = [
//   {
//     label: '考勤码',
//     prop: 'check_code',
//     width: 200
//   },
//   {
//     label: '考勤码类型',
//     prop: 'type',
//     width: 200
//   },
//   {
//     label: '创建时间',
//     prop: 'created_at',
//     width: 200
//   },
//   {
//     label: '剩余时间',
//     prop: 'status',
//     width: 200
//   }
// ]

// const handleSubmit = async () => {
//   try {
//     const response = await api({
//       url: '/generate-code',
//       method: 'post',
//       data: {
//         type: form.type
//       }
//     })

//     if (response.data) {
//       codes.value.push(response.data)
//     } else {
//       ElMessage.error('生成考勤码失败')
//     }
//   } catch (error) {
//     ElMessage.error('生成考勤码失败')
//   }

//   dialogFormVisible.value = false
//   form.type = ''
// }

// const handleCancle = () => {
//   dialogFormVisible.value = false
//   form.type = ''
// }

// const getCodesFromLocalStorage = () => {
//   codes.value = JSON.parse(localStorage.getItem('codes')) || []
// }

// const saveCodesToLocalStorage = (codes) => {
//   console.log('saveCodesToLocalStorage', codes.value)
//   localStorage.setItem('codes', JSON.stringify(codes))
// }

// const dialogFormVisible = ref(false)

// const form = reactive({
//   type: '',
// })

// onMounted(() => {
//   getCodesFromLocalStorage()
// })

// onUnmounted(() => {
//   saveCodesToLocalStorage(codes.value)
// })
</script>

<template>
  <div class="attendance-container">
    <div class="header-container">
      <div class="l-container">
        <span>考勤管理</span>
        <!-- <el-button class="create-button" type="primary" size="large" @click="dialogFormVisible = true">生成考勤码</el-button> -->
      </div>
      <div class="r-container">
        <el-form :inline="true" class="form-inline" :model="formInline"  @submit.prevent>
          <el-form-item label="查询" style="margin: 0; align-items: center;">
            <el-input placeholder=" 请输入用户名" v-model="formInline.key"  @keyup.enter="handleSearch"></el-input>
          </el-form-item>
          <el-form-item style="margin: 0; align-items: center; margin-right: 20px; margin-left: 10px;">
            <el-button type="primary" @click="handleSearch">
              <el-icon>
                <Search />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="content-container">
      <div class="section">
        <AttendenceCodeComponent />
      </div>  
      <div class="section">
        <AttendenceInfo ref="attendenceInfoRef" :filteredData="filteredAttendence" />
      </div>
    </div>

    <!-- <el-dialog v-model="dialogFormVisible" title="选择码类型" width="380">
      <el-form :model="form">
        <el-form-item label="签到/签退">
          <el-select v-model="form.type" placeholder="请选择生成类型">
            <el-option label="签到码" value="check_in" />
            <el-option label="签退码" value="check_out" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancle()">取消</el-button>
          <el-button type="primary" @click="handleSubmit()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog> -->
  </div>
</template>

<style scoped>
.attendance-container {
  height: calc(100vh - 60px); /* 减去菜单栏高度 */
  display: flex;
  flex-direction: column;
  background-color: #fff;
  position: relative;
  overflow: hidden; /* 防止出现外层滚动条 */
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  height: 50px;
  flex-shrink: 0;
  background-color: #fff;
  z-index: 1;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  overflow: hidden; /* 移除外层滚动条 */
  height: calc(100% - 50px); /* 减去header高度 */
}

.section {
  padding-bottom: 20px;
  flex-shrink: 0; /* 防止内容被压缩 */
}

.section:first-child {
  padding-top: 20px;
}

/* AttendenceInfo 所在的 section 应该占据剩余空间并允许内部滚动 */
.section:last-child {
  flex: 1;
  overflow: hidden; /* 确保内部表格的滚动正常工作 */
  padding-bottom: 0;
  min-height: 0; /* 确保 flex-grow 正常工作 */
}

.l-container {
  display: inline-block;
  font-size: 30px;
  font-weight: 900;
  color: #3b5cd5;
}

.r-container {
  display: flex;
  align-items: center;
}

.r-container .form-inline {
  display: flex;
  justify-content: center;
  margin: 0;
}

.r-container .form-inline .el-form-item {
  text-align: center;
}

.default-card {
  display: inline-block;
  width: 350px;
  margin: 20px;
  cursor: pointer;
}

.default-card:hover {
  transform: translateY(-10px);
  box-shadow: #c4c4c4 0px 0px 10px;
}

.loading {
  margin-left: 30px;
  font-size: 20px;
  font-weight: 900;
  color: #4f4f4f;
}

.details {
  color: #767676;
}

.create-button {
  display: inline-block;
  margin-left: 20px;
  margin-bottom: 5px;
}
</style>
