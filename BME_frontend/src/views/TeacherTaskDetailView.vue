<template>
  <div class="teacher-task-detail">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'teaching-management' }">教学管理</el-breadcrumb-item>
        <el-breadcrumb-item 
          :to="{ 
            name: 'teaching-group-details', 
            params: { groupId: route.params.groupId },
            query: { group_name: groupName }
          }"
        >
          {{ groupName || '小组详情' }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>任务详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="detail-container">
      <!-- 任务基本信息 -->
      <el-card class="task-info-card" v-loading="loading">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <h2 class="task-title">{{ taskDetail.title || '任务详情' }}</h2>
              <el-tag 
                :type="getPriorityType(taskDetail.priority)" 
                size="large" 
                class="priority-tag"
              >
                {{ getPriorityText(taskDetail.priority) }}
              </el-tag>
            </div>
            <div class="header-right">
              <el-tag :type="getStatusType(taskDetail.status)" size="large">
                {{ getStatusText(taskDetail.status) }}
              </el-tag>
              <el-button type="primary" @click="editTask">编辑任务</el-button>
            </div>
          </div>
        </template>

        <div class="task-content">
          <div class="info-row">
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatDate(taskDetail.created_time) }}</span>
            </div>
            <div class="info-item">
              <span class="label">截止时间：</span>
              <span class="value" :class="getDeadlineClass(taskDetail.deadline)">
                {{ formatDate(taskDetail.deadline) }}
              </span>
            </div>
          </div>

          <div class="description-section">
            <h3>任务描述</h3>
            <div class="description-content">
              {{ taskDetail.description || '暂无描述' }}
            </div>
          </div>

          <div class="attachments-section" v-if="taskDetail.attachments && taskDetail.attachments.length > 0">
            <h3>任务附件</h3>
            <div class="attachments-list">
              <div 
                v-for="(attachment, index) in taskDetail.attachments" 
                :key="index" 
                class="attachment-item"
                @click="downloadAttachment(attachment)"
              >
                <el-icon><Document /></el-icon>
                <span>{{ attachment.name }}</span>
                <el-icon class="download-icon"><Download /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 提交统计 -->
      <el-card class="stats-card">
        <template #header>
          <h3>提交统计</h3>
        </template>
        <div class="stats-content">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-number">{{ taskDetail.participants || 0 }}</div>
                <div class="stat-label">总人数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item submitted">
                <div class="stat-number">{{ taskDetail.completed_count || 0 }}</div>
                <div class="stat-label">已提交</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item pending">
                <div class="stat-number">{{ getUnsubmittedCount() }}</div>
                <div class="stat-label">未提交</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item rate">
                <div class="stat-number">{{ getCompletionRate() }}%</div>
                <div class="stat-label">完成率</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 学生提交列表 -->
      <el-card class="submissions-card">
        <template #header>
          <div class="submissions-header">
            <h3>学生提交情况</h3>
            <div class="header-actions">
              <el-button type="success" size="small" @click="downloadAllAttachments">
                <el-icon><Download /></el-icon>
                下载所有附件
              </el-button>
              <el-select v-model="filterStatus" placeholder="筛选状态" size="small" @change="handleFilterChange" style="width: 100px">
                <el-option label="全部" value="" />
                <el-option label="已提交" value="submitted" />
                <el-option label="未提交" value="unsubmitted" />
                <el-option label="迟交" value="late" />
              </el-select>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索学生"
                size="small"
                style="width: 150px"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </template>

        <el-table :data="paginatedSubmissions" stripe v-loading="submissionsLoading">
          <el-table-column prop="student_name" label="学生姓名" width="120">
            <template #default="scope">
              <div class="student-info">
                <el-avatar :size="32" :src="scope.row.avatar">
                  {{ scope.row.student_name.charAt(0) }}
                </el-avatar>
                <span class="student-name">{{ scope.row.student_name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="student_id" label="学号" width="120" />
          <el-table-column prop="status" label="提交状态" width="100">
            <template #default="scope">
              <el-tag :type="getSubmissionStatusType(scope.row.status)" size="small">
                {{ getSubmissionStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submit_time" label="提交时间" width="160">
            <template #default="scope">
              <span v-if="scope.row.submit_time">{{ formatDate(scope.row.submit_time) }}</span>
              <span v-else class="not-submitted">未提交</span>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="评分" width="100">
            <template #default="scope">
              <span v-if="scope.row.score !== null && scope.row.score !== undefined" class="scored">
                {{ scope.row.score }}分
              </span>
              <span v-else class="not-scored">未评分</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="168">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small" 
                @click="viewAndScoreSubmission(scope.row)"
                v-if="scope.row.status === 'submitted' || scope.row.status === 'late'"
              >
                查看作业/评分
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="remindStudent(scope.row)"
                v-if="scope.row.status === 'unsubmitted'"
              >
                提醒
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredSubmissions.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 作业查看和评分对话框 -->
    <el-dialog v-model="showSubmissionDialog" title="作业详情" width="800px">
      <div class="submission-content">
        <!-- 学生信息 -->
        <div class="student-header">
          <el-avatar :size="40" :src="currentStudent?.avatar">
            {{ currentStudent?.student_name?.charAt(0) }}
          </el-avatar>
          <div class="student-details">
            <h3>{{ currentStudent?.student_name }}</h3>
            <p>学号：{{ currentStudent?.student_id }}</p>
            <p>提交时间：{{ formatDate(currentStudent?.submit_time) }}</p>
          </div>
        </div>

        <!-- 作业内容 -->
        <div class="submission-body">
          <div class="content-section">
            <h4>作业内容</h4>
            <div class="text-content">
              {{ currentSubmission?.content || '学生未填写文字内容' }}
            </div>
          </div>

          <!-- 附件列表 -->
          <div class="attachments-section" v-if="currentSubmission?.attachments && currentSubmission.attachments.length > 0">
            <h4>作业附件</h4>
            <div class="attachments-list">
              <div 
                v-for="(attachment, index) in currentSubmission.attachments" 
                :key="index" 
                class="attachment-item"
              >
                <div class="attachment-info">
                  <el-icon><Document /></el-icon>
                  <span class="attachment-name">{{ attachment.name }}</span>
                  <span class="attachment-size">{{ attachment.size }}</span>
                </div>
                <div class="attachment-actions">
                  <el-button size="small" @click="previewAttachment(attachment)">
                    <el-icon><View /></el-icon>
                    预览
                  </el-button>
                  <el-button size="small" @click="downloadAttachment(attachment)">
                    <el-icon><Download /></el-icon>
                    下载
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 评分区域 -->
          <div class="scoring-section">
            <h4>作业评分</h4>
            <el-form :model="scoreForm" label-width="80px">
              <el-form-item label="评分" required>
                <el-input-number 
                  v-model="scoreForm.score" 
                  :min="0" 
                  :max="100" 
                  :precision="1"
                  controls-position="right"
                  style="width: 150px"
                />
                <span style="margin-left: 8px;">分</span>
              </el-form-item>
              <el-form-item label="评语">
                <el-input 
                  v-model="scoreForm.comment" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请输入评语（可选）"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSubmissionDialog = false">关闭</el-button>
          <el-button type="primary" @click="submitScore" :loading="scoring">
            保存评分
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑任务" width="600px">
      <el-form :model="editTaskForm" :rules="taskRules" ref="editTaskFormRef" label-width="100px">
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="editTaskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="editTaskForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="editTaskForm.deadline"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="editTaskForm.priority" placeholder="选择优先级" style="width: 100%">
            <el-option label="高优先级" value="high" />
            <el-option label="中优先级" value="medium" />
            <el-option label="低优先级" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            v-model:file-list="editTaskForm.attachments"
            action="#"
            :auto-upload="false"
            multiple
          >
            <el-button>
              <el-icon><Upload /></el-icon>
              上传附件
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateTask" :loading="editing">
          更新任务
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Download, Search, View, Upload } from '@element-plus/icons-vue'

// 定义props
const props = defineProps({
  groupId: {
    type: Number,
    default: null
  },
  taskId: {
    type: Number,
    default: null
  },
  groupName: {
    type: String,
    default: ''
  },
  userRole: {
    type: String,
    default: 'teacher'
  }
})

const router = useRouter()
const route = useRoute()

// 获取参数 - 优先使用props，回退到route params
const groupId = computed(() => props.groupId || parseInt(route.params.groupId))
const taskId = computed(() => props.taskId || parseInt(route.params.taskId))
const groupName = ref(props.groupName || route.query.group_name || '')

// 响应式数据
const loading = ref(false)
const submissionsLoading = ref(false)
const scoring = ref(false)
const taskDetail = ref({})
const submissions = ref([])
const filterStatus = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const showSubmissionDialog = ref(false)
const currentStudent = ref(null)
const currentSubmission = ref(null)
const showEditDialog = ref(false)
const editing = ref(false)
const editTaskFormRef = ref()

const scoreForm = ref({
  score: null,
  comment: ''
})

// 编辑任务表单
const editTaskForm = ref({
  id: null,
  title: '',
  description: '',
  deadline: '',
  priority: 'medium',
  attachments: []
})

// 表单验证规则
const taskRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ]
}

// 计算属性
const filteredSubmissions = computed(() => {
  let result = submissions.value

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      item.student_name.toLowerCase().includes(keyword) ||
      item.student_id.includes(keyword)
    )
  }

  return result
})

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSubmissions.value.slice(start, end)
})

// 方法
const getPriorityType = (priority) => {
  const typeMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const textMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return textMap[priority] || '普通'
}

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '进行中',
    'completed': '已完成',
    'overdue': '已过期'
  }
  return textMap[status] || '未知'
}

const getSubmissionStatusType = (status) => {
  const typeMap = {
    'submitted': 'success',
    'unsubmitted': 'warning',
    'late': 'danger'
  }
  return typeMap[status] || 'info'
}

const getSubmissionStatusText = (status) => {
  const textMap = {
    'submitted': '已提交',
    'unsubmitted': '未提交',
    'late': '迟交'
  }
  return textMap[status] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '未设置'
  return new Date(dateStr).toLocaleString()
}

const getDeadlineClass = (deadline) => {
  if (!deadline) return ''
  const now = new Date()
  const deadlineDate = new Date(deadline)
  return deadlineDate < now ? 'overdue' : ''
}

const getUnsubmittedCount = () => {
  return (taskDetail.value.participants || 0) - (taskDetail.value.completed_count || 0)
}

const getCompletionRate = () => {
  if (!taskDetail.value.participants || taskDetail.value.participants === 0) return 0
  return Math.round(((taskDetail.value.completed_count || 0) / taskDetail.value.participants) * 100)
}

const editTask = () => {
  // 初始化编辑表单数据
  editTaskForm.value = {
    id: taskDetail.value.id,
    title: taskDetail.value.title || '',
    description: taskDetail.value.description || '',
    deadline: taskDetail.value.deadline ? new Date(taskDetail.value.deadline) : '',
    priority: taskDetail.value.priority || 'medium',
    attachments: []
  }
  showEditDialog.value = true
}

const handleUpdateTask = async () => {
  if (!editTaskFormRef.value) return
  
  try {
    await editTaskFormRef.value.validate()
    editing.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新当前任务详情
    taskDetail.value = {
      ...taskDetail.value,
      title: editTaskForm.value.title,
      description: editTaskForm.value.description,
      deadline: editTaskForm.value.deadline,
      priority: editTaskForm.value.priority,
      updated_time: new Date().toISOString()
    }
    
    showEditDialog.value = false
    ElMessage.success('任务更新成功')
    
  } catch (error) {
    console.error('更新任务失败:', error)
    ElMessage.error('更新任务失败')
  } finally {
    editing.value = false
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const downloadAttachment = (attachment) => {
  // 模拟下载文件
  const link = document.createElement('a')
  link.href = attachment.url || '#'
  link.download = attachment.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success(`正在下载 ${attachment.name}`)
}

const previewAttachment = (attachment) => {
  // 根据文件类型决定预览方式
  const fileType = attachment.name.split('.').pop().toLowerCase()
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileType)) {
    // 图片预览
    window.open(attachment.url, '_blank')
  } else if (['pdf'].includes(fileType)) {
    // PDF预览
    window.open(attachment.url, '_blank')
  } else if (['txt', 'md'].includes(fileType)) {
    // 文本文件预览
    window.open(attachment.url, '_blank')
  } else {
    ElMessage.info('该文件类型不支持预览，请下载后查看')
  }
}

const viewAndScoreSubmission = (student) => {
  currentStudent.value = student
  
  // 模拟获取学生提交的详细内容
  currentSubmission.value = {
    content: '这是学生提交的作业内容示例。学生完成了所有要求的练习题，解题过程清晰，思路正确。在第5题的解答中展现了良好的数学思维能力，值得表扬。',
    attachments: [
      {
        name: '数学作业-第一章.pdf',
        size: '2.5MB',
        url: '/mock/homework1.pdf',
        type: 'pdf'
      },
      {
        name: '解题过程截图.png',
        size: '856KB',
        url: '/mock/screenshot.png',
        type: 'image'
      },
      {
        name: '计算草稿.jpg',
        size: '1.2MB',
        url: '/mock/draft.jpg',
        type: 'image'
      }
    ]
  }
  
  scoreForm.value = {
    score: student.score || null,
    comment: student.comment || ''
  }
  
  showSubmissionDialog.value = true
}

const downloadAllAttachments = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要下载所有学生的作业附件吗？这可能需要一些时间。',
      '确认下载',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 模拟批量下载
    ElMessage.success('正在准备下载包，请稍候...')
    
    // 这里应该调用后端API生成压缩包
    setTimeout(() => {
      ElMessage.success('下载包准备完成，正在开始下载...')
      
      // 模拟下载压缩包
      const link = document.createElement('a')
      link.href = '/mock/all-submissions.zip'
      link.download = `${taskDetail.value.title}-所有作业附件.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 2000)
    
  } catch {
    // 用户取消
  }
}

const submitScore = async () => {
  if (scoreForm.value.score === null || scoreForm.value.score === undefined) {
    ElMessage.warning('请输入评分')
    return
  }

  try {
    scoring.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新学生评分
    const studentIndex = submissions.value.findIndex(s => s.student_id === currentStudent.value.student_id)
    if (studentIndex !== -1) {
      submissions.value[studentIndex].score = scoreForm.value.score
      submissions.value[studentIndex].comment = scoreForm.value.comment
    }
    
    showSubmissionDialog.value = false
    ElMessage.success('评分成功')
    
  } catch (error) {
    console.error('评分失败:', error)
    ElMessage.error('评分失败')
  } finally {
    scoring.value = false
  }
}

const remindStudent = async (student) => {
  try {
    await ElMessageBox.confirm(
      `确定要提醒 ${student.student_name} 提交作业吗？`,
      '确认提醒',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    ElMessage.success(`已提醒 ${student.student_name}`)
  } catch {
    // 用户取消
  }
}

const fetchTaskDetail = async () => {
  loading.value = true
  
  try {
    // 使用computed值获取参数
    const currentTaskId = taskId.value
    const currentGroupId = groupId.value
    
    console.log('获取任务详情，taskId:', currentTaskId, 'groupId:', currentGroupId)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟任务详情数据
    taskDetail.value = {
      id: currentTaskId,
      title: '数学作业第一章',
      priority: 'medium',
      description: '完成教材第一章的所有练习题，包括课后习题1-10题。要求：1. 写出详细解题过程；2. 标明每题的解题思路；3. 如有疑问及时提问。请认真完成，这是基础知识的重要练习。',
      deadline: '2025-09-01T23:59:00',
      status: 'pending',
      participants: 25,
      completed_count: 18,
      created_time: '2025-08-20T10:00:00',
      attachments: [
        { name: '第一章练习题.pdf', url: '/files/chapter1.pdf' },
        { name: '参考资料.docx', url: '/files/reference.docx' }
      ]
    }
    
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  } finally {
    loading.value = false
  }
}

const fetchSubmissions = async () => {
  submissionsLoading.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟学生提交数据
    submissions.value = []
    
    // 生成25个学生的提交数据
    for (let i = 1; i <= 25; i++) {
      const statuses = ['submitted', 'unsubmitted', 'late']
      const weights = [0.6, 0.3, 0.1] // 已提交60%, 未提交30%, 迟交10%
      
      let randomStatus = 'submitted'
      const random = Math.random()
      if (random < weights[1]) {
        randomStatus = 'unsubmitted'
      } else if (random < weights[1] + weights[2]) {
        randomStatus = 'late'
      }
      
      submissions.value.push({
        student_id: `202100${i.toString().padStart(2, '0')}`,
        student_name: `学生${i}`,
        avatar: '',
        status: randomStatus,
        submit_time: randomStatus !== 'unsubmitted' ? '2025-08-29T10:00:00' : null,
        score: randomStatus === 'submitted' ? Math.floor(Math.random() * 20) + 80 : null,
        comment: ''
      })
    }
    
  } catch (error) {
    console.error('获取提交列表失败:', error)
    ElMessage.error('获取提交列表失败')
  } finally {
    submissionsLoading.value = false
  }
}

onMounted(() => {
  fetchTaskDetail()
  fetchSubmissions()
})
</script>

<style scoped>
.teacher-task-detail {
  /* padding: 20px; */
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 10px;

}

.breadcrumb-nav {
  margin-bottom: 16px;
  padding: 0 4px;
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #555;
  font-weight: 500;
}

.breadcrumb-link {
  cursor: pointer;
  font-weight: 700;
  color: #111;
}

.breadcrumb-link:hover {
  /* text-decoration: underline; */
  color: #409eff;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-info-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.priority-tag {
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-content {
  padding: 0;
}

.info-row {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

.value {
  color: #303133;
}

.value.overdue {
  color: #f56c6c;
  font-weight: 500;
}

.description-section {
  margin-bottom: 24px;
}

.description-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.description-content {
  color: #606266;
  line-height: 1.6;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.attachments-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.attachment-item:hover {
  background-color: #e6f7ff;
}

.download-icon {
  margin-left: auto;
  color: #409eff;
}

.stats-card {
  border-radius: 8px;
}

.stats-content {
  padding: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.stat-item.submitted {
  background-color: #f0f9ec;
  color: #67c23a;
}

.stat-item.pending {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-item.rate {
  background-color: #ecf5ff;
  color: #409eff;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.submissions-card {
  border-radius: 8px;
}

.submissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submissions-header h3 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-name {
  font-weight: 500;
}

.not-submitted {
  color: #909399;
}

.not-scored {
  color: #909399;
}

.scored {
  color: #67c23a;
  font-weight: 600;
}

/* 作业查看对话框样式 */
.submission-content {
  max-height: 70vh;
  overflow-y: auto;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.student-details h3 {
  margin: 0 0 4px 0;
  color: #303133;
}

.student-details p {
  margin: 2px 0;
  color: #606266;
  font-size: 14px;
}

.submission-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-section,
.attachments-section,
.scoring-section {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}

.content-section h4,
.attachments-section h4,
.scoring-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-weight: 600;
}

.text-content {
  color: #606266;
  line-height: 1.6;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  color: #303133;
}

.attachment-size {
  color: #909399;
  font-size: 12px;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .teacher-task-detail {
    padding: 12px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-title {
    font-size: 20px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-start;
  }
  
  .info-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .submissions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
