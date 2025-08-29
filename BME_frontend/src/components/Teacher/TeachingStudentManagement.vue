<template>
  <div class="teaching-student-management">
    <!-- 学生统计 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ studentStats.total }}</div>
        <div class="stat-label">学生总数</div>
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
      <div v-else-if="totalCount === 0" class="empty-state">
        <el-empty description="暂无学生" />
      </div>
      <div v-else class="table-container">
        <el-table 
          :data="filteredStudents" 
          style="width: 100%; height: 100%"
          :height="400"
        >
          <el-table-column label="头像" width="80">
            <template #default="{ row }">
              <el-avatar :size="40" :src="getStudentAvatar(row)">
                {{ row.name.charAt(0) }}
              </el-avatar>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="姓名" min-width="150" />
          
          <el-table-column prop="student_id" label="学号" min-width="150" />
          
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="danger" 
                size="small" 
                @click="handleRemoveStudent(row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
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
  Plus, Refresh, Download, Search
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
const searchKeyword = ref('')
const showInviteDialog = ref(false)
const showStudentDetail = ref(false)
const selectedStudent = ref(null)
const inviteFormRef = ref()
const inviteCode = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

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
  return { total }
})

const filteredStudents = computed(() => {
  let result = students.value

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(student =>
      student.name.toLowerCase().includes(keyword) ||
      student.student_id.toLowerCase().includes(keyword) ||
      (student.email && student.email.toLowerCase().includes(keyword))
    )
  }

  // 更新总数
  totalCount.value = result.length

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 方法
const getStudentAvatar = (student) => {
  return student.avatar || ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  return new Date(dateStr).toLocaleString()
}

const handleSearch = () => {
  // 搜索时重置到第一页
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
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
    
    // 检查当前页是否还有数据，如果没有则回到上一页
    const maxPage = Math.ceil(totalCount.value / pageSize.value)
    if (currentPage.value > maxPage && maxPage > 0) {
      currentPage.value = maxPage
    }
    
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
    
    // 初始化总数
    totalCount.value = students.value.length
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stats-section {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.loading {
  padding: 20px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
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
  .student-toolbar {
    flex-direction: column;
    gap: 16px;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
