<template>
  <div class="leave-container">
    <!-- 学生视图：申请请假按钮 -->
    <div v-if="userRole === 'student'" class="student-actions">
      <el-button type="primary" @click="openLeaveDialog">
        <el-icon><Plus /></el-icon>
        申请请假
      </el-button>
    </div>

    <!-- 老师视图：审批按钮 -->
    <!-- <div v-if="userRole === 'teacher'" class="teacher-actions">
      <el-button type="success" @click="openApprovalDialog">
        <el-icon><Check /></el-icon>
        审批请假 ({{ leaveListPending.length }})
      </el-button>
    </div> -->

    <!-- 请假信息展示区块 -->
    <div class="leave-info-block">
      <!-- 学生视图：我的请假记录 -->
      <div v-if="userRole === 'student'">
        <h3 class="leave-title">我的请假记录</h3>
        <div v-if="leaveLoading" class="leave-loading">加载中...</div>
        <div v-else-if="leaveError" class="leave-error">{{ leaveError }}</div>
        <div v-else>
          <div v-if="groupedMyLeaves.pending.length > 0">
            <h4 class="leave-subtitle">待审批</h4>
            <el-table :data="groupedMyLeaves.pending" size="small" style="margin-bottom: 24px;">
              <el-table-column prop="title" label="请假原因" width="120" />
              <el-table-column label="内容">
                <template #default="scope">
                  <div
                    class="leave-content-cell"
                    :class="{ expanded: contentExpandMap[scope.row.id] }"
                    @click="toggleContentExpand(scope.row.id)"
                    :title="!contentExpandMap[scope.row.id] ? scope.row.content : ''"
                  >
                    <span>{{ scope.row.content }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="start_time" label="开始时间" width="140" />
              <el-table-column prop="end_time" label="结束时间" width="140" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                  <el-tag type="warning">待审批</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="groupedMyLeaves.approved.length > 0">
            <h4 class="leave-subtitle">已批准</h4>
            <el-table :data="groupedMyLeaves.approved" size="small" style="margin-bottom: 24px;">
              <el-table-column prop="title" label="请假原因" width="120" />
              <el-table-column label="内容">
                <template #default="scope">
                  <div
                    class="leave-content-cell"
                    :class="{ expanded: contentExpandMap[scope.row.id] }"
                    @click="toggleContentExpand(scope.row.id)"
                    :title="!contentExpandMap[scope.row.id] ? scope.row.content : ''"
                  >
                    <span>{{ scope.row.content }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="start_time" label="开始时间" width="140" />
              <el-table-column prop="end_time" label="结束时间" width="140" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                  <el-tag type="success">已批准</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewLeaveDetail(scope.row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="groupedMyLeaves.rejected.length > 0">
            <h4 class="leave-subtitle">已拒绝</h4>
            <el-table :data="groupedMyLeaves.rejected" size="small">
              <el-table-column prop="title" label="请假原因" width="120" />
              <el-table-column label="内容">
                <template #default="scope">
                  <div
                    class="leave-content-cell"
                    :class="{ expanded: contentExpandMap[scope.row.id] }"
                    @click="toggleContentExpand(scope.row.id)"
                    :title="!contentExpandMap[scope.row.id] ? scope.row.content : ''"
                  >
                    <span>{{ scope.row.content }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="start_time" label="开始时间" width="140" />
              <el-table-column prop="end_time" label="结束时间" width="140" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                  <el-tag type="danger">已拒绝</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewLeaveDetail(scope.row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="groupedMyLeaves.pending.length === 0 && groupedMyLeaves.approved.length === 0 && groupedMyLeaves.rejected.length === 0" class="no-data">
            暂无请假记录
          </div>
        </div>
      </div>

      <!-- 老师视图：全部请假记录 -->
      <div v-if="userRole === 'teacher'">
        <h3 class="leave-title">学生请假管理</h3>
        <div v-if="leaveLoading" class="leave-loading">加载中...</div>
        <div v-else-if="leaveError" class="leave-error">{{ leaveError }}</div>
        <div v-else>
          <div v-if="groupedAllLeaves.pending.length > 0">
            <h4 class="leave-subtitle">待审批请假 ({{ groupedAllLeaves.pending.length }})</h4>
            <el-table :data="groupedAllLeaves.pending" size="small" style="margin-bottom: 24px;">
              <el-table-column prop="student_name" label="学生姓名" width="100" />
              <el-table-column prop="title" label="请假原因" width="120" />
              <el-table-column label="内容">
                <template #default="scope">
                  <div
                    class="leave-content-cell"
                    :class="{ expanded: contentExpandMap[scope.row.id] }"
                    @click="toggleContentExpand(scope.row.id)"
                    :title="!contentExpandMap[scope.row.id] ? scope.row.content : ''"
                  >
                    <span>{{ scope.row.content }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="start_time" label="开始时间" width="140" />
              <el-table-column prop="end_time" label="结束时间" width="140" />
              <el-table-column label="快速操作" width="160">
                <template #default="scope">
                  <el-button type="success" size="small" @click="approveLeave(scope.row, scope.$index)">批准</el-button>
                  <el-button type="danger" size="small" @click="rejectLeave(scope.row, scope.$index)">拒绝</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="groupedAllLeaves.approved.length > 0">
            <h4 class="leave-subtitle">已批准请假</h4>
            <el-table :data="groupedAllLeaves.approved" size="small" style="margin-bottom: 24px;">
              <el-table-column prop="student_name" label="学生姓名" width="100" />
              <el-table-column prop="title" label="请假原因" width="120" />
              <el-table-column label="内容">
                <template #default="scope">
                  <div
                    class="leave-content-cell"
                    :class="{ expanded: contentExpandMap[scope.row.id] }"
                    @click="toggleContentExpand(scope.row.id)"
                    :title="!contentExpandMap[scope.row.id] ? scope.row.content : ''"
                  >
                    <span>{{ scope.row.content }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="start_time" label="开始时间" width="140" />
              <el-table-column prop="end_time" label="结束时间" width="140" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                  <el-tag type="success">已批准</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="groupedAllLeaves.rejected.length > 0">
            <h4 class="leave-subtitle">已拒绝请假</h4>
            <el-table :data="groupedAllLeaves.rejected" size="small">
              <el-table-column prop="student_name" label="学生姓名" width="100" />
              <el-table-column prop="title" label="请假原因" width="120" />
              <el-table-column label="内容">
                <template #default="scope">
                  <div
                    class="leave-content-cell"
                    :class="{ expanded: contentExpandMap[scope.row.id] }"
                    @click="toggleContentExpand(scope.row.id)"
                    :title="!contentExpandMap[scope.row.id] ? scope.row.content : ''"
                  >
                    <span>{{ scope.row.content }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="start_time" label="开始时间" width="140" />
              <el-table-column prop="end_time" label="结束时间" width="140" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                  <el-tag type="danger">已拒绝</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="groupedAllLeaves.pending.length === 0 && groupedAllLeaves.approved.length === 0 && groupedAllLeaves.rejected.length === 0" class="no-data">
            暂无请假记录
          </div>
        </div>
      </div>
    </div>

    <!-- 请假申请弹窗 -->
    <el-dialog 
      v-model="leaveDialogVisible" 
      title="申请请假" 
      width="500px"
      :lock-scroll="false"
      :before-close="handleDialogClose"
    >
      <el-form 
        :model="leaveForm" 
        :rules="leaveFormRules" 
        ref="leaveFormRef"
        label-width="100px"
      >
        <el-form-item label="请假原因" prop="title">
          <el-select v-model="leaveForm.title" placeholder="请选择请假原因" style="width: 100%">
            <el-option label="病假" value="病假"></el-option>
            <el-option label="事假" value="事假"></el-option>
            <el-option label="其他" value="其他"></el-option>
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
        
        <el-form-item label="附件上传">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            multiple
            drag
            class="leave-upload"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png/pdf/doc/docx 格式，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="leaveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitLeaveRequest">提交申请</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 请假详情弹窗 -->
    <el-dialog
      v-model="showLeaveDetail"
      title="请假详情"
      width="600px"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedLeave" class="leave-detail">
        <div class="detail-header">
          <div class="student-info">
            <el-avatar 
              :size="60" 
              :src="selectedLeave.student_avatar"
              alt="我的头像"
            >
              {{ getCurrentUserName()?.charAt(0) }}
            </el-avatar>
            <div class="student-details">
              <h3>{{ getCurrentUserName() }}</h3>
              <p>学号：{{ getCurrentUserStudentId() }}</p>
            </div>
          </div>
          <el-tag 
            :type="getStatusTag(selectedLeave.status)" 
            size="large"
          >
            {{ getStatusLabel(selectedLeave.status) }}
          </el-tag>
        </div>
        
        <div class="leave-type-info">
          <div class="type-duration-row">
            <div class="type-item">
              <label>请假类型：</label>
              <el-tag :type="getLeaveTypeTag(selectedLeave.title)" size="small">
                {{ selectedLeave.title }}
              </el-tag>
            </div>
            <div class="duration-item">
              <label>请假时长：</label>
              <span class="duration-text">{{ calculateDuration(selectedLeave.start_time, selectedLeave.end_time) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <div class="info-item">
            <label>请假时间：</label>
            <span>{{ formatDate(selectedLeave.start_time) }} 至 {{ formatDate(selectedLeave.end_time) }}</span>
          </div>
          <div class="info-item">
            <label>申请时间：</label>
            <span>{{ formatDateTime(selectedLeave.created_at || selectedLeave.submit_time) }}</span>
          </div>
          <div class="info-item">
            <label>请假原因：</label>
            <p class="reason-detail">{{ selectedLeave.content || selectedLeave.description }}</p>
          </div>
          <div v-if="selectedLeave.attachments && selectedLeave.attachments.length > 0" class="info-item">
            <label>附件：</label>
            <div class="attachments-list">
              <div v-for="file in selectedLeave.attachments" :key="file.name" class="attachment-item">
                <el-icon><Paperclip /></el-icon>
                <span class="attachment-name" @click="previewAttachment(file)">{{ file.name }}</span>
                <el-button 
                  type="primary" 
                  link 
                  size="small" 
                  @click="downloadAttachment(file)"
                >
                  下载
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="selectedLeave.approve_comment" class="info-item">
            <label>审批意见：</label>
            <p class="approval-comment">{{ selectedLeave.approve_comment }}</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 请假审批弹窗（老师专用） -->
    <!--
    <el-dialog
        :lock-scroll=false
        v-model="approvalDialogVisible"
        title="请假审批" 
        width="700px"
    >
      <el-table :data="leaveListPending" style="width: 100%">
        <el-table-column prop="student_name" label="学生姓名" width="100" />
        <el-table-column prop="title" label="请假原因" width="120" />
        <el-table-column prop="content" label="请假说明" />
        <el-table-column prop="start_time" label="开始时间" width="140" />
        <el-table-column prop="end_time" label="结束时间" width="140" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="success" size="small" @click="approveLeave(scope.row, scope.$index)">批准</el-button>
            <el-button type="danger" size="small" @click="rejectLeave(scope.row, scope.$index)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Check, UploadFilled, Paperclip } from '@element-plus/icons-vue'
import api from '../../api'
import { mockApiRequest } from '../../mock/config'
import { mockApiResponses } from '../../mock/studyGroupData'

// Props
const props = defineProps({
  userRole: {
    type: String,
    default: 'student' // 'student' | 'teacher'
  },
  groupId: {
    type: Number,
    default: 2
  }
})

// 弹窗状态
const leaveDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const showLeaveDetail = ref(false)

// 请假表单
const leaveForm = ref({
  title: '',
  startDate: '',
  endDate: '',
  description: '',
  attachments: []
})

// 当前查看的请假详情
const selectedLeave = ref(null)
const uploadRef = ref()

const leaveFormRules = ref({
  title: [{ required: true, message: '请选择请假原因', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
})

// 请假数据
const leaveListApproved = ref([])
const leaveListPending = ref([])
const myLeaveList = ref([])
const leaveLoading = ref(false)
const leaveError = ref('')

// 内容展开状态（key: leave id, value: true/false）
const contentExpandMap = reactive({})

// 获取请假列表
async function fetchLeaveList() {
  leaveLoading.value = true
  leaveError.value = ''
  try {
    const response = await mockApiRequest(
      // 真实API调用
      async () => {
        let params = {}
        if (props.userRole === 'teacher') {
          params.group_id = props.groupId
        }
        const res = await api({
          url: '/information/leave/query',
          method: 'get',
          params
        })
        if (res.data && res.data.data) {
          return res.data.data
        }
        throw new Error('API返回错误')
      },
      // Mock响应
      async () => {
        const response = await mockApiResponses.getLeaveList(props.groupId)
        return response.data
      }
    )

    // 处理统一的数据结构
    const all = [
      ...(response.approved || []),
      ...(response.pending || [])
    ]
    myLeaveList.value = all
    leaveListApproved.value = response.approved || []
    leaveListPending.value = response.pending || []
  } catch (e) {
    console.error('获取请假列表失败:', e)
    leaveError.value = '请假信息获取失败'
  } finally {
    leaveLoading.value = false
  }
}

// 打开请假申请弹窗
const openLeaveDialog = () => {
  leaveDialogVisible.value = true
}

// 打开审批弹窗
const openApprovalDialog = () => {
  approvalDialogVisible.value = true
}

// 日期时间格式化
function formatDateTime(val) {
  if (!val) return ''
  const d = new Date(val)
  const pad = n => n < 10 ? '0' + n : n
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// 提交请假申请
const submitLeaveRequest = async () => {
  try {
    // 模拟文件上传处理
    const attachments = leaveForm.value.attachments.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: URL.createObjectURL(file.raw) // 模拟文件URL
    }))

    // 字段映射并格式化时间
    const payload = {
      Title: leaveForm.value.title,
      Content: leaveForm.value.description,
      Start_Time: formatDateTime(leaveForm.value.startDate),
      End_Time: formatDateTime(leaveForm.value.endDate),
      Group_Id: props.groupId,
      Attachments: attachments
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage({
      message: '请假申请已提交，等待审批',
      type: 'success',
      duration: 3000
    })
    leaveDialogVisible.value = false
    resetLeaveForm()
    await fetchLeaveList()
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  }
}

// 重置请假表单
const resetLeaveForm = () => {
  leaveForm.value = {
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    attachments: []
  }
  // 清空上传组件
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 文件上传处理
const handleFileChange = (file, fileList) => {
  leaveForm.value.attachments = fileList
}

const handleFileRemove = (file, fileList) => {
  leaveForm.value.attachments = fileList
}

// 查看请假详情
const viewLeaveDetail = (leave) => {
  selectedLeave.value = leave
  showLeaveDetail.value = true
}

// 关闭详情弹窗
const handleCloseDetail = () => {
  showLeaveDetail.value = false
  selectedLeave.value = null
}

// 获取当前用户信息（模拟）
const getCurrentUserName = () => {
  return '张三' // 实际项目中从全局状态获取
}

const getCurrentUserStudentId = () => {
  return '2025001' // 实际项目中从全局状态获取
}

// 工具方法
const getStatusTag = (status) => {
  if (status === 0 || status === 'pending') return 'warning'
  if (status === 1 || status === 'approved') return 'success'
  if (status === 2 || status === 'rejected') return 'danger'
  return 'info'
}

const getStatusLabel = (status) => {
  if (status === 0 || status === 'pending') return '待审批'
  if (status === 1 || status === 'approved') return '已批准'
  if (status === 2 || status === 'rejected') return '已拒绝'
  return '未知'
}

const getLeaveTypeTag = (type) => {
  const tagMap = {
    '病假': 'warning',
    '事假': 'info',
    '其他': ''
  }
  return tagMap[type] || ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return `${diffDays}天`
}

// 附件预览和下载
const previewAttachment = (file) => {
  const fileExtension = file.name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension)) {
    ElMessage.info('图片预览功能开发中...')
  } else if (['pdf'].includes(fileExtension)) {
    ElMessage.info('PDF预览功能开发中...')
  } else {
    ElMessage.info('该文件类型暂不支持预览')
  }
}

const downloadAttachment = (file) => {
  ElMessage.success(`正在下载：${file.name}`)
  // TODO: 实现真实的下载功能
}

// 弹窗关闭处理
const handleDialogClose = (done) => {
  resetLeaveForm()
  done()
}

// 批准请假
const approveLeave = async (row, idx) => {
  try {
    await api.post('information/leave/approve', { id: row.id, status: 1 })
    await fetchLeaveList()
    ElMessage.success(`已批准 ${row.student_name || row.student} 的请假申请`)
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 拒绝请假
const rejectLeave = async (row, idx) => {
  try {
    await api.post('information/leave/approve', { id: row.id, status: 2 })
    await fetchLeaveList()
    ElMessage.warning(`已拒绝 ${row.student_name || row.student} 的请假申请`)
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 我的请假分组展示
const groupedMyLeaves = computed(() => {
  const pending = []
  const approved = []
  const rejected = []
  for (const leave of myLeaveList.value) {
    if (leave.status === 0) pending.push(leave)
    else if (leave.status === 1) approved.push(leave)
    else if (leave.status === 2) rejected.push(leave)
  }
  return { pending, approved, rejected }
})

// 全部请假分组展示（老师）
const groupedAllLeaves = computed(() => {
  const pending = []
  const approved = []
  const rejected = []
  // 合并所有请假记录
  const all = [...leaveListPending.value, ...leaveListApproved.value]
  for (const leave of all) {
    if (leave.status === 0) pending.push(leave)
    else if (leave.status === 1) approved.push(leave)
    else if (leave.status === 2) rejected.push(leave)
  }
  return { pending, approved, rejected }
})

// 组件挂载时获取数据
onMounted(() => {
  fetchLeaveList()
})

// 暴露刷新方法
defineExpose({
  refreshData: fetchLeaveList
})

// 内容展开状态切换
function toggleContentExpand(id) {
  contentExpandMap[id] = !contentExpandMap[id]
}
</script>

<style scoped>
.leave-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.student-actions, .teacher-actions {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.leave-info-block {
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.leave-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  margin-top: 0;
}

.leave-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: #4a90e2;
  margin-bottom: 12px;
  margin-top: 20px;
}

.leave-subtitle:first-child {
  margin-top: 0;
}

.leave-loading {
  color: #888;
  font-size: 15px;
  margin: 16px 0;
  text-align: center;
  padding: 20px;
}

.leave-error {
  color: #e74c3c;
  font-size: 15px;
  margin: 16px 0;
  text-align: center;
  padding: 20px;
}

.no-data {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 40px 20px;
  background: #f9f9f9;
  border-radius: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background: #f8f9fa;
}

:deep(.el-table__row:hover > td) {
  background: #f0f8ff !important;
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  font-weight: 500;
}

.el-button + .el-button {
  margin-left: 8px;
}

.leave-content-cell {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
  padding: 2px 6px;
}
.leave-content-cell:hover {
  background: #f0f8ff;
}
.leave-content-cell.expanded {
  white-space: normal;
  word-break: break-all;
  max-width: 400px;
  background: #f6faff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
  z-index: 2;
}
.expand-btn {
  display: none;
}

/* 请假详情弹窗样式 */
.leave-detail {
  padding: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-details h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
}

.student-details p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.leave-type-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.type-duration-row {
  display: flex;
  gap: 32px;
  align-items: center;
}

.type-item,
.duration-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-item label,
.duration-item label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.duration-text {
  font-weight: 500;
  color: #409EFF;
  font-size: 13px;
}

.detail-content {
  margin-bottom: 24px;
}

.info-item {
  margin-bottom: 16px;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

.reason-detail {
  margin: 8px 0;
  color: #303133;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
}

.attachments-list {
  margin-top: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.attachment-name {
  color: #409EFF;
  font-size: 14px;
  cursor: pointer;
  flex: 1;
}

.attachment-name:hover {
  text-decoration: underline;
}

.approval-comment {
  margin: 8px 0;
  color: #303133;
  line-height: 1.6;
  background: #e8f4fd;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

/* 上传组件样式 */
.leave-upload {
  width: 100%;
}

.leave-upload :deep(.el-upload) {
  width: 100%;
}

.leave-upload :deep(.el-upload-dragger) {
  width: 100%;
}
</style>
