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
        <StudentGroupTask 
          ref="studentGroupTaskRef"
          v-if="currentTab === 'task' && !showTaskDetail" 
          :userRole="userRole" 
          :groupId="groupId" 
          @goToTaskDetail="handleGoToTaskDetail"
        />
        <TaskDetailComponent
          v-if="currentTab === 'task' && showTaskDetail"
          :taskId="currentTaskId"
          :userRole="userRole"
          :groupId="groupId"
          :taskDetail="currentTaskDetail"
          @back="handleBackToTaskList"
          @taskUpdated="handleTaskUpdated"
        />
        <StudentGroupRank v-else-if="currentTab === 'rank'" :groupId="groupId" />
        <StudentGroupLeave v-else-if="currentTab === 'leave'" :userRole="userRole" :groupId="groupId" />
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
import TaskDetailComponent from './TaskDetailComponent.vue'

const router = useRouter()
const route = useRoute()
const store = useStore()
const currentTab = ref('task')

// 任务详情相关状态
const showTaskDetail = ref(false)
const currentTaskId = ref(null)
const currentTaskDetail = ref({})

// 添加对 StudentGroupTask 组件的引用
const studentGroupTaskRef = ref(null)

// 用户角色管理（根据当前小组中的身份动态判断）
const userRole = ref('student')
const currentGroupData = ref(null)

// 根据用户在当前小组中的身份确定角色
const determineUserRoleInGroup = async () => {
  try {
    // 获取当前用户的所有小组信息
    const response = await api.get('/user/group')
    
    if (response.data.code === 200) {
      const currentUserId = store.state.user?.User_Id
      if (!currentUserId) return
      
      const currentGroupId = parseInt(groupId.value)
      
      // 在所有小组中查找当前小组
      const allGroups = [
        ...(response.data.project_group || []),
        ...(response.data.study_group || [])
      ]
      
      // 确保每个小组都有group_name字段
      allGroups.forEach(group => {
        if (!group.group_name && group.title) {
          group.group_name = group.title;
        }
      });
      
      const currentGroup = allGroups.find(group => group.group_id === currentGroupId)
      
      if (currentGroup) {
        currentGroupData.value = currentGroup
        
        // 判断当前用户在这个小组中的身份
        if (currentGroup.teacher_id === parseInt(currentUserId)) {
          userRole.value = 'teacher'
        } else if (currentGroup.students && currentGroup.students.some(student => student.Student_Id === parseInt(currentUserId))) {
          userRole.value = 'student'
        } else {
          // 用户不在这个小组中，可能是管理员查看
          userRole.value = store.state.user?.User_Mode === 'admin' ? 'teacher' : 'student'
        }
      } else {
        // 如果找不到小组，使用默认角色判断
        userRole.value = store.state.user?.User_Mode === 'admin' ? 'teacher' : 'student'
      }
    }
  } catch (error) {
    console.error('获取小组信息失败:', error)
    // 出错时使用默认角色判断
    userRole.value = store.state.user?.User_Mode === 'admin' ? 'teacher' : 'student'
  }
}

// 监听用户信息变化，未登录自动跳转到登录页
watch(
  () => store.state.user,
  (user) => {
    if (!user || !user.User_Mode) {
      router.push('/login')
    } else {
      // 获取小组数据并判断用户在当前小组中的身份
      determineUserRoleInGroup()
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

// 解析 group_id 并动态获取标题
const groupTitle = computed(() => {
  // 优先使用路由参数中的group_name
  if (route.query.group_name) {
    return route.query.group_name
  }
  
  // 如果路由参数中没有，尝试从当前小组数据中获取group_name
  if (currentGroupData.value) {
    return currentGroupData.value.group_name || currentGroupData.value.title || '小组详情'
  }
  
  // 最后的备选方案
  return '小组详情'
})

// 获取实际的 groupId
const groupId = computed(() => route.query.group_id || route.params.groupId || '2')

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
    showTaskDetail.value = false // 确保返回任务列表
  } else {
    ElMessage({
      message: '当前页面已经是任务页面',
      type: 'warning',
      duration: 2000
    })
  }
}

// 处理跳转到任务详情
const handleGoToTaskDetail = (taskInfo) => {
  currentTaskId.value = taskInfo.taskId
  currentTaskDetail.value = taskInfo.taskDetail || {}
  showTaskDetail.value = true
}

// 处理返回任务列表
const handleBackToTaskList = () => {
  showTaskDetail.value = false
  currentTaskId.value = null
  currentTaskDetail.value = {}
}

// 处理任务更新事件
const handleTaskUpdated = () => {
  // 刷新任务列表数据
  if (studentGroupTaskRef.value && studentGroupTaskRef.value.fetchTasks) {
    studentGroupTaskRef.value.fetchTasks()
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
      Group_Id: parseInt(groupId.value) || 2 // 使用实际的小组ID
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
  // 组件挂载时确定用户在当前小组中的身份
  determineUserRoleInGroup()
})

// 监听groupId变化，重新判断用户身份
watch(
  () => groupId.value,
  () => {
    determineUserRoleInGroup()
  }
)
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
  max-height: 950px;
  border-radius: 10px;
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
