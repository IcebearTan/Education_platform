<template>
  <div class="teaching-student-management">
    <!-- 学生统计 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ studentStats.total }}</div>
              <div class="stats-label">学生总数</div>
              <el-icon class="stats-icon"><User /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="stats-card pending">
            <div class="stats-content">
              <div class="stats-number">{{ pendingApplications.length }}</div>
              <div class="stats-label">待审核申请</div>
              <el-icon class="stats-icon"><UserFilled /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 工具栏 -->
    <div class="student-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showInviteDialog = true">
          <el-icon><Plus /></el-icon>
          邀请学生
        </el-button>
        <el-button 
          type="warning" 
          @click="showApplicationsDialog = true"
          :badge="pendingApplications.length > 0 ? pendingApplications.length : null"
        >
          <el-icon><User /></el-icon>
          加入申请
          <el-badge 
            v-if="pendingApplications.length > 0" 
            :value="pendingApplications.length" 
            class="application-badge"
          />
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
    <el-dialog v-model="showInviteDialog" title="邀请学生" width="600px">
      <el-form :model="inviteForm" :rules="inviteRules" ref="inviteFormRef" label-width="100px">
        <el-form-item label="选择学生" prop="selectedStudents">
          <el-select
            v-model="inviteForm.selectedStudents"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="搜索学生姓名或学号"
            :remote-method="searchStudents"
            :loading="searchLoading"
            style="width: 100%"
            size="large"
          >
            <el-option
              v-for="student in availableStudents"
              :key="student.id"
              :label="`${student.name} (${student.student_id})`"
              :value="student.id"
            >
              <div class="student-option">
                <el-avatar :size="30" :src="student.avatar">
                  {{ student.name.charAt(0) }}
                </el-avatar>
                <div class="student-info">
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-details">{{ student.student_id }} • {{ student.major || '未知专业' }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
          <div class="invite-help-text">
            <p>💡 提示：输入学生姓名或学号进行搜索，可以选择多个学生进行批量邀请</p>
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
        
        <el-form-item label="邀请方式">
          <el-radio-group v-model="inviteForm.method">
            <el-radio label="direct">直接添加</el-radio>
            <el-radio label="email">邮件通知</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInviteDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleInvite" 
          :loading="inviting"
          :disabled="inviteForm.selectedStudents.length === 0"
        >
          邀请 {{ inviteForm.selectedStudents.length }} 个学生
        </el-button>
      </template>
    </el-dialog>

    <!-- 加入申请管理对话框 -->
    <el-dialog v-model="showApplicationsDialog" title="学生加入申请" width="800px" top="5vh">
      <div class="applications-content">
        <div v-if="pendingApplications.length === 0" class="empty-applications">
          <el-empty description="暂无待审核的加入申请" />
        </div>
        <div v-else class="applications-list">
          <div 
            v-for="application in pendingApplications" 
            :key="application.id"
            :class="['application-item', { highlighted: highlightedApplicationId === application.id }]"
          >
            <div class="application-header">
              <div class="student-info">
                <el-avatar :size="50" :src="application.avatar">
                  {{ application.student_name.charAt(0) }}
                </el-avatar>
                <div class="info-details">
                  <h4>{{ application.student_name }}</h4>
                  <p>专业：{{ application.student_major || '未提供' }}</p>
                  <p>年级：{{ application.student_grade || '未提供' }}</p>
                  <p>邮箱：{{ application.student_email || '未提供' }}</p>
                </div>
              </div>
              <div class="application-meta">
                <el-tag size="small" type="info">{{ formatDate(application.apply_time) }}</el-tag>
              </div>
            </div>
            
            <div class="application-content">
              <div class="application-reason">
                <label>申请理由：</label>
                <p>{{ application.application_reason || '无特别说明' }}</p>
              </div>
            </div>
            
            <div class="application-actions">
              <el-button 
                type="success" 
                size="small" 
                @click="approveApplication(application)"
                :loading="application.processing"
              >
                <el-icon><Check /></el-icon>
                同意
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="rejectApplication(application)"
                :loading="application.processing"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showApplicationsDialog = false">关闭</el-button>
          <el-button 
            v-if="pendingApplications.length > 0" 
            type="primary" 
            @click="batchApproveApplications"
            :disabled="selectedApplications.length === 0"
          >
            批量同意 ({{ selectedApplications.length }})
          </el-button>
        </div>
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
  Plus, Refresh, Download, Search, User, Check, Close, View, UserFilled
} from '@element-plus/icons-vue'
// 导入mock数据
import { mockNotificationApiResponses } from '../../mock/notificationData.js'

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  },
  groupData: {
    type: Object,
    default: () => ({})
  },
  // 用于高亮显示特定的加入申请
  highlightApplicationId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['students-updated'])

// 响应式数据
const loading = ref(false)
const inviting = ref(false)
const students = ref([])
const searchKeyword = ref('')
const showInviteDialog = ref(false)
const showApplicationsDialog = ref(false)
const showStudentDetail = ref(false)
const selectedStudent = ref(null)
const inviteFormRef = ref()
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const highlightedApplicationId = ref(props.highlightApplicationId)

// 新增变量
const selectedStudentsForInvitation = ref([])
const studentSearchText = ref('')
const mockStudentOptions = ref([])

// 加入申请相关数据
const pendingApplications = ref([])
const selectedApplications = ref([])

// 学生搜索相关数据
const availableStudents = ref([])
const searchLoading = ref(false)

// 邀请表单
const inviteForm = ref({
  selectedStudents: [],
  message: '',
  method: 'direct'
})

// 表单验证规则
const inviteRules = {
  selectedStudents: [
    { required: true, message: '请选择要邀请的学生', trigger: 'change' }
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

const handleInvite = async () => {
  if (!inviteFormRef.value) return
  
  try {
    await inviteFormRef.value.validate()
    inviting.value = true
    
    // 获取选中的学生信息
    const selectedStudentInfos = availableStudents.value.filter(student => 
      inviteForm.value.selectedStudents.includes(student.id)
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (inviteForm.value.method === 'direct') {
      // 直接添加学生到小组
      selectedStudentInfos.forEach(studentInfo => {
        const newStudent = {
          id: Date.now() + Math.random(),
          name: studentInfo.name,
          student_id: studentInfo.student_id,
          email: studentInfo.email,
          status: 'active',
          completed_tasks: 0,
          score: 0,
          attendance: 0,
          join_time: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
        students.value.unshift(newStudent)
      })
      
      ElMessage.success(`成功添加 ${selectedStudentInfos.length} 个学生到小组`)
    } else {
      // 发送邮件邀请
      ElMessage.success(`邀请邮件已发送给 ${selectedStudentInfos.length} 个学生`)
    }
    
    showInviteDialog.value = false
    emit('students-updated')
    
    // 重置表单
    inviteForm.value = {
      selectedStudents: [],
      message: '',
      method: 'direct'
    }
    availableStudents.value = []
    
  } catch (error) {
    console.error('邀请学生失败:', error)
    ElMessage.error('邀请学生失败')
  } finally {
    inviting.value = false
  }
}

const refreshStudents = async () => {
  await fetchStudents()
  ElMessage.success('数据已刷新')
}

const exportData = () => {
  ElMessage.info('导出功能开发中')
}

// 学生搜索方法
const searchStudents = async (query) => {
  if (!query) {
    availableStudents.value = []
    return
  }

  searchLoading.value = true
  
  try {
    // 模拟远程搜索API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟可邀请的学生数据
    const mockStudents = [
      {
        id: 'stu_001',
        name: '张小明',
        student_id: '2025013',
        email: 'zhangxiaoming@example.com',
        major: '计算机科学与技术',
        grade: '大三',
        avatar: ''
      },
      {
        id: 'stu_002', 
        name: '李小红',
        student_id: '2025014',
        email: 'lixiaohong@example.com',
        major: '软件工程',
        grade: '大二',
        avatar: ''
      },
      {
        id: 'stu_003',
        name: '王小刚',
        student_id: '2025015', 
        email: 'wangxiaogang@example.com',
        major: '人工智能',
        grade: '大三',
        avatar: ''
      },
      {
        id: 'stu_004',
        name: '赵小美',
        student_id: '2025016',
        email: 'zhaoxiaomei@example.com', 
        major: '数据科学与大数据技术',
        grade: '大一',
        avatar: ''
      },
      {
        id: 'stu_005',
        name: '刘小强',
        student_id: '2025017',
        email: 'liuxiaoqiang@example.com',
        major: '网络工程',
        grade: '大二',
        avatar: ''
      }
    ]
    
    // 过滤已经在小组中的学生
    const currentStudentIds = students.value.map(s => s.student_id)
    const filteredStudents = mockStudents.filter(student => 
      !currentStudentIds.includes(student.student_id) &&
      (student.name.toLowerCase().includes(query.toLowerCase()) ||
       student.student_id.toLowerCase().includes(query.toLowerCase()))
    )
    
    availableStudents.value = filteredStudents
    
  } catch (error) {
    console.error('搜索学生失败:', error)
    ElMessage.error('搜索学生失败')
  } finally {
    searchLoading.value = false
  }
}

// 加入申请相关方法
const fetchApplications = async () => {
  try {
    // 模拟获取当前小组的待审核申请
    // 实际项目中应该根据groupId从API获取
    const mockApplications = [
      {
        id: 'join_apply_001',
        student_id: 'stu_007',
        student_name: '周九',
        student_major: '生物医学工程',
        student_grade: '大三',
        student_email: 'zhoujiu@example.com',
        student_phone: '13800138007',
        application_reason: '对生物医学工程有浓厚兴趣，希望能参与创新项目',
        application_status: 'pending',
        apply_time: '2025-08-29T15:45:00Z',
        processing: false
      },
      {
        id: 'join_apply_002',
        student_id: 'stu_008',
        student_name: '吴十',
        student_major: '计算机科学与技术',
        student_grade: '大二',
        student_email: 'wushi@example.com',
        student_phone: '13800138008',
        application_reason: '有一定的编程基础，希望提升算法能力',
        application_status: 'pending',
        apply_time: '2025-08-29T10:20:00Z',
        processing: false
      }
    ]

    // 只显示当前小组相关的申请，根据groupId过滤
    pendingApplications.value = mockApplications.filter(app => {
      // 这里应该根据实际的数据结构来过滤
      // 暂时返回所有申请作为演示
      return app.application_status === 'pending'
    })

  } catch (error) {
    console.error('获取加入申请失败:', error)
    ElMessage.error('获取加入申请失败')
  }
}

const approveApplication = async (application) => {
  try {
    application.processing = true
    
    await ElMessageBox.confirm(
      `确定同意"${application.student_name}"的加入申请吗？`,
      '确认同意申请',
      {
        confirmButtonText: '同意',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新申请状态
    application.application_status = 'approved'
    
    // 从待审核列表中移除
    pendingApplications.value = pendingApplications.value.filter(app => app.id !== application.id)
    
    // 将学生添加到学生列表
    const newStudent = {
      id: Date.now(),
      name: application.student_name,
      student_id: application.student_id,
      email: application.student_email,
      status: 'active',
      completed_tasks: 0,
      score: 0,
      attendance: 0,
      join_time: new Date().toISOString(),
      last_active: new Date().toISOString()
    }
    students.value.unshift(newStudent)
    
    ElMessage.success(`已同意"${application.student_name}"的加入申请`)
    emit('students-updated')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同意申请失败:', error)
      ElMessage.error('同意申请失败')
    }
  } finally {
    application.processing = false
  }
}

const rejectApplication = async (application) => {
  try {
    application.processing = true
    
    await ElMessageBox.confirm(
      `确定拒绝"${application.student_name}"的加入申请吗？`,
      '确认拒绝申请',
      {
        confirmButtonText: '拒绝',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新申请状态
    application.application_status = 'rejected'
    
    // 从待审核列表中移除
    pendingApplications.value = pendingApplications.value.filter(app => app.id !== application.id)
    
    ElMessage.success(`已拒绝"${application.student_name}"的加入申请`)
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝申请失败:', error)
      ElMessage.error('拒绝申请失败')
    }
  } finally {
    application.processing = false
  }
}

const batchApproveApplications = async () => {
  if (selectedApplications.value.length === 0) {
    ElMessage.warning('请先选择要批准的申请')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定批量同意 ${selectedApplications.value.length} 个加入申请吗？`,
      '批量同意申请',
      {
        confirmButtonText: '同意',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    // 模拟批量处理
    for (const application of selectedApplications.value) {
      await approveApplication(application)
    }

    selectedApplications.value = []
    ElMessage.success('批量处理完成')

  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量同意失败:', error)
      ElMessage.error('批量同意失败')
    }
  }
}

// 检查是否需要自动显示申请对话框
const checkAutoShowApplications = () => {
  if (props.highlightApplicationId) {
    showApplicationsDialog.value = true
    highlightedApplicationId.value = props.highlightApplicationId
    
    // 3秒后移除高亮
    setTimeout(() => {
      highlightedApplicationId.value = null
    }, 3000)
  }
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
    
    // 同时获取加入申请
    await fetchApplications()
    
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

watch(() => props.highlightApplicationId, (newId) => {
  if (newId) {
    highlightedApplicationId.value = newId
    showApplicationsDialog.value = true
    
    // 3秒后移除高亮
    setTimeout(() => {
      highlightedApplicationId.value = null
    }, 3000)
  }
})

// 生命周期
onMounted(() => {
  fetchStudents()
  checkAutoShowApplications()
})
</script>

<style scoped>
.teaching-student-management {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 工具栏样式 */
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

/* 邀请表单样式 */
.invite-help-text {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.invite-help-text p {
  margin: 0;
  line-height: 1.4;
}

/* 学生详情样式 */
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

/* 统计概览样式 - 与任务管理统一 */
.stats-overview {
  margin-bottom: 24px;
}

.stats-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stats-card.pending {
  border-left: 4px solid #E6A23C;
}

.stats-content {
  padding: 20px;
  position: relative;
}

.stats-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stats-label {
  color: #606266;
  font-size: 14px;
}

.stats-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  color: #C0C4CC;
}

/* 加入申请相关样式 */
.application-badge {
  position: relative;
  margin-left: 8px;
}

.applications-content {
  max-height: 60vh;
  overflow-y: auto;
}

.empty-applications {
  padding: 40px 0;
  text-align: center;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.3s;
}

.application-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.application-item.highlighted {
  border-color: #409EFF;
  background: linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%);
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-details h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.info-details p {
  margin: 4px 0;
  color: #606266;
  font-size: 13px;
}

.application-meta {
  flex-shrink: 0;
}

.application-content {
  margin-bottom: 16px;
}

.application-reason {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.application-reason label {
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  display: block;
}

.application-reason p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.application-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  
  .stats-overview .el-col {
    margin-bottom: 12px;
  }
  
  .application-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .application-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
