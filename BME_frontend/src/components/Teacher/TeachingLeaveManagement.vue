<template>
  <div class="teaching-leave-management">
    <!-- 统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ totalLeaves }}</div>
              <div class="stats-label">总请假数</div>
              <el-icon class="stats-icon"><Document /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card pending">
            <div class="stats-content">
              <div class="stats-number">{{ pendingLeaves }}</div>
              <div class="stats-label">待审批</div>
              <el-icon class="stats-icon"><Clock /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card approved">
            <div class="stats-content">
              <div class="stats-number">{{ approvedLeaves }}</div>
              <div class="stats-label">已批准</div>
              <el-icon class="stats-icon"><Check /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card rejected">
            <div class="stats-content">
              <div class="stats-number">{{ rejectedLeaves }}</div>
              <div class="stats-label">已拒绝</div>
              <el-icon class="stats-icon"><Close /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 请假列表管理 -->
    <div class="leave-management-section">
      <div class="section-header">
        <h3>请假申请管理</h3>
        <div class="filter-controls">
          <el-select v-model="statusFilter" placeholder="请假状态" clearable @change="handleFilterChange">
            <el-option label="全部状态" value="" />
            <el-option label="待审批" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleFilterChange"
          />
          <el-button type="primary" @click="exportLeaveData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>

      <div class="leave-table-container">
        <el-table 
          :data="filteredLeaves" 
          style="width: 100%"
          v-loading="loading"
          row-key="id"
        >
          <el-table-column prop="student_name" label="学生姓名" width="120">
            <template #default="{ row }">
              <div class="student-info">
                <el-avatar 
                  :size="32" 
                  :src="row.student_avatar"
                  :alt="row.student_name"
                >
                  {{ row.student_name?.charAt(0) }}
                </el-avatar>
                <span class="student-name">{{ row.student_name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="leave_type" label="请假类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getLeaveTypeTag(row.leave_type)" size="small">
                {{ getLeaveTypeLabel(row.leave_type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="start_date" label="开始时间" width="110">
            <template #default="{ row }">
              {{ formatDate(row.start_date) }}
            </template>
          </el-table-column>

          <el-table-column prop="end_date" label="结束时间" width="110">
            <template #default="{ row }">
              {{ formatDate(row.end_date) }}
            </template>
          </el-table-column>

          <el-table-column prop="duration" label="请假时长" width="100">
            <template #default="{ row }">
              <span class="duration-text">{{ calculateDuration(row.start_date, row.end_date) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="reason" label="请假原因" min-width="200">
            <template #default="{ row }">
              <div class="reason-content">
                <p class="reason-text">{{ row.reason }}</p>
                <div v-if="row.attachments && row.attachments.length > 0" class="attachments">
                  <el-icon><Paperclip /></el-icon>
                  <span>{{ row.attachments.length }}个附件</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusTag(row.status)" 
                size="small"
                :effect="row.status === 'pending' ? 'light' : 'dark'"
              >
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="submit_time" label="申请时间" width="120">
            <template #default="{ row }">
              {{ formatDateTime(row.submit_time) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewLeaveDetail(row)"
                >
                  查看详情
                </el-button>
                <el-button 
                  v-if="row.status === 'pending'"
                  type="success" 
                  size="small" 
                  @click="approveLeave(row)"
                >
                  批准
                </el-button>
                <el-button 
                  v-if="row.status === 'pending'"
                  type="danger" 
                  size="small" 
                  @click="rejectLeave(row)"
                >
                  拒绝
                </el-button>
              </div>
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

    <!-- 请假详情弹窗 -->
    <el-dialog
      v-model="showLeaveDetail"
      title="请假详情"
      width="600px"
      :before-close="handleCloseDetail"
    >
      <LeaveDetailView
        v-if="selectedLeave"
        :leave-data="selectedLeave"
        @approve="handleApproveLeave"
        @reject="handleRejectLeave"
        @close="showLeaveDetail = false"
      />
    </el-dialog>

    <!-- 审批操作弹窗 -->
    <el-dialog
      v-model="showApprovalDialog"
      :title="approvalAction === 'approve' ? '批准请假' : '拒绝请假'"
      width="500px"
    >
      <div class="approval-form">
        <div class="leave-summary">
          <p><strong>学生：</strong>{{ selectedLeave?.student_name }}</p>
          <p><strong>请假类型：</strong>{{ getLeaveTypeLabel(selectedLeave?.leave_type) }}</p>
          <p><strong>请假时间：</strong>{{ formatDate(selectedLeave?.start_date) }} 至 {{ formatDate(selectedLeave?.end_date) }}</p>
        </div>
        
        <el-form :model="approvalForm" label-width="80px">
          <el-form-item label="审批意见">
            <el-input
              v-model="approvalForm.comment"
              type="textarea"
              :rows="4"
              :placeholder="approvalAction === 'approve' ? '请输入批准意见（可选）' : '请输入拒绝原因'"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>

        <div class="dialog-footer">
          <el-button @click="showApprovalDialog = false">取消</el-button>
          <el-button 
            :type="approvalAction === 'approve' ? 'success' : 'danger'"
            @click="confirmApproval"
            :loading="submitting"
          >
            确认{{ approvalAction === 'approve' ? '批准' : '拒绝' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, Clock, Check, Close, Download, Paperclip 
} from '@element-plus/icons-vue'
import api from '../../api'
import LeaveDetailView from './LeaveDetailView.vue'

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

const emit = defineEmits(['leave-updated'])

// 响应式数据
const loading = ref(false)
const leaves = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const statusFilter = ref('')
const dateRange = ref([])

// 弹窗状态
const showLeaveDetail = ref(false)
const showApprovalDialog = ref(false)
const selectedLeave = ref(null)
const approvalAction = ref('')
const submitting = ref(false)

// 审批表单
const approvalForm = ref({
  comment: ''
})

// 计算属性
const totalLeaves = computed(() => leaves.value.length)
const pendingLeaves = computed(() => leaves.value.filter(l => l.status === 'pending').length)
const approvedLeaves = computed(() => leaves.value.filter(l => l.status === 'approved').length)
const rejectedLeaves = computed(() => leaves.value.filter(l => l.status === 'rejected').length)

const filteredLeaves = computed(() => {
  let filtered = leaves.value

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(leave => leave.status === statusFilter.value)
  }

  // 日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(leave => {
      const leaveDate = new Date(leave.submit_time)
      return leaveDate >= new Date(startDate) && leaveDate <= new Date(endDate)
    })
  }

  return filtered
})

// 方法
const fetchLeaves = async () => {
  loading.value = true
  try {
    const response = await api.get(`/group/${props.groupId}/leaves`, {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        status: statusFilter.value,
        start_date: dateRange.value?.[0],
        end_date: dateRange.value?.[1]
      }
    })

    if (response.data.code === 200) {
      leaves.value = response.data.data.leaves || []
      totalCount.value = response.data.data.total || 0
    }
  } catch (error) {
    console.error('获取请假数据失败:', error)
    ElMessage.error('获取请假数据失败')
    // 模拟数据
    leaves.value = generateMockLeaves()
    totalCount.value = leaves.value.length
  } finally {
    loading.value = false
  }
}

const generateMockLeaves = () => {
  return [
    {
      id: 1,
      student_name: '张三',
      student_avatar: '',
      leave_type: 'sick',
      start_date: '2024-01-15',
      end_date: '2024-01-17',
      reason: '感冒发烧，需要在家休息治疗',
      status: 'pending',
      submit_time: '2024-01-14 10:30:00',
      attachments: [{ name: '病假单.jpg' }]
    },
    {
      id: 2,
      student_name: '李四',
      student_avatar: '',
      leave_type: 'personal',
      start_date: '2024-01-20',
      end_date: '2024-01-20',
      reason: '家里有事需要处理',
      status: 'approved',
      submit_time: '2024-01-18 14:20:00',
      approve_comment: '同意请假，注意安全',
      attachments: []
    },
    {
      id: 3,
      student_name: '王五',
      student_avatar: '',
      leave_type: 'official',
      start_date: '2024-01-25',
      end_date: '2024-01-26',
      reason: '参加学科竞赛',
      status: 'approved',
      submit_time: '2024-01-22 09:15:00',
      approve_comment: '参加竞赛，加油！',
      attachments: [{ name: '竞赛通知.pdf' }]
    }
  ]
}

const getLeaveTypeTag = (type) => {
  const tagMap = {
    'sick': 'warning',
    'personal': 'info',
    'official': 'success',
    'other': ''
  }
  return tagMap[type] || ''
}

const getLeaveTypeLabel = (type) => {
  const labelMap = {
    'sick': '病假',
    'personal': '事假',
    'official': '公假',
    'other': '其他'
  }
  return labelMap[type] || '未知'
}

const getStatusTag = (status) => {
  const tagMap = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return tagMap[status] || ''
}

const getStatusLabel = (status) => {
  const labelMap = {
    'pending': '待审批',
    'approved': '已批准',
    'rejected': '已拒绝'
  }
  return labelMap[status] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  return new Date(dateTimeStr).toLocaleString('zh-CN')
}

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return `${diffDays}天`
}

const viewLeaveDetail = (leave) => {
  selectedLeave.value = leave
  showLeaveDetail.value = true
}

const approveLeave = (leave) => {
  selectedLeave.value = leave
  approvalAction.value = 'approve'
  approvalForm.value.comment = ''
  showApprovalDialog.value = true
}

const rejectLeave = (leave) => {
  selectedLeave.value = leave
  approvalAction.value = 'reject'
  approvalForm.value.comment = ''
  showApprovalDialog.value = true
}

const handleApproveLeave = (leave) => {
  approveLeave(leave)
}

const handleRejectLeave = (leave) => {
  rejectLeave(leave)
}

const confirmApproval = async () => {
  if (approvalAction.value === 'reject' && !approvalForm.value.comment.trim()) {
    ElMessage.warning('拒绝请假必须填写原因')
    return
  }

  submitting.value = true
  try {
    const response = await api.post(`/group/${props.groupId}/leaves/${selectedLeave.value.id}/approval`, {
      action: approvalAction.value,
      comment: approvalForm.value.comment
    })

    if (response.data.code === 200) {
      ElMessage.success(`${approvalAction.value === 'approve' ? '批准' : '拒绝'}成功`)
      showApprovalDialog.value = false
      await fetchLeaves()
      emit('leave-updated')
    }
  } catch (error) {
    console.error('审批操作失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchLeaves()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchLeaves()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchLeaves()
}

const handleCloseDetail = () => {
  showLeaveDetail.value = false
  selectedLeave.value = null
}

const exportLeaveData = async () => {
  try {
    ElMessage.info('导出功能开发中...')
    // TODO: 实现导出功能
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 监听器
watch(() => props.groupId, () => {
  if (props.groupId) {
    fetchLeaves()
  }
}, { immediate: true })

onMounted(() => {
  fetchLeaves()
})
</script>

<style scoped>
.teaching-leave-management {
  width: 100%;
}

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

.stats-card.approved {
  border-left: 4px solid #67C23A;
}

.stats-card.rejected {
  border-left: 4px solid #F56C6C;
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

.leave-management-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.section-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.leave-table-container {
  padding: 24px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-name {
  font-weight: 500;
  color: #303133;
}

.reason-content {
  max-width: 200px;
}

.reason-text {
  margin: 0 0 4px 0;
  line-height: 1.4;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.attachments {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}

.duration-text {
  font-weight: 500;
  color: #409EFF;
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.approval-form {
  padding: 0;
}

.leave-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.leave-summary p {
  margin: 0 0 8px 0;
  color: #606266;
  line-height: 1.5;
}

.leave-summary p:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .filter-controls {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
  }
  
  .stats-overview .el-col {
    margin-bottom: 12px;
  }
}
</style>
