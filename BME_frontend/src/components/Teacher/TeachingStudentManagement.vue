<template>
  <div class="teaching-student-management">
    <!-- 学生统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ studentStats.total }}</div>
        <div class="stat-label">总学生数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ studentStats.active }}</div>
        <div class="stat-label">活跃学生</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ studentStats.avgScore }}</div>
        <div class="stat-label">平均成绩</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ studentStats.attendance }}%</div>
        <div class="stat-label">出勤率</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="student-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showInviteDialog = true">
          <el-icon><Plus /></el-icon>
          邀请学生
        </el-button>
        <el-button @click="refreshStudents">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-select v-model="filterStatus" placeholder="学生状态" style="width: 120px" @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="活跃" value="active" />
          <el-option label="不活跃" value="inactive" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学生"
          style="width: 200px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 学生列表 -->
    <div class="student-list">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="filteredStudents.length === 0" class="empty-state">
        <el-empty description="暂无学生" />
      </div>
      <div v-else class="students-grid">
        <div v-for="student in filteredStudents" :key="student.id" class="student-card">
          <div class="student-header">
            <el-avatar :size="60" :src="getStudentAvatar(student)">
              {{ student.name.charAt(0) }}
            </el-avatar>
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-id">学号：{{ student.student_id }}</div>
              <el-tag :type="getStatusType(student.status)" size="small">
                {{ getStatusText(student.status) }}
              </el-tag>
            </div>
            <div class="student-actions">
              <el-dropdown @command="(cmd) => handleStudentAction(cmd, student)">
                <el-button text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">查看详情</el-dropdown-item>
                    <el-dropdown-item command="message">发送消息</el-dropdown-item>
                    <el-dropdown-item command="progress">学习进度</el-dropdown-item>
                    <el-dropdown-item command="remove" divided>移除学生</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="student-stats">
            <div class="stat-item">
              <div class="stat-value">{{ student.completed_tasks || 0 }}</div>
              <div class="stat-name">完成任务</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ student.score || 0 }}</div>
              <div class="stat-name">平均分</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ student.attendance || 0 }}%</div>
              <div class="stat-name">出勤率</div>
            </div>
          </div>
          
          <div class="student-footer">
            <span class="join-time">加入时间：{{ formatDate(student.join_time) }}</span>
            <span class="last-active">最后活跃：{{ formatDate(student.last_active) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 邀请学生对话框 -->
    <el-dialog v-model="showInviteDialog" title="邀请学生" width="500px">
      <el-form :model="inviteForm" :rules="inviteRules" ref="inviteFormRef" label-width="100px">
        <el-form-item label="邀请方式">
          <el-radio-group v-model="inviteForm.method">
            <el-radio label="email">邮箱邀请</el-radio>
            <el-radio label="code">邀请码</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="inviteForm.method === 'email'" label="邮箱地址" prop="emails">
          <el-input
            v-model="inviteForm.emails"
            type="textarea"
            :rows="4"
            placeholder="请输入邮箱地址，多个邮箱用换行或逗号分隔"
          />
        </el-form-item>
        
        <el-form-item v-if="inviteForm.method === 'code'" label="邀请码">
          <el-input v-model="inviteCode" readonly>
            <template #append>
              <el-button @click="generateInviteCode">生成</el-button>
            </template>
          </el-input>
          <div class="invite-code-info">
            <p>邀请码有效期：7天</p>
            <p>分享此邀请码给学生，他们可以通过此码加入小组</p>
          </div>
        </el-form-item>
        
        <el-form-item label="邀请消息">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            :rows="3"
            placeholder="可选：添加邀请消息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInviteDialog = false">取消</el-button>
        <el-button type="primary" @click="handleInvite" :loading="inviting">
          {{ inviteForm.method === 'email' ? '发送邀请' : '生成邀请码' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 学生详情对话框 -->
    <el-dialog v-model="showStudentDetail" title="学生详情" width="600px">
      <div v-if="selectedStudent" class="student-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="getStudentAvatar(selectedStudent)">
            {{ selectedStudent.name.charAt(0) }}
          </el-avatar>
          <div class="detail-info">
            <h3>{{ selectedStudent.name }}</h3>
            <p>学号：{{ selectedStudent.student_id }}</p>
            <p>邮箱：{{ selectedStudent.email }}</p>
          </div>
        </div>
        
        <el-tabs>
          <el-tab-pane label="基本信息">
            <div class="info-grid">
              <div class="info-item">
                <label>加入时间：</label>
                <span>{{ formatDate(selectedStudent.join_time) }}</span>
              </div>
              <div class="info-item">
                <label>最后活跃：</label>
                <span>{{ formatDate(selectedStudent.last_active) }}</span>
              </div>
              <div class="info-item">
                <label>完成任务：</label>
                <span>{{ selectedStudent.completed_tasks || 0 }} 个</span>
              </div>
              <div class="info-item">
                <label>平均分：</label>
                <span>{{ selectedStudent.score || 0 }} 分</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="学习记录">
            <p>学习记录功能开发中...</p>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Download, Search, MoreFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  },
  groupData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['students-updated'])

// 响应式数据
const loading = ref(false)
const inviting = ref(false)
const students = ref([])
const filterStatus = ref('')
const searchKeyword = ref('')
const showInviteDialog = ref(false)
const showStudentDetail = ref(false)
const selectedStudent = ref(null)
const inviteFormRef = ref()
const inviteCode = ref('')

// 邀请表单
const inviteForm = ref({
  method: 'email',
  emails: '',
  message: ''
})

// 表单验证规则
const inviteRules = {
  emails: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' }
  ]
}

// 计算属性
const studentStats = computed(() => {
  const total = students.value.length
  const active = students.value.filter(s => s.status === 'active').length
  const avgScore = total > 0 
    ? Math.round(students.value.reduce((sum, s) => sum + (s.score || 0), 0) / total)
    : 0
  const attendance = total > 0
    ? Math.round(students.value.reduce((sum, s) => sum + (s.attendance || 0), 0) / total)
    : 0
  
  return { total, active, avgScore, attendance }
})

const filteredStudents = computed(() => {
  let result = students.value

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(student => student.status === filterStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(student =>
      student.name.toLowerCase().includes(keyword) ||
      student.student_id.toLowerCase().includes(keyword) ||
      (student.email && student.email.toLowerCase().includes(keyword))
    )
  }

  return result
})

// 方法
const getStudentAvatar = (student) => {
  return student.avatar || ''
}

const getStatusType = (status) => {
  const typeMap = {
    'active': 'success',
    'inactive': 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'active': '活跃',
    'inactive': '不活跃'
  }
  return textMap[status] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  return new Date(dateStr).toLocaleString()
}

const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleStudentAction = async (action, student) => {
  switch (action) {
    case 'view':
      selectedStudent.value = student
      showStudentDetail.value = true
      break
    case 'message':
      ElMessage.info('发送消息功能开发中')
      break
    case 'progress':
      ElMessage.info('学习进度功能开发中')
      break
    case 'remove':
      await handleRemoveStudent(student)
      break
  }
}

const handleRemoveStudent = async (student) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除学生"${student.name}"吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用删除API
    students.value = students.value.filter(s => s.id !== student.id)
    ElMessage.success('学生移除成功')
    emit('students-updated')
  } catch {
    // 用户取消删除
  }
}

const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  inviteCode.value = result
}

const handleInvite = async () => {
  if (inviteForm.value.method === 'email') {
    if (!inviteFormRef.value) return
    
    try {
      await inviteFormRef.value.validate()
      inviting.value = true
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showInviteDialog.value = false
      ElMessage.success('邀请邮件发送成功')
      
      // 重置表单
      inviteForm.value = {
        method: 'email',
        emails: '',
        message: ''
      }
      
    } catch (error) {
      console.error('发送邀请失败:', error)
    } finally {
      inviting.value = false
    }
  } else {
    if (!inviteCode.value) {
      generateInviteCode()
    }
    ElMessage.success('邀请码已生成，可以分享给学生了')
  }
}

const refreshStudents = async () => {
  await fetchStudents()
  ElMessage.success('数据已刷新')
}

const exportData = () => {
  ElMessage.info('导出功能开发中')
}

const fetchStudents = async () => {
  loading.value = true
  
  try {
    console.log('开始获取学生列表，groupId:', props.groupId)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    students.value = [
      {
        id: 1,
        name: '张三',
        student_id: '2025001',
        email: 'zhangsan@example.com',
        status: 'active',
        completed_tasks: 8,
        score: 85,
        attendance: 95,
        join_time: '2025-08-01T10:00:00',
        last_active: '2025-08-25T15:30:00'
      },
      {
        id: 2,
        name: '李四',
        student_id: '2025002',
        email: 'lisi@example.com',
        status: 'active',
        completed_tasks: 7,
        score: 78,
        attendance: 88,
        join_time: '2025-08-03T14:20:00',
        last_active: '2025-08-24T09:15:00'
      },
      {
        id: 3,
        name: '王五',
        student_id: '2025003',
        email: 'wangwu@example.com',
        status: 'inactive',
        completed_tasks: 3,
        score: 65,
        attendance: 70,
        join_time: '2025-08-05T16:45:00',
        last_active: '2025-08-20T11:00:00'
      },
      {
        id: 4,
        name: '赵六',
        student_id: '2025004',
        email: 'zhaoliu@example.com',
        status: 'active',
        completed_tasks: 9,
        score: 92,
        attendance: 98,
        join_time: '2025-08-02T11:30:00',
        last_active: '2025-08-25T14:20:00'
      },
      {
        id: 5,
        name: '孙七',
        student_id: '2025005',
        email: 'sunqi@example.com',
        status: 'active',
        completed_tasks: 6,
        score: 81,
        attendance: 92,
        join_time: '2025-08-04T09:15:00',
        last_active: '2025-08-25T10:45:00'
      },
      {
        id: 6,
        name: '周八',
        student_id: '2025006',
        email: 'zhouba@example.com',
        status: 'active',
        completed_tasks: 8,
        score: 87,
        attendance: 94,
        join_time: '2025-08-06T13:30:00',
        last_active: '2025-08-24T16:20:00'
      },
      {
        id: 7,
        name: '吴九',
        student_id: '2025007',
        email: 'wujiu@example.com',
        status: 'inactive',
        completed_tasks: 4,
        score: 72,
        attendance: 75,
        join_time: '2025-08-07T15:45:00',
        last_active: '2025-08-22T14:30:00'
      },
      {
        id: 8,
        name: '郑十',
        student_id: '2025008',
        email: 'zhengshi@example.com',
        status: 'active',
        completed_tasks: 7,
        score: 89,
        attendance: 96,
        join_time: '2025-08-08T11:20:00',
        last_active: '2025-08-25T13:15:00'
      },
      {
        id: 9,
        name: '冯十一',
        student_id: '2025009',
        email: 'fengshiyi@example.com',
        status: 'active',
        completed_tasks: 5,
        score: 76,
        attendance: 82,
        join_time: '2025-08-09T14:10:00',
        last_active: '2025-08-24T11:50:00'
      },
      {
        id: 10,
        name: '陈十二',
        student_id: '2025010',
        email: 'chenshier@example.com',
        status: 'active',
        completed_tasks: 8,
        score: 84,
        attendance: 90,
        join_time: '2025-08-10T16:30:00',
        last_active: '2025-08-25T09:40:00'
      },
      {
        id: 11,
        name: '刘小明',
        student_id: '2025011',
        email: 'liuxiaoming@example.com',
        status: 'active',
        completed_tasks: 9,
        score: 93,
        attendance: 97,
        join_time: '2025-08-11T10:15:00',
        last_active: '2025-08-25T14:25:00'
      },
      {
        id: 12,
        name: '杨小红',
        student_id: '2025012',
        email: 'yangxiaohong@example.com',
        status: 'active',
        completed_tasks: 6,
        score: 80,
        attendance: 86,
        join_time: '2025-08-12T12:45:00',
        last_active: '2025-08-24T15:30:00'
      }
    ]
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 监听props变化
watch(() => props.groupId, () => {
  fetchStudents()
})

// 生命周期
onMounted(() => {
  fetchStudents()
})
</script>

<style scoped>
.teaching-student-management {
  max-width: 100%;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.student-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.student-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.loading {
  padding: 20px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
}

.student-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.student-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.student-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.student-info {
  flex: 1;
  margin-left: 16px;
}

.student-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.student-id {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.student-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.stat-name {
  font-size: 12px;
  color: #909399;
}

.student-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #c0c4cc;
}

.invite-code-info {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.invite-code-info p {
  margin: 4px 0;
}

.student-detail {
  max-width: 100%;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-info {
  margin-left: 20px;
}

.detail-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.detail-info p {
  margin: 4px 0;
  color: #606266;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .student-toolbar {
    flex-direction: column;
    gap: 16px;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
  }
  
  .student-footer {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
