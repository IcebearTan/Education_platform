<template>
  <div class="task-detail">
    <!-- 返回按钮 -->
    <div class="header-actions">
      <el-button 
        type="text" 
        @click="goBack"
        :icon="ArrowLeft"
        style="margin-bottom: 16px;"
      >
        返回任务列表
      </el-button>
    </div>

    <!-- 任务信息卡片 -->
    <div class="task-info-card">
      <div class="task-header">
        <div class="task-title-section">
          <span v-if="taskDetail._priority" class="priority-tag" :class="'priority-' + taskDetail._priority">
            {{ taskDetail._priority }}
          </span>
          <h2 class="task-title">{{ taskDetail.title || '任务标题' }}</h2>
        </div>
        <div v-if="userRole === 'teacher'" class="task-actions">
          <el-button type="primary" size="small" @click="editTask" plain>
            编辑任务
          </el-button>
          <el-button type="danger" size="small" @click="deleteTask" plain>
            删除任务
          </el-button>
        </div>
      </div>

      <div class="task-meta">
        <div class="meta-item">
          <el-icon><Calendar /></el-icon>
          <span>创建时间：{{ formatDateTime(taskDetail.create_time) }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Clock /></el-icon>
          <span>截止时间：{{ formatDateTime(taskDetail.end_time) }}</span>
        </div>
      </div>

      <div class="task-content">
        <h3>任务描述</h3>
        <p>{{ taskDetail.content || '暂无任务描述' }}</p>
      </div>
    </div>

    <!-- 提交记录管理区域 -->
    <div class="submission-section">
      <!-- 老师视图：提交记录管理 -->
      <div v-if="userRole === 'teacher'" class="teacher-view">
        <div class="section-header">
          <h3>提交记录管理</h3>
          <div class="submission-stats">
            <el-tag type="info" size="large">
              {{ homeworkStats.total }}人已提交
            </el-tag>
            <el-tag type="success" size="large" style="margin-left: 8px;">
              {{ homeworkStats.graded }}人已批改
            </el-tag>
            <el-tag type="warning" size="large" style="margin-left: 8px;">
              {{ homeworkStats.ungraded }}人待批改
            </el-tag>
          </div>
        </div>
                
        <!-- 新增：学生提交统计信息 -->
        <div v-if="taskDetail.submitted_students || taskDetail.not_submitted_students" class="student-submission-stats">
          <div class="stats-section">
            <div class="stats-item">
              <h4 class="stats-title">已提交学生 ({{ taskDetail.submitted_students?.length || 0 }}人)</h4>
              <div v-if="taskDetail.submitted_students?.length > 0" class="student-tags">
                <el-tag 
                  v-for="student in taskDetail.submitted_students" 
                  :key="student.id" 
                  type="success" 
                  size="small"
                  style="margin: 2px 4px 2px 0;"
                >
                  {{ student.name }}
                </el-tag>
              </div>
              <div v-else class="empty-hint">暂无学生提交</div>
            </div>
            
            <div class="stats-item">
              <h4 class="stats-title">未提交学生 ({{ taskDetail.not_submitted_students?.length || 0 }}人)</h4>
              <div v-if="taskDetail.not_submitted_students?.length > 0" class="student-tags">
                <el-tag 
                  v-for="student in taskDetail.not_submitted_students" 
                  :key="student.id" 
                  type="danger" 
                  size="small"
                  style="margin: 2px 4px 2px 0;"
                >
                  {{ student.name }}
                </el-tag>
              </div>
              <div v-else class="empty-hint">所有学生已提交</div>
            </div>
            
            <!-- <div v-if="taskDetail.group_name" class="stats-item">
              <h4 class="stats-title">所属小组</h4>
              <el-tag type="info" size="medium">{{ taskDetail.group_name }}</el-tag>
            </div> -->
          </div>
        </div>
        
        <div v-if="submissions.length === 0" class="empty-state">
          <el-empty description="暂无学生提交" :image-size="100" />
        </div>
        
        <div v-else class="submissions-list">
          <div v-for="submission in submissions" :key="submission.id" class="submission-card">
            <div class="submission-header">
              <div class="student-info">
                <!-- <el-avatar :size="32" :src="submission.avatar" style="margin-right: 12px;">
                  {{ submission.student_name?.charAt(0) }}
                </el-avatar> -->
                <div>
                  <h4>{{ submission.student_name }} 的提交</h4>
                  <!-- <span class="student-id">id：{{ submission.student_id }}</span> -->
                </div>
              </div>
              <div class="submission-actions">
                <el-button type="primary" size="small" @click="reviewSubmission(submission)">
                  批改
                </el-button>
                <el-button type="danger" size="small" @click="deleteSubmission(submission)" plain>
                  删除
                </el-button>
              </div>
            </div>
            
            <div class="submission-content">
              <div class="submission-text">
                <p>{{ submission.content || '学生未填写文字内容' }}</p>
              </div>
              
              <div v-if="submission.files && submission.files.length > 0" class="submission-files">
                <h5>附件文件：</h5>
                <div class="file-list">
                  <div v-for="(file, index) in submission.files" :key="index" class="file-item">
                    <el-icon><Document /></el-icon>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">({{ file.size_readable }})</span>
                    <el-button type="text" size="small" @click="downloadFile(file, submission)">下载</el-button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="submission-meta">
              <div class="meta-info">
                <span>提交时间：{{ formatDateTime(submission.submit_time) }}</span>
                <span v-if="submission.score !== null" class="score">
                  分数：{{ submission.score }}/100
                </span>
                <el-tag v-else type="warning" size="small">待批改</el-tag>
              </div>
              <div v-if="submission.teacher_comment" class="teacher-comment">
                <span>批改意见：{{ submission.teacher_comment }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学生视图：提交作业 -->
      <div v-else class="student-view">
        <div class="section-header">
          <h3>作业提交</h3>
          <div class="submission-status">
            <el-tag v-if="mySubmission" type="success">已提交</el-tag>
            <el-tag v-else-if="isOverdue(taskDetail.end_time)" type="danger">已逾期</el-tag>
            <el-tag v-else type="warning">未提交</el-tag>
          </div>
        </div>
        
        <div v-if="mySubmission" class="my-submission-card">
          <div class="submission-info">
            <h4>我的提交</h4>
            <div class="submission-content">
              <p>{{ mySubmission.content || '未填写文字内容' }}</p>
              <div v-if="mySubmission.files && mySubmission.files.length > 0" class="submission-files">
                <h5>已提交文件：</h5>
                <div class="file-list">
                  <div v-for="(file, index) in mySubmission.files" :key="index" class="file-item">
                    <el-icon><Document /></el-icon>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">({{ file.size_readable }})</span>
                    <el-button type="text" size="small" @click="downloadFile(file, mySubmission)">下载</el-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="submission-meta">
              <div class="meta-info">
                <span>提交时间：{{ formatDateTime(mySubmission.submit_time) }}</span>
                <span v-if="mySubmission.score !== null" class="score">
                  分数：{{ mySubmission.score }}/100
                </span>
                <el-tag v-else type="warning" size="small">待批改</el-tag>
              </div>
            </div>
            <div v-if="mySubmission.teacher_comment" class="teacher-comment">
              <h5>批改意见：</h5>
              <p>{{ mySubmission.teacher_comment }}</p>
            </div>
          </div>
          
          <div v-if="!isOverdue(taskDetail.end_time)" class="resubmit-actions">
            <el-button type="primary" @click="showSubmissionDialog">重新提交</el-button>
          </div>
        </div>
        
        <div v-else-if="!isOverdue(taskDetail.end_time)" class="submit-area">
          <el-button type="primary" size="large" @click="showSubmissionDialog">
            提交作业
          </el-button>
        </div>
        
        <div v-else class="overdue-notice">
          <el-alert title="作业已逾期，无法提交" type="error" :closable="false" />
        </div>
      </div>
    </div>

    <!-- 批改弹窗 -->
    <el-dialog 
      v-model="reviewDialogVisible" 
      title="批改作业"
      width="600px"
      :lock-scroll="false"
    >
      <div v-if="currentReviewSubmission" class="review-content">
        <div class="student-info-header">
          <h4>学生：{{ currentReviewSubmission.student_name }} ({{ currentReviewSubmission.student_id }})</h4>
        </div>
        
        <div class="submission-detail">
          <h5>提交内容：</h5>
          <p>{{ currentReviewSubmission.content || '学生未填写文字内容' }}</p>            <div v-if="currentReviewSubmission.files && currentReviewSubmission.files.length > 0">
              <h5>提交文件：</h5>
              <div class="file-list">
                <div v-for="(file, index) in currentReviewSubmission.files" :key="index" class="file-item">
                  <el-icon><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">({{ file.size_readable }})</span>
                  <el-button type="text" size="small" @click="downloadFile(file, currentReviewSubmission)">下载</el-button>
                </div>
              </div>
            </div>
        </div>
        
        <el-form ref="reviewFormRef" :model="reviewForm" :rules="reviewRules" label-width="80px">
          <el-form-item label="分数" prop="score">
            <el-input-number 
              v-model="reviewForm.score" 
              :min="0" 
              :max="100" 
              placeholder="请输入分数"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="批改意见" prop="comment">
            <el-input 
              v-model="reviewForm.comment" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入批改意见"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveReview" :loading="saveLoading">
          保存批改
        </el-button>
      </template>
    </el-dialog>

    <!-- 学生提交弹窗 -->
    <el-dialog 
      v-model="submissionDialogVisible" 
      :title="mySubmission ? '修改作业' : '提交作业'"
      width="500px"
      :lock-scroll="false"
    >
      <el-form ref="submissionFormRef" :model="submissionForm" :rules="submissionRules" label-width="80px">
        <el-form-item label="作业内容" prop="content">
          <el-input 
            v-model="submissionForm.content" 
            type="textarea" 
            :rows="6" 
            placeholder="请输入作业内容或说明"
          />
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            v-model:file-list="submissionForm.files"
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传1个文件，大小不超过20MB，支持doc、pdf、zip等格式
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="submissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSubmission" :loading="saveLoading">
          {{ mySubmission ? '保存修改' : '提交作业' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务弹窗 -->
    <el-dialog :title="'修改任务'" :lock-scroll="false" v-model="taskEditDialogVisible" width="40%">
      <div class="task-form">
        <el-form :model="taskEditForm" :validate-on-rule-change="false" ref="taskEditFormRef" :rules="{
          title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
          content: [{ required: true, message: '请输入任务内容', trigger: 'blur' }],
          deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
        }" label-width="100px">
          <el-form-item label="任务标题" prop="title">
            <el-input v-model="taskEditForm.title" name="title"></el-input>
          </el-form-item>
          <el-form-item label="任务内容" prop="content">
            <el-input type="textarea" v-model="taskEditForm.content" :rows="4" name="content"></el-input>
          </el-form-item>
          <el-form-item label="截止时间" prop="deadline">
            <el-date-picker v-model="taskEditForm.deadline" type="datetime" placeholder="选择截止时间" :disabled-date="disabledDate" name="deadline"></el-date-picker>
          </el-form-item>
          <el-form-item label="任务优先级" prop="priority">
            <el-select v-model="taskEditForm.priority" placeholder="选择任务优先级">
              <el-option label="紧急" value="urgent"></el-option>
              <el-option label="高" value="high"></el-option>
              <el-option label="中" value="normal"></el-option>
              <el-option label="低" value="low"></el-option>
              <el-option label="不重要" value="unimportant"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="taskEditDialogVisible = false" :disabled="editLoading">取 消</el-button>
          <el-button type="primary" @click="submitEditTask" :loading="editLoading" :disabled="editLoading">保存修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Calendar, Clock, Document } from '@element-plus/icons-vue'
import api from '../../api'

const props = defineProps({
  taskId: {
    type: [Number, String],
    required: true
  },
  userRole: {
    type: String,
    default: 'student' // 'teacher' or 'student'
  },
  groupId: {
    type: [Number, String],
    required: true
  },
  taskDetail: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['back', 'taskUpdated'])

// 任务详情数据
const taskDetail = ref({})
const submissions = ref([])
const mySubmission = ref(null)
const loading = ref(true)
const homeworkStats = ref({
  total: 0,
  graded: 0,
  ungraded: 0
})

// 批改相关
const reviewDialogVisible = ref(false)
const currentReviewSubmission = ref(null)
const reviewFormRef = ref(null)
const reviewForm = ref({
  score: null,
  comment: ''
})
const reviewRules = {
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
  comment: [{ required: true, message: '请输入批改意见', trigger: 'blur' }]
}

// 学生提交相关
const submissionDialogVisible = ref(false)
const submissionFormRef = ref(null)
const submissionForm = ref({
  content: '',
  files: []
})
const submissionRules = {
  content: [{ required: true, message: '请输入作业内容', trigger: 'blur' }]
}

// 任务编辑弹窗相关
const taskEditDialogVisible = ref(false)
const taskEditForm = ref({
  title: '',
  content: '',
  deadline: '',
  priority: 'normal'
})
const taskEditFormRef = ref(null)
const editLoading = ref(false)
const editTaskId = ref(null)

const saveLoading = ref(false)

// 截止时间不能早于当前时间（包括具体时间）
const disabledDate = (date) => {
  return date.getTime() < Date.now() // 禁止早于当前时间
}

function mapPriority(val) {
  switch(val) {
    case 'urgent': return 1;
    case 'high': return 2;
    case 'normal': return 3;
    case 'low': return 4;
    case 'unimportant': return 5;
    default: return 2;
  }
}

async function submitEditTask() {
  if (editLoading.value) return
  if (!taskEditFormRef.value) return
  await taskEditFormRef.value.validate(async (valid) => {
    if (!valid) return
    editLoading.value = true
    try {
      const payload = {
        Title: taskEditForm.value.title,
        Content: taskEditForm.value.content,
        End_Time: formatDateTimeForAPI(taskEditForm.value.deadline),
        Priority: mapPriority(taskEditForm.value.priority),
        Id: editTaskId.value,
        Group_Id: props.groupId
      }
      await api({
        url: '/information/task/add',
        method: 'post',
        data: payload
      })
      ElMessage.success('任务修改成功！')
      taskEditDialogVisible.value = false
      // 通知父组件任务已更新，让父组件重新获取数据
      emit('taskUpdated')
      
      // 立即更新本地显示的任务详情，避免不必要的服务器请求
      taskDetail.value = {
        ...taskDetail.value,
        title: taskEditForm.value.title,
        content: taskEditForm.value.content,
        end_time: formatDateTimeForAPI(taskEditForm.value.deadline),
        _priority: (() => {
          switch (taskEditForm.value.priority) {
            case 'urgent': return '紧急';
            case 'high': return '高';
            case 'normal': return '中';
            case 'low': return '低';
            case 'unimportant': return '不重要';
            default: return '中';
          }
        })()
      }
      
      // 提交记录通常不会因为任务修改而改变，所以不需要重新获取
    } catch (e) {
      ElMessage.error('任务修改失败，请重试')
    } finally {
      editLoading.value = false
    }
  })
}

// 获取任务详情
const fetchTaskDetail = async (forceFromServer = false) => {
  try {
    // 如果强制从服务器获取，或者没有传递任务详情，则调用接口获取
    if (forceFromServer || !props.taskDetail || Object.keys(props.taskDetail).length === 0) {
      // 调用真实的任务详情接口
      const response = await api.get('/information/task/query', {
        params: {
          task_id: parseInt(props.taskId)
        }
      })
      
      if (response.data.code === 200) {
        const taskData = response.data.data
        // 假设接口返回的数据结构，根据实际情况调整
        taskDetail.value = {
          id: taskData.id || props.taskId,
          title: taskData.title || '任务标题',
          content: taskData.content || '暂无任务描述',
          create_time: taskData.create_time || '',
          end_time: taskData.end_time || '',
          _priority: taskData._priority || taskData.priority_text || '中',
          group_id: taskData.group_id || props.groupId,
          group_name: taskData.group_name || '',
          submitted_students: taskData.submitted_students || [],
          not_submitted_students: taskData.not_submitted_students || []
        }
      } else {
        ElMessage.error(response.data.message || '获取任务详情失败')
      }
      return
    }
    
    // 否则使用传递的任务详情（首次加载时）
    taskDetail.value = {
      id: props.taskDetail.id || props.taskId,
      title: props.taskDetail.title || '任务标题',
      content: props.taskDetail.content || '暂无任务描述',
      create_time: props.taskDetail.create_time || '',
      end_time: props.taskDetail.end_time || '',
      _priority: props.taskDetail._priority || '中',
      group_id: props.taskDetail.group_id || props.groupId,
      group_name: props.taskDetail.group_name || '',
      submitted_students: props.taskDetail.submitted_students || [],
      not_submitted_students: props.taskDetail.not_submitted_students || []
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  }
}

// 获取提交记录
const fetchSubmissions = async () => {
  try {
    // 调用真实的作业查询接口
    const response = await api.get('/information/homework/query', {
      params: {
        task_id: parseInt(props.taskId)
      }
    })
    
    if (response.data.code === 200) {
      const homeworkData = response.data.data
      
      // 更新统计信息
      homeworkStats.value = {
        total: homeworkData.all.length,
        graded: homeworkData.graded.length,
        ungraded: homeworkData.ungraded.length
      }
      
      if (props.userRole === 'teacher') {
        // 老师视图：显示所有学生的提交记录，分数显示逻辑根据 graded/ungraded
        submissions.value = homeworkData.all.map(item => {
          const isGraded = homeworkData.graded.some(g => g.id === item.id)
          return {
            id: item.id,
            student_name: item.student_name,
            student_id: item.student_id,
            content: item.content,
            submit_time: item.create_time,
            score: isGraded ? item.score : null,
            teacher_comment: item.teacher_comment || null,
            files: item.files || []
          }
        })
      } else {
        // 学生视图：只显示自己的提交，分数显示逻辑根据 graded/ungraded
        const myHomework = homeworkData.all.find(item => item.student_id === getCurrentUserId())
        if (myHomework) {
          const isGraded = homeworkData.graded.some(g => g.id === myHomework.id)
          mySubmission.value = {
            id: myHomework.id,
            content: myHomework.content,
            submit_time: myHomework.create_time,
            score: isGraded ? myHomework.score : null,
            teacher_comment: myHomework.teacher_comment || null,
            files: myHomework.files || []
          }
        } else {
          mySubmission.value = null
        }
      }
    } else {
      ElMessage.error(response.data.message || '获取提交记录失败')
    }
  } catch (error) {
    console.error('获取提交记录失败:', error)
    ElMessage.error('获取提交记录失败')
  }
}

// 获取当前用户ID（这里需要根据您的用户系统实现）
const getCurrentUserId = () => {
  // TODO: 实现获取当前用户ID的逻辑
  // 可能从store、localStorage或其他地方获取
  return 11 // 临时返回示例用户ID
}

// 批改作业
const reviewSubmission = (submission) => {
  currentReviewSubmission.value = submission
  reviewForm.value = {
    score: submission.score,
    comment: submission.teacher_comment || ''
  }
  reviewDialogVisible.value = true
}

// 保存批改
const saveReview = async () => {
  if (!reviewFormRef.value) return
  
  await reviewFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    saveLoading.value = true
    try {
      // 使用完整的批改接口，传递id、status、comment和score
      const response = await api.post('/information/homework/grade', {
        id: currentReviewSubmission.value.id,
        status: true,  // 布尔型，批改设置为true
        comment: reviewForm.value.comment || '',  // 批改意见
        score: reviewForm.value.score?.toString() || '0'  // 分数转为字符串
      })
      
      if (response.data.code === 200) {
        ElMessage.success('批改完成')
        reviewDialogVisible.value = false
        fetchSubmissions() // 重新获取提交记录
      } else {
        ElMessage.error(response.data.message || '批改失败')
      }
    } catch (error) {
      console.error('批改失败:', error)
      ElMessage.error('批改失败')
    } finally {
      saveLoading.value = false
    }
  })
}

// 删除提交记录
const deleteSubmission = (submission) => {
  ElMessageBox.confirm(`确定要删除 ${submission.student_name} 的提交记录吗？`, '确认删除', {
    type: 'warning'
  }).then(async () => {
    try {
      const response = await api.post('/information/homework/delete', {
        id: submission.id
      })
      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        fetchSubmissions()
      } else {
        ElMessage.error(response.data.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 下载文件，直接用父级提交记录 id（submission.id 或 mySubmission.id）
const downloadFile = (file, parentSubmission) => {
  // parentSubmission 为当前文件所属的提交记录对象
  // id 就是作业提交记录的 int 型 id
  const homeworkId = parentSubmission?.id
  if (!homeworkId) {
    ElMessage.error('无法获取提交记录ID，无法下载')
    return
  }
  const url = `/information/homework/download?id=${homeworkId}`
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('文件下载已开始')
}

// 显示提交弹窗
const showSubmissionDialog = () => {
  submissionForm.value = {
    content: mySubmission.value?.content || '',
    files: []
  }
  submissionDialogVisible.value = true
}

// 保存学生提交
const saveSubmission = async () => {
  if (!submissionFormRef.value) return
  
  await submissionFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 检查文件大小（20MB限制）
    const totalSize = submissionForm.value.files.reduce((sum, file) => sum + (file.raw?.size || 0), 0)
    const maxSize = 20 * 1024 * 1024 // 20MB
    
    if (totalSize > maxSize) {
      ElMessage.error('文件大小不能超过20MB')
      return
    }
    
    saveLoading.value = true
    try {
      const formData = new FormData()
      formData.append('title', '作业提交') // 统一设置标题
      formData.append('content', submissionForm.value.content)
      
      // 添加文件
      submissionForm.value.files.forEach(file => {
        if (file.raw) {
          formData.append('files', file.raw)
        }
      })
      
      let response
      if (mySubmission.value) {
        // 修改提交：使用update接口，传递homework_id
        formData.append('homework_id', mySubmission.value.id)
        response = await api.post('/information/homework/update', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        // 新提交：使用add接口，传递task_id
        formData.append('task_id', parseInt(props.taskId))
        response = await api.post('/information/homework/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }
      
      if (response.data.code === 200) {
        ElMessage.success(mySubmission.value ? '修改成功' : '提交成功')
        submissionDialogVisible.value = false
        fetchSubmissions() // 重新获取提交记录
      } else {
        ElMessage.error(response.data.message || (mySubmission.value ? '修改失败' : '提交失败'))
      }
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error(mySubmission.value ? '修改失败' : '提交失败')
    } finally {
      saveLoading.value = false
    }
  })
}

// 文件上传限制处理
const handleExceed = () => {
  ElMessage.warning('只能上传1个文件')
}

// 文件上传前检查
const beforeUpload = (file) => {
  // 检查文件大小（20MB限制）
  const maxFileSize = 20 * 1024 * 1024 // 20MB
  if (file.size > maxFileSize) {
    ElMessage.error('文件大小不能超过20MB')
    return false
  }
  
  return true
}

// 格式化时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化时间为后端需要的格式
const formatDateTimeForAPI = (val) => {
  if (!val) return '';
  const d = new Date(val);
  const pad = n => n < 10 ? '0' + n : n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 判断是否逾期
const isOverdue = (deadline) => {
  return new Date() > new Date(deadline)
}

// 返回按钮
const goBack = () => {
  emit('back')
}

// 编辑任务
const editTask = () => {
  // 传入当前任务详情
  taskEditForm.value = {
    title: taskDetail.value.title,
    content: taskDetail.value.content,
    deadline: taskDetail.value.end_time ? new Date(taskDetail.value.end_time) : '',
    priority: (() => {
      switch (taskDetail.value._priority) {
        case '紧急': return 'urgent';
        case '高': return 'high';
        case '中': return 'normal';
        case '低': return 'low';
        case '不重要': return 'unimportant';
        default: return 'normal';
      }
    })()
  }
  editTaskId.value = taskDetail.value.id
  taskEditDialogVisible.value = true
}

// 删除任务
const deleteTask = () => {
  // 统一弹窗风格
  ElMessageBox.confirm(
    `确定要删除任务 "${taskDetail.value.title}" 吗？\n此操作不可撤销`,
    '删除任务',
    {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true
    }
  ).then(async () => {
    try {
      await api({
        url: '/information/task/delete',
        method: 'post',
        data: { id: taskDetail.value.id }
      })
      ElMessage.success('任务删除成功！')
      goBack()
    } catch (e) {
      ElMessage.error('任务删除失败，请重试')
    }
  }).catch(() => {})
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchTaskDetail(),
    fetchSubmissions()
  ])
  loading.value = false
})
</script>

<style scoped>
.task-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
}

.task-info-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 24px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.task-title-section {
  flex: 1;
}

.task-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 8px 0;
}

.priority-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  color: #fff;
  margin-bottom: 8px;
}
.priority-tag.priority-紧急 { background: #e74c3c; }
.priority-tag.priority-高 { background: #f39c12; }
.priority-tag.priority-中 { background: #3498db; }
.priority-tag.priority-低 { background: #27ae60; }
.priority-tag.priority-不重要 { background: #7f8c8d; }

.task-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.task-content h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 12px;
}

.task-content p {
  color: #b0b3bb;
  line-height: 1.7;
  margin: 0;
  max-width: 680px;
  word-break: break-all;
  white-space: pre-line;
}

.submission-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 20px;
  color: #303133;
  margin: 0;
}

/* 学生提交统计样式 */
.student-submission-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-section .stats-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-title {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  margin: 0;
}

.student-tags {
  line-height: 1.8;
}

.empty-hint {
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.submission-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: #c0c4cc;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.student-info {
  display: flex;
  align-items: center;
}

.student-info h4 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 4px 0;
}

.student-id {
  font-size: 14px;
  color: #909399;
}

.submission-actions {
  display: flex;
  gap: 8px;
}

.submission-content {
  margin-bottom: 12px;
}

.submission-text p {
  color: #606266;
  line-height: 1.5;
  margin: 0;
  font-size: 14px;
}

.submission-files {
  margin-top: 12px;
}

.submission-files h5 {
  font-size: 14px;
  color: #303133;
  margin: 0 0 8px 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #f5f7fa;
}

.file-item .el-icon {
  color: #409eff;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.file-size {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.submission-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #909399;

  margin-bottom: 10px;
}

.score {
  font-weight: 600;
  color: #67c23a;
}

.teacher-comment {
  font-size: 14px;
  color: #606266;
  font-style: italic;
}

.student-view .my-submission-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.submission-info h4 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 12px 0;
}

.resubmit-actions {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.submit-area {
  text-align: center;
  padding: 40px 0;
}

.overdue-notice {
  text-align: center;
  padding: 20px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.task-form {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 20px;
}

.el-button.is-loading {
  pointer-events: none;
  opacity: 0.7;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .task-detail {
    padding: 16px;
  }
  
  .task-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .submission-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .submission-actions {
    width: 100%;
  }
  
  .meta-info {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .stats-section {
    gap: 12px;
  }
  
  .student-tags {
    line-height: 1.6;
  }
}
</style>
