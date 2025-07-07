<template>
  <div class="student-group-container">
    <div class="student-group-card">
      <div class="title">
        <div class="back-button" @click="goback()">
          <el-icon class="back-arrow"><Back /></el-icon>
        </div>
        <div class="title-text">
          {{ groupTitle }}
          <el-tag :color="userRole === 'teacher' ? '#b391ff' : currentUserPermissions.color" style="margin-left: 10px; color: white;">
            {{ currentUserPermissions.name }}
          </el-tag>
        </div>
        <div class="more-button">
          <el-popover placement="bottom-end" :width="200" trigger="click">
            <template #reference>
              <el-icon class="more-icon"><MoreFilled /></el-icon>
            </template>
            <div style="display: flex; flex-direction: column;">
              <div class="more-item">
                <!-- 动态渲染可用的操作按钮 -->
                <div 
                  v-for="action in availableActions" 
                  :key="action.id"
                  class="more-item-button" 
                  :class="{
                    active: (action.id === 'view_tasks' && currentTab === 'task') || 
                            (action.id === 'view_rank' && currentTab === 'rank') ||
                            (action.id === 'view_leave' && currentTab === 'leave')
                  }"
                  @click="handleAction(action)"
                >
                  {{ action.label }}
                </div>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
      <div class="card-content-scroll">
        <StudentGroupTask v-if="currentTab === 'task'" :userRole="userRole" :groupId="2" />
        <StudentGroupRank v-else-if="currentTab === 'rank'" />
        <StudentGroupLeave v-else-if="currentTab === 'leave'" :userRole="userRole" :groupId="2" />
      </div>
    </div>

    <!-- 通知发送弹窗 -->
    <!-- <el-dialog 
      v-model="noticeDialogVisible" 
      title="发送通知" 
      width="600px"
    >
      <el-form :model="noticeForm" label-width="100px">
        <el-form-item label="通知标题" required>
          <el-input v-model="noticeForm.title" placeholder="请输入通知标题" />
        </el-form-item>
        <el-form-item label="通知内容" required>
          <el-input 
            v-model="noticeForm.content" 
            type="textarea" 
            :rows="5"
            placeholder="请输入通知内容"
          />
        </el-form-item>
        <el-form-item label="发送对象">
          <el-select v-model="noticeForm.recipients" style="width: 100%">
            <el-option label="全体学生" value="all"></el-option>
            <el-option label="当前小组" value="group"></el-option>
            <el-option label="指定学生" value="specific"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="noticeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNotice">发送通知</el-button>
        </div>
      </template>
    </el-dialog> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back, MoreFilled } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import StudentGroupTask from './StudentGroupTask.vue'
import StudentGroupRank from './StudentGroupRank.vue'
import StudentGroupLeave from './StudentGroupLeave.vue'

import api from '../../api'

const router = useRouter()
const route = useRoute()
const store = useStore()
const currentTab = ref('task')

// 用户角色管理（生产环境：根据账号自动判断）
const userRole = ref('student')

// 监听用户信息变化，未登录自动跳转到登录页
watch(
  () => store.state.user,
  (user) => {
    if (!user || !user.User_Mode) {
      router.push('/login')
    } else {
      userRole.value = user.User_Mode === 'admin' ? 'teacher' : 'student'
    }
  },
  { immediate: true }
)

// 角色权限配置
const rolePermissions = {
  student: {
    name: '学生',
    color: '#409EFF',
    actions: [
      { id: 'view_tasks', label: '查看任务', icon: '📋' },
      { id: 'view_rank', label: '查看排行榜', icon: '🏆' },
      { id: 'view_leave', label: '请假管理', icon: '🚫', type: 'danger' }
    ],
    tabs: ['task', 'rank', 'leave']
  },
  teacher: {
    name: '老师',
    color: '#67C23A',
    actions: [
      { id: 'view_tasks', label: '任务管理', icon: '📝', type: 'primary' },
      { id: 'view_rank', label: '查看排行榜', icon: '🏆' },
      { id: 'view_leave', label: '请假管理', icon: '✅', type: 'success' }
    ],
    tabs: ['task', 'rank', 'leave', 'management']
  }
}

// 计算当前用户的权限
const currentUserPermissions = computed(() => {
  return rolePermissions[userRole.value] || rolePermissions.student
})

// 检查用户是否有特定权限
const hasPermission = (actionId) => {
  return currentUserPermissions.value.actions.some(action => action.id === actionId)
}

// 获取可用的操作按钮
const availableActions = computed(() => {
  return currentUserPermissions.value.actions.filter(action => {
    // 可以在这里添加更细粒度的权限控制
    return true
  })
})

// 请假相关状态
const noticeDialogVisible = ref(false)

// 通知发送表单
const noticeForm = ref({
  title: '',
  content: '',
  recipients: 'all'
})

// 解析 group_id 并直接作为标题
const groupTitle = computed(() => route.query.group_id || '小组详情')

// 动态小组标题（可后续对接API或props）
const defaultGroupTitle = ref('C语言程序设计')

// 统一的操作处理函数
const handleAction = (action) => {
  switch (action.id) {
    case 'view_tasks':
      toTasks()
      break
    case 'view_rank':
      toRank()
      break
    case 'view_leave':
      toLeave()
      break
    // case 'send_notice':
    //   openNoticeDialog()
    //   break
    case 'manage_group':
      currentTab.value = 'management'
      break
    default:
      ElMessage.info(`执行操作: ${action.label}`)
  }
}

const goback = () => {
  router.push('/user-center/my-groups')
}

const toRank = () => {
  if (currentTab.value !== 'rank') {
    currentTab.value = 'rank'
  } else {
    ElMessage({
      message: '当前页面已经是排行榜页面',
      type: 'warning',
      duration: 2000
    })
  }
}

const toTasks = () => {
  if (currentTab.value !== 'task') {
    currentTab.value = 'task'
  } else {
    ElMessage({
      message: '当前页面已经是任务页面',
      type: 'warning',
      duration: 2000
    })
  }
}

const toLeave = () => {
  if (currentTab.value !== 'leave') {
    currentTab.value = 'leave'
  } else {
    ElMessage({
      message: '当前页面已经是请假管理页面',
      type: 'warning',
      duration: 2000
    })
  }
}

// 新增的弹窗处理函数
// const openNoticeDialog = () => {
//   if (hasPermission('send_notice')) {
//     noticeDialogVisible.value = true
//   } else {
//     ElMessage.error('权限不足')
//   }
// }

// 提交任务发布
const submitTask = async () => {
  try {
    // 字段映射
    const payload = {
      Title: taskForm.value.title,
      Content: taskForm.value.content,
      End_Time: formatDateTime(taskForm.value.deadline),
      Priority: mapPriority(taskForm.value.priority),
      Group_Id: 2 // 实际小组ID，建议动态传递
    };
    await api({
      url: '/information/task/add',
      method: 'post',
      data: payload
    });
    ElMessage.success('任务发布成功');
    taskDialogVisible.value = false;
    taskForm.value = { title: '', content: '', deadline: '', priority: 'normal' };
  } catch (error) {
    ElMessage.error('发布失败，请重试');
  }
};

// 时间格式化函数，输出YYYY-MM-DD HH:mm:ss
function formatDateTime(val) {
  if (!val) return '';
  const d = new Date(val);
  const pad = n => n < 10 ? '0' + n : n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 优先级映射（如有调整请修改）
function mapPriority(val) {
  switch(val) {
    case 'urgent': return 0;
    case 'high': return 1;
    case 'normal': return 2;
    case 'low': return 3;
    default: return 2;
  }
}

// 提交通知发送
// const submitNotice = async () => {
//   try {
//     ElMessage.success('通知发送成功')
//     noticeDialogVisible.value = false
//     noticeForm.value = { title: '', content: '', recipients: 'all' }
//   } catch (error) {
//     ElMessage.error('发送失败，请重试')
//   }
// }

onMounted(() => {
  // 可以在这里从 API 获取用户角色和权限
  // const userData = await getUserInfo()
  // userRole.value = userData.role
})
</script>

<style scoped>
.student-group-container{
  width: 100%;
  margin-top: 10px;
}

.student-group-card{
  height: 1000px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.card-content-scroll {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 850px;
  overflow-y: auto;
  /* padding-bottom: 20px; */
  padding: 10px;
}

.title{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-text{
  display: flex;
  align-items: center;
}

.back-button{
  margin-left: 20px;
  margin-top: 20px;
  cursor: pointer;
  color: #444;
  font-size: 25px;
  font-weight: bold;
}

.back-arrow:hover{
  transform: translateX(5px);
  text-shadow: #ff0000 0 0 5px;
  transition: transform 0.2s ease-in-out;
}

.back-arrow:active{
  opacity: 0.5;
}

.more-button{
  margin-right: 20px;
  margin-top: 20px;
  cursor: pointer;
  color: #444;
  font-size: 25px;
}

.more-button:active{
  opacity: 0.5;
}

.more-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  gap: 14px;
}

.more-item-button {
  width: 120px;
  height: 32px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #0ac0ba;
  border-radius: 6px;
  border: 1.5px solid transparent;
  background: transparent;
  transition: background 0.2s, color 0.2s, border 0.2s;
  margin: 0 auto;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.more-item-button.active {
  border: 1.5px solid #0ac0ba;
  background: #e6faf9;
  color: #0ac0ba;
}

.more-item-button:hover {
  background: #e6faf9;
}

.more-item-button:active {
  opacity: 0.5;
}

/* 弹窗样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 角色权限相关样式 */
.management-panel {
  padding: 20px;
}

.role-switch {
  text-align: center;
}
</style>
