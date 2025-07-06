<template>
  <div class="student-group-container">
    <div class="student-group-card">
      <div class="title">
        <div class="back-button" @click="goback()">
          <el-icon class="back-arrow"><Back /></el-icon>
        </div>
        <div class="title-text">
          {{ currentUserPermissions.name }} - C语言程序设计
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
                            (action.id === 'view_rank' && currentTab === 'rank'),
                    'is-disabled': action.id === 'view_rank'
                  }"
                  @click="action.id === 'view_rank' ? null : handleAction(action)"
                  :style="action.id === 'view_rank' ? 'pointer-events: none; opacity: 0.5;' : ''"
                >
                  {{ action.label }}
                </div>
              </div>
              
              <!-- 角色切换按钮（仅用于演示，生产环境应该移除） -->
              <div class="role-switch" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                <el-text size="small" style="margin-bottom: 5px; display: block;">演示角色切换：</el-text>
                <el-button-group size="small">
                  <el-button 
                    v-for="(role, key) in rolePermissions" 
                    :key="key"
                    :type="userRole === key ? 'primary' : 'default'"
                    @click="switchRole(key)"
                    size="small"
                  >
                    {{ role.name }}
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
      <div style="margin-top: 30px;">
        <StudentGroupTask v-if="currentTab === 'task'" />
        <StudentGroupRank v-else-if="currentTab === 'rank'" />
      </div>
    </div>

    <!-- 请假申请弹窗 -->
    <el-dialog 
      v-model="leaveDialogVisible" 
      title="申请请假" 
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form 
        :model="leaveForm" 
        :rules="leaveFormRules" 
        ref="leaveFormRef"
        label-width="100px"
      >
        <el-form-item label="请假原因" prop="reason">
          <el-select v-model="leaveForm.reason" placeholder="请选择请假原因" style="width: 100%">
            <el-option label="病假" value="sick"></el-option>
            <el-option label="事假" value="personal"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="leaveForm.startDate"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
            v-model="leaveForm.endDate"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="详细说明">
          <el-input
            v-model="leaveForm.description"
            type="textarea"
            :rows="3"
            placeholder="请详细说明请假原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="leaveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitLeaveRequest">提交申请</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务发布弹窗 -->
    <el-dialog 
      v-model="taskDialogVisible" 
      title="发布新任务" 
      width="600px"
    >
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务标题" required>
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务内容" required>
          <el-input 
            v-model="taskForm.content" 
            type="textarea" 
            :rows="4"
            placeholder="请详细描述任务内容"
          />
        </el-form-item>
        <el-form-item label="截止时间" required>
          <el-date-picker
            v-model="taskForm.deadline"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="taskForm.priority" style="width: 100%">
            <el-option label="低" value="low"></el-option>
            <el-option label="普通" value="normal"></el-option>
            <el-option label="高" value="high"></el-option>
            <el-option label="紧急" value="urgent"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="taskDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTask">发布任务</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 请假审批弹窗 -->
    <el-dialog 
      v-model="approvalDialogVisible" 
      title="请假审批" 
      width="700px"
    >
      <el-table :data=" [
        { id: 1, student: '张三', reason: '病假', startDate: '2024-03-25', endDate: '2024-03-26', status: 'pending' },
        { id: 2, student: '李四', reason: '事假', startDate: '2024-03-27', endDate: '2024-03-27', status: 'pending' },
        { id: 3, student: '王五', reason: '其他', startDate: '2024-03-28', endDate: '2024-03-29', status: 'pending' }
      ]" style="width: 100%">
        <el-table-column prop="student" label="学生姓名" width="100" />
        <el-table-column prop="reason" label="请假原因" width="100" />
        <el-table-column prop="startDate" label="开始时间" width="120" />
        <el-table-column prop="endDate" label="结束时间" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="success" size="small" @click="approveLeave(scope.row)">批准</el-button>
            <el-button type="danger" size="small" @click="rejectLeave(scope.row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 通知发送弹窗 -->
    <el-dialog 
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
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back, MoreFilled } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import StudentGroupTask from './StudentGroupTask.vue'
import StudentGroupRank from './StudentGroupRank.vue'

const router = useRouter()
const store = useStore()
const currentTab = ref('task') // 'task' 或 'rank'

// 用户角色管理
const userRole = ref('student') // 模拟角色，实际应从 store 或 API 获取
const userId = ref('12345') // 模拟用户ID

// 角色权限配置
const rolePermissions = {
  student: {
    name: '学生',
    color: '#409EFF',
    actions: [
      { id: 'view_tasks', label: '查看任务', icon: '📋' },
      { id: 'view_rank', label: '查看排行榜', icon: '🏆' },
      { id: 'apply_leave', label: '申请请假', icon: '🚫', type: 'danger' }
    ],
    tabs: ['task', 'rank']
  },
  teacher: {
    name: '老师',
    color: '#67C23A',
    actions: [
      { id: 'view_tasks', label: '查看任务', icon: '📋' },
      { id: 'publish_task', label: '发布任务', icon: '📝', type: 'primary' },
      { id: 'view_rank', label: '查看排行榜', icon: '🏆' },
      { id: 'approve_leave', label: '审批请假', icon: '✅', type: 'success' },
      { id: 'send_notice', label: '发送通知', icon: '📢', type: 'warning' }
    ],
    tabs: ['task', 'rank', 'management']
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
const leaveDialogVisible = ref(false)
const taskDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const noticeDialogVisible = ref(false)

const leaveForm = ref({
  reason: '',
  startDate: '',
  endDate: '',
  description: ''
})

// 任务发布表单
const taskForm = ref({
  title: '',
  content: '',
  deadline: '',
  priority: 'normal'
})

// 通知发送表单
const noticeForm = ref({
  title: '',
  content: '',
  recipients: 'all'
})

const leaveFormRules = ref({
  reason: [{ required: true, message: '请选择请假原因', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
})

// 角色切换函数（仅用于演示）
const switchRole = (role) => {
  userRole.value = role
  currentTab.value = 'task' // 切换角色时重置到任务页面
  ElMessage({
    message: `已切换到${rolePermissions[role].name}角色`,
    type: 'success',
    duration: 2000
  })
}

// 统一的操作处理函数
const handleAction = (action) => {
  switch (action.id) {
    case 'view_tasks':
      toTasks()
      break
    case 'view_rank':
      toRank()
      break
    case 'apply_leave':
      openLeaveDialog()
      break
    case 'publish_task':
      openTaskDialog()
      break
    case 'approve_leave':
      openApprovalDialog()
      break
    case 'send_notice':
      openNoticeDialog()
      break
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

// 请假申请处理
const submitLeaveRequest = async () => {
  try {
    // 这里调用 API 提交请假申请
    // const response = await api.post('/leave/apply', leaveForm.value)
    
    ElMessage({
      message: '请假申请已提交，等待审批',
      type: 'success',
      duration: 3000
    })
    
    leaveDialogVisible.value = false
    resetLeaveForm()
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  }
}

const resetLeaveForm = () => {
  leaveForm.value = {
    reason: '',
    startDate: '',
    endDate: '',
    description: ''
  }
}

const handleDialogClose = (done) => {
  // done 是一个函数，调用它来关闭弹窗
  resetLeaveForm()
  done()
}

const openLeaveDialog = () => {
  leaveDialogVisible.value = true
}

// 新增的弹窗处理函数
const openTaskDialog = () => {
  if (hasPermission('publish_task')) {
    taskDialogVisible.value = true
  } else {
    ElMessage.error('权限不足')
  }
}

const openApprovalDialog = () => {
  if (hasPermission('approve_leave')) {
    approvalDialogVisible.value = true
  } else {
    ElMessage.error('权限不足')
  }
}

const openNoticeDialog = () => {
  if (hasPermission('send_notice')) {
    noticeDialogVisible.value = true
  } else {
    ElMessage.error('权限不足')
  }
}

// 提交任务发布
const submitTask = async () => {
  try {
    ElMessage.success('任务发布成功')
    taskDialogVisible.value = false
    taskForm.value = { title: '', content: '', deadline: '', priority: 'normal' }
  } catch (error) {
    ElMessage.error('发布失败，请重试')
  }
}

// 提交通知发送
const submitNotice = async () => {
  try {
    ElMessage.success('通知发送成功')
    noticeDialogVisible.value = false
    noticeForm.value = { title: '', content: '', recipients: 'all' }
  } catch (error) {
    ElMessage.error('发送失败，请重试')
  }
}

// 请假审批处理
const approveLeave = (row) => {
  ElMessage.success(`已批准 ${row.student} 的请假申请`)
}

const rejectLeave = (row) => {
  ElMessage.warning(`已拒绝 ${row.student} 的请假申请`)
}

// 初始化权限检查
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
