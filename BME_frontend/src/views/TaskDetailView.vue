<template>
  <div class="task-detail-view">
    <!-- 调试工具栏 -->
    <div v-if="showDebugTools" class="debug-toolbar">
      <div class="debug-title">🛠️ 调试工具</div>
      <div class="debug-buttons">
        <el-button size="small" @click="setDebugMode('normal')">正常状态</el-button>
        <el-button size="small" type="warning" @click="setDebugMode('not_submitted')">未提交</el-button>
        <el-button size="small" type="danger" @click="setDebugMode('overdue')">已过期</el-button>
        <el-button size="small" type="info" @click="setDebugMode('late_submission')">逾期提交</el-button>
        <el-button size="small" type="warning" @click="setDebugMode('urgent')">紧急(1小时)</el-button>
        <el-button size="small" type="primary" @click="setDebugMode('warning')">警告(2天)</el-button>
        <el-button size="small" @click="toggleDebugTools">隐藏</el-button>
      </div>
      <div class="debug-info">
        当前模式: <el-tag size="small">{{ currentDebugMode }}</el-tag>
        | 任务状态: <el-tag size="small" :type="isTaskOverdue() ? 'danger' : 'success'">
          {{ isTaskOverdue() ? '已过期' : '进行中' }}
        </el-tag>
        | 提交状态: <el-tag size="small" :type="mySubmission ? 'success' : 'warning'">
          {{ mySubmission ? '已提交' : '未提交' }}
        </el-tag>
      </div>
    </div>
    
    <!-- 显示调试工具按钮 -->
    <div v-else class="debug-toggle">
      <el-button size="small" text @click="toggleDebugTools">
        <el-icon><Tools /></el-icon>
        显示调试工具
      </el-button>
    </div>

    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'study-groups' }">学习小组</el-breadcrumb-item>
        <el-breadcrumb-item 
          :to="{ name: 'study-group-details', params: { groupId: route.params.groupId } }"
        >
          {{ groupInfo.group_name || '小组详情' }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>任务详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 任务详情内容区域 -->
    <div class="task-detail-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>
      
      <div v-else-if="error" class="error-container">
        <el-result
          icon="error"
          title="加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="fetchTaskDetail">重试</el-button>
            <el-button @click="goBack">返回</el-button>
          </template>
        </el-result>
      </div>

      <div v-else-if="taskDetail" class="task-content">
        <!-- 任务头部信息 -->
        <div class="task-header">
          <div class="task-header-left">
            <div class="task-title-section">
              <h1 class="task-title">{{ taskDetail.title }}</h1>
              <div class="task-meta">
                <el-tag 
                  v-if="taskDetail.priority"
                  :type="getPriorityType(taskDetail.priority)"
                  size="large"
                  class="priority-tag"
                >
                  {{ getPriorityText(taskDetail.priority) }}
                </el-tag>
                <el-tag 
                  :type="getStatusType(taskDetail.status)"
                  size="large"
                  class="status-tag"
                >
                  {{ getStatusText(taskDetail.status) }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="task-header-right">
            <el-button @click="goBack" size="large">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <el-button 
              v-if="props.userRole === 'teacher'" 
              type="primary" 
              size="large"
              @click="editTask"
            >
              <el-icon><Edit /></el-icon>
              编辑任务
            </el-button>
          </div>
        </div>

        <!-- 任务详细内容 -->
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Document /></el-icon>
              <span>任务详情</span>
            </div>
          </template>
          <div class="task-description">
            <div class="description-content" v-html="formatContent(taskDetail.content)"></div>
          </div>
        </el-card>

        <!-- 任务基本信息卡片 - 简化为两个 -->
        <div class="task-info-grid">
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><Clock /></el-icon>
                <span>时间信息</span>
              </div>
            </template>
            <div class="info-item">
              <span class="info-label">发布时间：</span>
              <span class="info-value">{{ formatDateTime(taskDetail.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">截止时间：</span>
              <span class="info-value deadline">{{ formatDateTime(taskDetail.end_time) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">剩余时间：</span>
              <span class="info-value" :class="getTimeLeftClass(taskDetail.end_time)">
                {{ getTimeLeft(taskDetail.end_time) }}
              </span>
            </div>
          </el-card>

          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><DataAnalysis /></el-icon>
                <span>提交统计</span>
              </div>
            </template>
            <div class="info-item">
              <span class="info-label">发布者：</span>
              <span class="info-value">{{ taskDetail.creator_name || '系统' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">已提交：</span>
              <span class="info-value submitted">{{ taskDetail.submitted_students?.length || 0 }}人</span>
            </div>
            <div class="info-item">
              <span class="info-label">提交率：</span>
              <span class="info-value completion-rate">{{ getCompletionRate() }}%</span>
            </div>
          </el-card>
        </div>

        <!-- 提交管理区域（教师可见） -->
        <el-card v-if="props.userRole === 'teacher'" class="submission-management" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><List /></el-icon>
              <span>提交管理</span>
            </div>
          </template>
          
          <el-tabs v-model="activeSubmissionTab" class="submission-tabs">
            <el-tab-pane label="已提交" name="submitted">
              <div v-if="taskDetail.submitted_students?.length > 0" class="student-list">
                <div 
                  v-for="student in taskDetail.submitted_students" 
                  :key="student.id"
                  class="student-item submitted-item"
                >
                  <div class="student-info">
                    <el-avatar :size="40" :src="student.avatar">
                      {{ student.name?.charAt(0) }}
                    </el-avatar>
                    <div class="student-details">
                      <div class="student-name">{{ student.name }}</div>
                      <div class="submission-time">
                        提交时间：{{ formatDateTime(student.submitted_at) }}
                      </div>
                    </div>
                  </div>
                  <div class="student-actions">
                    <el-button type="primary" size="small" @click="viewSubmission(student)">
                      查看提交
                    </el-button>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无提交" />
            </el-tab-pane>
            
            <el-tab-pane label="未提交" name="not-submitted">
              <div v-if="taskDetail.not_submitted_students?.length > 0" class="student-list">
                <div 
                  v-for="student in taskDetail.not_submitted_students" 
                  :key="student.id"
                  class="student-item not-submitted-item"
                >
                  <div class="student-info">
                    <el-avatar :size="40" :src="student.avatar">
                      {{ student.name?.charAt(0) }}
                    </el-avatar>
                    <div class="student-details">
                      <div class="student-name">{{ student.name }}</div>
                      <div class="not-submitted-text">未提交</div>
                    </div>
                  </div>
                  <div class="student-actions">
                    <el-button type="warning" size="small" @click="remindStudent(student)">
                      发送提醒
                    </el-button>
                  </div>
                </div>
              </div>
              <el-empty v-else description="所有学生都已提交" />
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 学生提交区域（学生可见） -->
        <el-card v-if="props.userRole === 'student'" class="student-submission" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Upload /></el-icon>
              <span>我的提交</span>
              <el-tag 
                v-if="getSubmissionStatusTag()" 
                :type="getSubmissionStatusTag().type" 
                size="small"
                class="submission-status-tag"
              >
                {{ getSubmissionStatusTag().text }}
              </el-tag>
            </div>
          </template>
          
          <!-- 已提交状态 -->
          <div v-if="mySubmission" class="submission-status submitted">
            <div class="submission-header">
              <el-icon class="status-icon success"><SuccessFilled /></el-icon>
              <div class="status-info">
                <h3 class="status-title">已成功提交</h3>
                <p class="status-desc">提交时间：{{ formatDateTime(mySubmission.submitted_at) }}</p>
                <p v-if="isLateSubmission(mySubmission.submitted_at)" class="late-warning">
                  <el-icon><WarningFilled /></el-icon>
                  逾期提交
                </p>
              </div>
            </div>
            
            <div class="submission-content">
              <div class="submission-files" v-if="mySubmission.files && mySubmission.files.length > 0">
                <h4>提交的文件：</h4>
                <div class="file-list">
                  <div v-for="file in mySubmission.files" :key="file.id" class="file-item">
                    <el-icon class="file-icon"><Document /></el-icon>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <div class="file-actions">
                      <el-button type="text" size="small" @click="previewFile(file)">
                        <el-icon><View /></el-icon>
                        预览
                      </el-button>
                      <el-button type="text" size="small" @click="downloadFile(file)">
                        <el-icon><Download /></el-icon>
                        下载
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="submission-text" v-if="mySubmission.content">
                <h4>提交内容：</h4>
                <div class="text-content">{{ mySubmission.content }}</div>
              </div>
            </div>
            
            <div class="submission-actions">
              <el-button 
                v-if="!isTaskOverdue()" 
                type="primary"
                @click="resubmitTask"
                :disabled="isTaskOverdue()"
              >
                <el-icon><Upload /></el-icon>
                重新提交
              </el-button>
              <el-button 
                v-else
                type="info"
                disabled
              >
                <el-icon><CircleCloseFilled /></el-icon>
                任务已过期
              </el-button>
            </div>
          </div>
          
          <!-- 未提交状态 -->
          <div v-else class="submission-status not-submitted">
            <!-- 任务已过期 -->
            <div v-if="isTaskOverdue()" class="overdue-status">
              <el-icon class="status-icon danger"><CircleCloseFilled /></el-icon>
              <div class="status-info">
                <h3 class="status-title">任务已过期</h3>
                <p class="status-desc">截止时间：{{ formatDateTime(taskDetail.end_time) }}</p>
                <p class="overdue-time">已过期 {{ getOverdueTime() }}</p>
              </div>
            </div>
            
            <!-- 任务未过期 -->
            <div v-else class="pending-status">
              <el-icon class="status-icon warning"><WarningFilled /></el-icon>
              <div class="status-info">
                <h3 class="status-title">尚未提交</h3>
                <p class="status-desc">请及时完成任务并提交</p>
                <p class="time-reminder" :class="getUrgencyClass()">
                  剩余时间：{{ getTimeLeft(taskDetail.end_time) }}
                </p>
              </div>
            </div>
            
            <div class="upload-area">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="true"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                multiple
                drag
                class="submission-upload"
                :disabled="isTaskOverdue()"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持多个文件上传，单个文件不超过10MB
                  </div>
                </template>
              </el-upload>
              
              <el-input
                v-model="submissionText"
                type="textarea"
                :rows="6"
                placeholder="请输入作业说明或心得体会..."
                class="submission-textarea"
                :disabled="isTaskOverdue()"
              />
            </div>
            
            <div class="submission-actions">
              <el-button 
                type="primary" 
                @click="submitTask"
                :disabled="isTaskOverdue() || (!uploadedFiles.length && !submissionText.trim())"
                :loading="submitting"
              >
                <el-icon><Upload /></el-icon>
                {{ isTaskOverdue() ? '任务已过期' : '提交任务' }}
              </el-button>
              <el-button @click="saveDraft" v-if="!isTaskOverdue()">
                <el-icon><DocumentCopy /></el-icon>
                保存草稿
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 提交详情弹窗 -->
    <el-dialog
      v-model="submissionDialogVisible"
      :title="submissionDialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentViewingSubmission" class="submission-detail">
        <div class="submission-info-header">
          <div class="student-info-large">
            <el-avatar :size="60" :src="currentViewingSubmission.student?.avatar">
              {{ currentViewingSubmission.student?.name?.charAt(0) }}
            </el-avatar>
            <div class="student-details-large">
              <h3>{{ currentViewingSubmission.student?.name }}</h3>
              <p class="submission-meta">
                提交时间：{{ formatDateTime(currentViewingSubmission.submitted_at) }}
                <el-tag 
                  v-if="isLateSubmission(currentViewingSubmission.submitted_at)" 
                  type="warning" 
                  size="small"
                  class="late-tag"
                >
                  逾期提交
                </el-tag>
              </p>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="submission-content-detail">
          <div v-if="currentViewingSubmission.files && currentViewingSubmission.files.length > 0" class="files-section">
            <h4><el-icon><Folder /></el-icon> 提交文件 ({{ currentViewingSubmission.files.length }})</h4>
            <div class="file-grid">
              <div v-for="file in currentViewingSubmission.files" :key="file.id" class="file-card">
                <div class="file-preview">
                  <el-icon class="file-type-icon" :class="getFileTypeClass(file.type)">
                    <component :is="getFileIcon(file.type)" />
                  </el-icon>
                </div>
                <div class="file-info">
                  <div class="file-name" :title="file.name">{{ file.name }}</div>
                  <div class="file-meta">
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <span class="file-type">{{ file.type }}</span>
                  </div>
                </div>
                <div class="file-actions">
                  <el-button type="text" size="small" @click="previewFile(file)">
                    <el-icon><View /></el-icon>
                    预览
                  </el-button>
                  <el-button type="text" size="small" @click="downloadFile(file)">
                    <el-icon><Download /></el-icon>
                    下载
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentViewingSubmission.content" class="text-section">
            <h4><el-icon><Document /></el-icon> 提交说明</h4>
            <div class="content-display">
              {{ currentViewingSubmission.content }}
            </div>
          </div>

          <div v-if="props.userRole === 'teacher'" class="grading-section">
            <h4><el-icon><Star /></el-icon> 评分与反馈</h4>
            <div class="grading-form">
              <el-form :model="gradingForm" label-width="80px">
                <el-form-item label="评分">
                  <el-rate
                    v-model="gradingForm.score"
                    :max="5"
                    show-score
                    text-color="#ff9900"
                    score-template="{value} 分"
                  />
                </el-form-item>
                <el-form-item label="评语">
                  <el-input
                    v-model="gradingForm.feedback"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入评语和建议..."
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="submitGrading">提交评分</el-button>
                  <el-button @click="resetGrading">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="submissionDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 文件预览弹窗 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="文件预览"
      width="70%"
      :close-on-click-modal="false"
    >
      <div class="file-preview-container">
        <div v-if="currentPreviewFile.type?.includes('image')" class="image-preview">
          <img :src="currentPreviewFile.url" :alt="currentPreviewFile.name" class="preview-image" />
        </div>
        <div v-else-if="currentPreviewFile.type?.includes('text')" class="text-preview">
          <pre>{{ currentPreviewFile.content }}</pre>
        </div>
        <div v-else class="unsupported-preview">
          <el-icon class="large-icon"><Document /></el-icon>
          <p>此文件类型不支持预览，请下载后查看</p>
          <el-button type="primary" @click="downloadFile(currentPreviewFile)">下载文件</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  User, 
  DataAnalysis, 
  Document, 
  List, 
  Upload,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  UploadFilled,
  View,
  Download,
  DocumentCopy,
  Folder,
  Star,
  Tools
} from '@element-plus/icons-vue'
import api from '../api'

// 定义 props
const props = defineProps({
  groupId: {
    type: Number,
    required: true
  },
  taskId: {
    type: Number,
    required: true
  },
  userRole: {
    type: String,
    default: 'student'
  }
})

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const error = ref('')
const taskDetail = ref(null)
const groupInfo = ref({})
const activeSubmissionTab = ref('submitted')
const mySubmission = ref(null)

// 提交相关
const submissionText = ref('')
const uploadedFiles = ref([])
const submitting = ref(false)
const uploadRef = ref()

// 弹窗相关
const submissionDialogVisible = ref(false)
const submissionDialogTitle = ref('')
const currentViewingSubmission = ref(null)
const previewDialogVisible = ref(false)
const currentPreviewFile = ref({})

// 评分相关
const gradingForm = ref({
  score: 0,
  feedback: ''
})

// 调试相关
const showDebugTools = ref(false)
const currentDebugMode = ref('normal')

// 计算属性
const getCompletionRate = () => {
  if (!taskDetail.value) return 0
  const submitted = taskDetail.value.submitted_students?.length || 0
  const total = (taskDetail.value.submitted_students?.length || 0) + (taskDetail.value.not_submitted_students?.length || 0)
  return total > 0 ? Math.round((submitted / total) * 100) : 0
}

// 生命周期
onMounted(() => {
  fetchTaskDetail()
  fetchGroupInfo()
})

// 方法
const fetchTaskDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const taskId = props.taskId || route.params.taskId
    const groupId = props.groupId || route.params.groupId
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里应该调用真实的API
    // 为了便于调试，添加一些调试模式
    const debugMode = route.query.debug || currentDebugMode.value || 'normal' // normal, overdue, not_submitted, late_submission
    
    let endTime = '2026-01-25 23:59:59' // 默认未过期
    let submittedStudents = [
      { 
        id: 1, 
        name: '张三', 
        avatar: '', 
        submitted_at: '2024-01-20 14:30:00',
        files: [
          { id: 1, name: 'vue-demo.zip', size: 1024000, type: 'application/zip' },
          { id: 2, name: '学习心得.docx', size: 51200, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
        ],
        content: '通过本次学习，我深入了解了Vue.js的核心概念，包括响应式数据、组件化开发等...'
      },
      { 
        id: 2, 
        name: '李四', 
        avatar: '', 
        submitted_at: '2024-01-26 10:15:00', // 逾期提交
        files: [
          { id: 3, name: 'project.js', size: 2048, type: 'application/javascript' }
        ],
        content: '完成了基础的Vue.js项目，但时间有点紧张，希望老师多给点建议。'
      }
    ]
    
    // 根据调试模式调整数据
    switch (debugMode) {
      case 'overdue':
        // 设置任务已过期
        endTime = '2024-01-20 23:59:59'
        break
      case 'not_submitted':
        // 当前用户未提交
        submittedStudents = submittedStudents.filter(s => s.id !== 1)
        break
      case 'late_submission':
        // 当前用户逾期提交
        endTime = '2024-01-19 23:59:59'
        submittedStudents[0].submitted_at = '2024-01-20 14:30:00'
        break
      case 'urgent':
        // 紧急状态 - 1小时后过期
        const urgentDate = new Date()
        urgentDate.setHours(urgentDate.getHours() + 1)
        endTime = urgentDate.toISOString().replace('T', ' ').substring(0, 19)
        submittedStudents = submittedStudents.filter(s => s.id !== 1)
        break
      case 'warning':
        // 警告状态 - 2天后过期
        const warningDate = new Date()
        warningDate.setDate(warningDate.getDate() + 2)
        endTime = warningDate.toISOString().replace('T', ' ').substring(0, 19)
        submittedStudents = submittedStudents.filter(s => s.id !== 1)
        break
    }
    
    taskDetail.value = {
      id: taskId,
      title: '前端框架学习任务',
      content: '请学习Vue.js框架的基础知识，包括组件化开发、路由管理、状态管理等核心概念。完成后提交学习心得和代码示例。\n\n要求：\n1. 完成Vue.js基础教程\n2. 提交代码示例\n3. 写一份学习心得（不少于500字）',
      priority: 'high',
      status: 'in_progress',
      created_at: '2024-01-15 09:00:00',
      end_time: endTime,
      group_name: '前端开发小组',
      creator_name: '张老师',
      submitted_students: submittedStudents,
      not_submitted_students: [
        { id: 3, name: '王五', avatar: '' },
        { id: 4, name: '赵六', avatar: '' }
      ]
    }
    
    // 如果是学生，模拟检查是否已提交
    if (props.userRole === 'student') {
      const currentUserId = 1 // 从全局状态获取当前用户ID
      mySubmission.value = taskDetail.value.submitted_students?.find(
        student => student.id === currentUserId
      )
      
      // 如果没有提交记录，加载草稿
      if (!mySubmission.value) {
        loadDraft()
      }
    }
    
  } catch (err) {
    error.value = err.message || '加载任务详情失败'
  } finally {
    loading.value = false
  }
}

const fetchGroupInfo = async () => {
  try {
    const groupId = props.groupId || route.params.groupId
    // 模拟API调用获取小组信息
    groupInfo.value = {
      group_name: '前端开发小组',
      student_count: 6
    }
  } catch (err) {
    console.error('获取小组信息失败:', err)
  }
}

// 文件上传处理
const handleFileChange = (file, fileList) => {
  uploadedFiles.value = fileList
}

const handleFileRemove = (file, fileList) => {
  uploadedFiles.value = fileList
}

// 加载草稿
const loadDraft = () => {
  const draft = localStorage.getItem(`task_draft_${props.taskId || route.params.taskId}`)
  if (draft) {
    const draftData = JSON.parse(draft)
    submissionText.value = draftData.content || ''
    // 注意：文件需要重新选择，无法从localStorage恢复
  }
}

// 保存草稿
const saveDraft = () => {
  const draftData = {
    content: submissionText.value,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem(`task_draft_${props.taskId || route.params.taskId}`, JSON.stringify(draftData))
  ElMessage.success('草稿已保存')
}

const goBack = () => {
  router.go(-1)
}

const editTask = () => {
  // 跳转到任务编辑页面或打开编辑弹窗
  ElMessage.info('编辑任务功能开发中...')
}

const viewSubmission = (student) => {
  const submission = taskDetail.value.submitted_students.find(s => s.id === student.id)
  if (submission) {
    currentViewingSubmission.value = {
      ...submission,
      student: student
    }
    submissionDialogTitle.value = `${student.name} 的提交内容`
    submissionDialogVisible.value = true
  }
}

const remindStudent = (student) => {
  ElMessageBox.confirm(
    `确定要向 ${student.name} 发送任务提醒吗？`,
    '发送提醒',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('提醒已发送')
  })
}

const viewMySubmission = () => {
  if (mySubmission.value) {
    currentViewingSubmission.value = {
      ...mySubmission.value,
      student: { name: '我', id: 'current' }
    }
    submissionDialogTitle.value = '我的提交内容'
    submissionDialogVisible.value = true
  }
}

const editSubmission = () => {
  if (isTaskOverdue()) {
    ElMessage.warning('任务已过期，无法修改提交')
    return
  }
  ElMessage.info('进入修改模式...')
  // 这里可以实现修改逻辑
}

const resubmitTask = () => {
  if (isTaskOverdue()) {
    ElMessage.warning('任务已过期，无法重新提交')
    return
  }
  
  ElMessageBox.confirm(
    '重新提交将覆盖之前的提交内容，确定要继续吗？',
    '重新提交确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清除当前提交记录，回到未提交状态
    mySubmission.value = null
    // 清空表单
    submissionText.value = ''
    uploadedFiles.value = []
    // 清空上传组件
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    ElMessage.success('已清除提交记录，可以重新提交')
  }).catch(() => {
    ElMessage.info('已取消重新提交')
  })
}

const submitTask = async () => {
  if (isTaskOverdue()) {
    ElMessage.warning('任务已过期，无法提交')
    return
  }
  
  if (!uploadedFiles.value.length && !submissionText.value.trim()) {
    ElMessage.warning('请上传文件或填写提交内容')
    return
  }
  
  try {
    submitting.value = true
    
    // 模拟上传过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 创建提交记录
    const newSubmission = {
      id: Date.now(),
      submitted_at: new Date().toISOString(),
      files: uploadedFiles.value.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream'
      })),
      content: submissionText.value
    }
    
    mySubmission.value = newSubmission
    
    // 清除草稿
    localStorage.removeItem(`task_draft_${props.taskId || route.params.taskId}`)
    
    ElMessage.success('提交成功！')
    
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 工具方法
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content) => {
  if (!content) return ''
  // 简单的内容格式化，将换行转换为<br>
  return content.replace(/\n/g, '<br>')
}

const getPriorityType = (priority) => {
  const typeMap = {
    'urgent': 'danger',
    'high': 'warning',
    'normal': '',
    'low': 'info',
    'unimportant': 'info'
  }
  return typeMap[priority] || ''
}

const getPriorityText = (priority) => {
  const textMap = {
    'urgent': '紧急',
    'high': '高优先级',
    'normal': '普通',
    'low': '低优先级',
    'unimportant': '不重要'
  }
  return textMap[priority] || '普通'
}

const getStatusType = (status) => {
  const typeMap = {
    'in_progress': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return textMap[status] || '未知'
}

const getTimeLeft = (endTime) => {
  if (!endTime) return '无限制'
  
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) {
    return '已逾期'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时`
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes}分钟`
  }
}

const getTimeLeftClass = (endTime) => {
  if (!endTime) return ''
  
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) {
    return 'overdue'
  } else if (diff <= 24 * 60 * 60 * 1000) {
    return 'urgent'
  } else if (diff <= 3 * 24 * 60 * 60 * 1000) {
    return 'warning'
  }
  return 'normal'
}

// 检查任务是否过期
const isTaskOverdue = () => {
  if (!taskDetail.value?.end_time) return false
  return new Date() > new Date(taskDetail.value.end_time)
}

// 检查是否逾期提交
const isLateSubmission = (submittedAt) => {
  if (!taskDetail.value?.end_time || !submittedAt) return false
  return new Date(submittedAt) > new Date(taskDetail.value.end_time)
}

// 获取过期时间
const getOverdueTime = () => {
  if (!taskDetail.value?.end_time) return ''
  
  const now = new Date()
  const end = new Date(taskDetail.value.end_time)
  const diff = now.getTime() - end.getTime()
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时`
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes}分钟`
  }
}

// 获取紧急程度样式
const getUrgencyClass = () => {
  const timeLeft = getTimeLeftClass(taskDetail.value?.end_time)
  return {
    'urgent-reminder': timeLeft === 'urgent',
    'warning-reminder': timeLeft === 'warning',
    'normal-reminder': timeLeft === 'normal'
  }
}

// 获取提交状态标签
const getSubmissionStatusTag = () => {
  if (mySubmission.value) {
    const isLate = isLateSubmission(mySubmission.value.submitted_at)
    return {
      type: isLate ? 'warning' : 'success',
      text: isLate ? '逾期提交' : '已提交'
    }
  } else if (isTaskOverdue()) {
    return {
      type: 'danger',
      text: '已过期'
    }
  } else {
    return {
      type: 'warning',
      text: '未提交'
    }
  }
}

// 文件相关方法
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileTypeClass = (type) => {
  if (type?.includes('image')) return 'file-image'
  if (type?.includes('video')) return 'file-video'
  if (type?.includes('audio')) return 'file-audio'
  if (type?.includes('pdf')) return 'file-pdf'
  if (type?.includes('word')) return 'file-word'
  if (type?.includes('excel')) return 'file-excel'
  if (type?.includes('zip') || type?.includes('rar')) return 'file-archive'
  return 'file-default'
}

const getFileIcon = (type) => {
  if (type?.includes('image')) return 'Picture'
  if (type?.includes('video')) return 'VideoPlay'
  if (type?.includes('audio')) return 'Headphones'
  if (type?.includes('pdf')) return 'Document'
  if (type?.includes('word')) return 'Document'
  if (type?.includes('excel')) return 'Grid'
  if (type?.includes('zip') || type?.includes('rar')) return 'Box'
  return 'Document'
}

const downloadFile = (file) => {
  ElMessage.success(`开始下载 ${file.name}`)
  // 实现文件下载逻辑
}

const downloadAllFiles = () => {
  if (currentViewingSubmission.value?.files) {
    ElMessage.success('开始下载全部文件')
    // 实现批量下载逻辑
  }
}

const downloadSubmission = () => {
  if (mySubmission.value) {
    ElMessage.success('开始下载我的提交')
    // 实现下载逻辑
  }
}

const previewFile = (file) => {
  currentPreviewFile.value = file
  previewDialogVisible.value = true
  // 这里可以实现文件预览逻辑
}

// 评分相关方法
const submitGrading = async () => {
  try {
    // 模拟提交评分
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('评分提交成功')
    submissionDialogVisible.value = false
  } catch (error) {
    ElMessage.error('评分提交失败')
  }
}

const resetGrading = () => {
  gradingForm.value = {
    score: 0,
    feedback: ''
  }
}

// 调试方法
const toggleDebugTools = () => {
  showDebugTools.value = !showDebugTools.value
}

const setDebugMode = (mode) => {
  currentDebugMode.value = mode
  // 重新加载数据
  fetchTaskDetail()
  ElMessage.success(`已切换到调试模式: ${mode}`)
}
</script>

<style scoped>
/* 调试工具栏 */
.debug-toolbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #5a67d8;
}

.debug-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.debug-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.debug-info {
  font-size: 12px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.debug-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.task-detail-view {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
}

.breadcrumb-container {
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.task-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* 任务头部 */
.task-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.task-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.task-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.priority-tag,
.status-tag {
  font-weight: 600;
}

.task-header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 信息卡片网格 */
.task-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #4a5568;
}

.header-icon {
  font-size: 18px;
  color: #667eea;
}

/* 为不同类型的卡片添加不同的图标颜色 */
.info-card:first-child .header-icon {
  color: #ed8936; /* 时间信息 - 橙色 */
}

.info-card:last-child .header-icon {
  color: #38a169; /* 提交统计 - 绿色 */
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f7fafc;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-weight: 600;
  color: #2d3748;
}

.info-value.deadline {
  color: #e53e3e;
}

.info-value.submitted {
  color: #38a169;
}

.info-value.not-submitted {
  color: #e53e3e;
}

.info-value.completion-rate {
  color: #667eea;
}

.info-value.overdue {
  color: #e53e3e;
  font-weight: 700;
}

.info-value.urgent {
  color: #ed8936;
  font-weight: 700;
}

.info-value.warning {
  color: #ecc94b;
  font-weight: 600;
}

.info-value.normal {
  color: #38a169;
}

/* 内容卡片 */
.content-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
}

.content-card .card-header .header-icon {
  color: #667eea;
}

.description-content {
  line-height: 1.8;
  color: #4a5568;
  font-size: 16px;
  white-space: pre-wrap;
  padding: 8px 0;
  min-height: 80px;
}

/* 提交管理 */
.submission-management,
.student-submission {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.submission-status-tag {
  margin-left: auto;
}

.submission-status {
  padding: 20px 0;
}

.submission-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.status-icon {
  font-size: 48px;
}

.status-icon.success {
  color: #52c41a;
}

.status-icon.warning {
  color: #faad14;
}

.status-icon.danger {
  color: #ff4d4f;
}

.status-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.status-desc {
  color: #666;
  margin: 4px 0;
}

.late-warning {
  color: #fa8c16;
  font-weight: 500;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.overdue-time {
  color: #ff4d4f;
  font-weight: 600;
}

.time-reminder {
  font-weight: 600;
}

.urgent-reminder {
  color: #ff4d4f;
  animation: pulse 2s infinite;
}

.warning-reminder {
  color: #fa8c16;
}

.normal-reminder {
  color: #52c41a;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.submission-content {
  margin: 24px 0;
}

.submission-content h4 {
  margin: 16px 0 12px 0;
  color: #333;
  font-size: 16px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.file-icon {
  font-size: 20px;
  color: #666;
}

.file-name {
  flex: 1;
  font-weight: 500;
}

.file-size {
  color: #999;
  font-size: 12px;
  min-width: 60px;
}

.file-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.file-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.file-actions .el-button .el-icon {
  margin-right: 2px;
}

.text-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  white-space: pre-wrap;
  line-height: 1.6;
}

.upload-area {
  margin: 24px 0;
}

.submission-upload {
  margin-bottom: 16px;
}

.submission-textarea {
  margin-top: 16px;
}

.submission-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.submission-actions .el-button {
  min-width: 120px;
}

.overdue-status,
.pending-status {
  text-align: center;
  padding: 20px;
}

/* 弹窗样式 */
.submission-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.submission-info-header {
  margin-bottom: 20px;
}

.student-info-large {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-details-large h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.submission-meta {
  color: #666;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.late-tag {
  margin-left: 8px;
}

.submission-content-detail {
  padding: 0;
}

.files-section,
.text-section,
.grading-section {
  margin-bottom: 32px;
}

.files-section h4,
.text-section h4,
.grading-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.file-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.file-card:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.file-preview {
  text-align: center;
  margin-bottom: 12px;
}

.file-type-icon {
  font-size: 32px;
  color: #666;
}

.file-info .file-name {
  font-weight: 500;
  margin-bottom: 4px;
  word-break: break-all;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.file-actions {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.content-display {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  white-space: pre-wrap;
  line-height: 1.6;
  min-height: 100px;
}

.grading-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

/* 文件预览 */
.file-preview-container {
  text-align: center;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-preview {
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.unsupported-preview {
  padding: 40px;
}

.large-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 16px;
}

.dialog-footer {
  text-align: right;
}

.submission-tabs {
  margin-top: 16px;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.student-item:hover {
  background: #edf2f7;
}

.submitted-item {
  border-left: 4px solid #38a169;
}

.not-submitted-item {
  border-left: 4px solid #e53e3e;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name {
  font-weight: 600;
  color: #2d3748;
}

.submission-time {
  font-size: 14px;
  color: #718096;
}

.not-submitted-text {
  font-size: 14px;
  color: #e53e3e;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .task-info-grid {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .task-detail-view {
    padding: 16px;
  }
  
  .task-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .task-title {
    font-size: 24px;
  }
  
  .task-header-right {
    justify-content: flex-end;
  }
  
  .task-info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .student-item {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .student-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .task-detail-view {
    padding: 12px;
  }
  
  .breadcrumb-container {
    padding: 12px 16px;
  }
  
  .task-header {
    padding: 20px;
  }
  
  .task-title {
    font-size: 20px;
  }
}
</style>
