<template>
  <div class="leave-detail-view">
    <div class="detail-header">
      <div class="student-info">
        <el-avatar 
          :size="48" 
          :src="leaveData.student_avatar"
          :alt="leaveData.student_name"
        >
          {{ leaveData.student_name?.charAt(0) }}
        </el-avatar>
        <div class="student-details">
          <h3>{{ leaveData.student_name }}</h3>
          <p>{{ leaveData.student_id || '学号未提供' }}</p>
        </div>
      </div>
      <el-tag 
        :type="getStatusTag(leaveData.status)" 
        size="large"
        :effect="leaveData.status === 'pending' ? 'light' : 'dark'"
      >
        {{ getStatusLabel(leaveData.status) }}
      </el-tag>
    </div>

    <div class="detail-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <h4 class="section-title">请假信息</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>请假类型：</label>
              <el-tag :type="getLeaveTypeTag(leaveData.leave_type)" size="small">
                {{ getLeaveTypeLabel(leaveData.leave_type) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>申请时间：</label>
              <span>{{ formatDateTime(leaveData.submit_time) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>开始时间：</label>
              <span>{{ formatDate(leaveData.start_date) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>结束时间：</label>
              <span>{{ formatDate(leaveData.end_date) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>请假时长：</label>
              <span class="duration-highlight">{{ calculateDuration(leaveData.start_date, leaveData.end_date) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>紧急程度：</label>
              <el-rate 
                v-model="urgencyLevel" 
                :max="3" 
                disabled 
                show-text 
                :texts="['普通', '紧急', '非常紧急']"
              />
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 请假原因 -->
      <div class="info-section">
        <h4 class="section-title">请假原因</h4>
        <div class="reason-content">
          <p>{{ leaveData.reason || '未提供详细原因' }}</p>
        </div>
      </div>

      <!-- 附件信息 -->
      <div v-if="leaveData.attachments && leaveData.attachments.length > 0" class="info-section">
        <h4 class="section-title">相关附件</h4>
        <div class="attachments-list">
          <div 
            v-for="(attachment, index) in leaveData.attachments" 
            :key="index"
            class="attachment-item"
          >
            <el-icon class="attachment-icon"><Paperclip /></el-icon>
            <span class="attachment-name">{{ attachment.name }}</span>
            <el-button type="primary" text size="small" @click="downloadAttachment(attachment)">
              下载
            </el-button>
          </div>
        </div>
      </div>

      <!-- 审批历史 -->
      <div v-if="leaveData.approval_history && leaveData.approval_history.length > 0" class="info-section">
        <h4 class="section-title">审批历史</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in leaveData.approval_history"
            :key="index"
            :type="getTimelineType(record.action)"
            :timestamp="formatDateTime(record.time)"
          >
            <div class="timeline-content">
              <p><strong>{{ record.action === 'submit' ? '提交申请' : (record.action === 'approve' ? '批准请假' : '拒绝请假') }}</strong></p>
              <p v-if="record.operator">操作人：{{ record.operator }}</p>
              <p v-if="record.comment" class="comment">{{ record.comment }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 审批意见 -->
      <div v-if="leaveData.status !== 'pending'" class="info-section">
        <h4 class="section-title">审批意见</h4>
        <div class="approval-comment">
          <div class="comment-header">
            <el-icon :color="leaveData.status === 'approved' ? '#67C23A' : '#F56C6C'">
              <component :is="leaveData.status === 'approved' ? 'Check' : 'Close'" />
            </el-icon>
            <span class="comment-status">
              {{ leaveData.status === 'approved' ? '已批准' : '已拒绝' }}
            </span>
            <span class="comment-time">{{ formatDateTime(leaveData.approval_time) }}</span>
          </div>
          <p class="comment-text">
            {{ leaveData.approve_comment || leaveData.reject_comment || '无审批意见' }}
          </p>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-footer">
      <el-button @click="$emit('close')">关闭</el-button>
      <div v-if="leaveData.status === 'pending'" class="approval-actions">
        <el-button type="danger" @click="$emit('reject', leaveData)">
          <el-icon><Close /></el-icon>
          拒绝请假
        </el-button>
        <el-button type="success" @click="$emit('approve', leaveData)">
          <el-icon><Check /></el-icon>
          批准请假
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Check, Close, Paperclip 
} from '@element-plus/icons-vue'

const props = defineProps({
  leaveData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['approve', 'reject', 'close'])

// 紧急程度（根据请假类型和时间自动判断）
const urgencyLevel = computed(() => {
  if (props.leaveData.leave_type === 'sick') return 2 // 病假通常比较紧急
  if (props.leaveData.leave_type === 'official') return 1 // 公假一般不太紧急
  
  // 根据申请时间和开始时间的间隔判断
  const submitTime = new Date(props.leaveData.submit_time)
  const startTime = new Date(props.leaveData.start_date)
  const timeDiff = startTime - submitTime
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
  
  if (daysDiff < 1) return 3 // 当天请假，非常紧急
  if (daysDiff < 3) return 2 // 3天内请假，紧急
  return 1 // 普通
})

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

const getTimelineType = (action) => {
  const typeMap = {
    'submit': 'primary',
    'approve': 'success',
    'reject': 'danger'
  }
  return typeMap[action] || 'primary'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

const downloadAttachment = (attachment) => {
  // TODO: 实现附件下载功能
  ElMessage.info('附件下载功能开发中...')
  console.log('下载附件:', attachment)
}
</script>

<style scoped>
.leave-detail-view {
  width: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 24px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-details h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.student-details p {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.detail-content {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.info-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-left: 4px solid #409EFF;
  padding-left: 12px;
}

.info-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item label {
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.duration-highlight {
  color: #409EFF;
  font-weight: 600;
}

.reason-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.reason-content p {
  margin: 0;
  line-height: 1.6;
  color: #303133;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.attachment-icon {
  color: #409EFF;
  font-size: 18px;
}

.attachment-name {
  flex: 1;
  color: #303133;
  font-weight: 500;
}

.timeline-content {
  padding: 0;
}

.timeline-content p {
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.timeline-content .comment {
  color: #606266;
  font-style: italic;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.approval-comment {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  border-left: 4px solid var(--status-color, #409EFF);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.comment-status {
  font-weight: 600;
  color: #303133;
}

.comment-time {
  color: #909399;
  font-size: 14px;
  margin-left: auto;
}

.comment-text {
  margin: 0;
  line-height: 1.6;
  color: #303133;
}

.action-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  margin-top: 24px;
}

.approval-actions {
  display: flex;
  gap: 12px;
}

/* 状态相关的颜色变量 */
.approval-comment[data-status="approved"] {
  --status-color: #67C23A;
}

.approval-comment[data-status="rejected"] {
  --status-color: #F56C6C;
}

/* 自定义滚动条 */
.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .action-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .approval-actions {
    justify-content: center;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-item label {
    min-width: auto;
  }
}
</style>
