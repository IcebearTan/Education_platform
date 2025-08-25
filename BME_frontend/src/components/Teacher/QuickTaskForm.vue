<template>
  <div class="quick-task-form">
    <el-form :model="taskForm" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="任务标题" prop="title">
        <el-input
          v-model="taskForm.title"
          placeholder="请输入任务标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- <el-form-item label="任务类型" prop="type">
        <el-select v-model="taskForm.type" placeholder="选择任务类型" style="width: 100%">
          <el-option
            v-for="type in taskTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          >
            <span style="float: left">{{ type.label }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ type.desc }}</span>
          </el-option>
        </el-select>
      </el-form-item> -->

      <el-form-item label="任务描述" prop="description">
        <el-input
          v-model="taskForm.description"
          type="textarea"
          :rows="4"
          placeholder="请详细描述任务要求和内容"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="截止时间" prop="deadline">
        <el-date-picker
          v-model="taskForm.deadline"
          type="datetime"
          placeholder="选择截止时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
          :disabled-date="disabledDate"
        />
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <el-radio-group v-model="taskForm.priority">
          <el-radio label="low">
            <el-tag type="info" size="small">低</el-tag>
          </el-radio>
          <el-radio label="medium">
            <el-tag type="warning" size="small">中</el-tag>
          </el-radio>
          <el-radio label="high">
            <el-tag type="danger" size="small">高</el-tag>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- <el-form-item label="分值设置">
        <el-input-number
          v-model="taskForm.points"
          :min="0"
          :max="100"
          :step="5"
          style="width: 150px"
        />
        <span style="margin-left: 8px; color: #909399;">分</span>
      </el-form-item>

      <el-form-item label="提交方式" prop="submissionTypes">
        <el-checkbox-group v-model="taskForm.submissionTypes">
          <el-checkbox label="text">文本提交</el-checkbox>
          <el-checkbox label="file">文件上传</el-checkbox>
          <el-checkbox label="link">链接提交</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="附加设置">
        <div class="additional-settings">
          <el-checkbox v-model="taskForm.allowLateSubmission">
            允许逾期提交
          </el-checkbox>
          <el-checkbox v-model="taskForm.requireApproval">
            需要审核批准
          </el-checkbox>
          <el-checkbox v-model="taskForm.notifyStudents">
            立即通知学生
          </el-checkbox>
        </div>
      </el-form-item> -->

      <el-form-item label="参考资料">
        <el-upload
          v-model:file-list="taskForm.attachments"
          action="#"
          :auto-upload="false"
          multiple
          :limit="5"
          :before-upload="beforeUpload"
        >
          <el-button>
            <el-icon><Upload /></el-icon>
            上传文件
          </el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持常见文档格式，单个文件不超过10MB，最多5个文件
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <!-- 预览区域 -->
      <!-- <el-form-item label="任务预览">
        <div class="task-preview">
          <div class="preview-header">
            <h4>{{ taskForm.title || '任务标题' }}</h4>
            <div class="preview-meta">
              <el-tag :type="getPriorityType(taskForm.priority)" size="small">
                {{ getPriorityText(taskForm.priority) }}
              </el-tag>
              <span v-if="taskForm.points" class="points">{{ taskForm.points }}分</span>
            </div>
          </div>
          <div class="preview-content">
            <p>{{ taskForm.description || '任务描述将在这里显示...' }}</p>
            <div v-if="taskForm.deadline" class="deadline">
              <el-icon><Clock /></el-icon>
              截止时间：{{ formatDeadline(taskForm.deadline) }}
            </div>
          </div>
        </div>
      </el-form-item> -->
    </el-form>

    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
      <el-button type="primary" @click="publishTask" :loading="publishing">
        立即发布
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Clock } from '@element-plus/icons-vue'

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['task-created', 'cancel'])

// 响应式数据
const formRef = ref()
const saving = ref(false)
const publishing = ref(false)

// 任务表单
const taskForm = reactive({
  title: '',
  type: '',
  description: '',
  deadline: '',
  priority: 'medium',
  points: 10,
  submissionTypes: ['text'],
  allowLateSubmission: false,
  requireApproval: false,
  notifyStudents: true,
  attachments: []
})

// 任务类型配置
const taskTypes = [
  { value: 'homework', label: '作业', desc: '课后练习和习题' },
  { value: 'project', label: '项目', desc: '长期项目任务' },
  { value: 'experiment', label: '实验', desc: '实验报告和记录' },
  { value: 'test', label: '测试', desc: '测验和考试' },
  { value: 'presentation', label: '展示', desc: '演讲和汇报' },
  { value: 'discussion', label: '讨论', desc: '话题讨论' }
]

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度在 10 到 1000 个字符', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ],
  submissionTypes: [
    { 
      type: 'array',
      required: true, 
      message: '请选择至少一种提交方式', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请选择至少一种提交方式'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 方法
const disabledDate = (time) => {
  // 禁用过去的日期
  return time.getTime() < Date.now() - 8.64e7
}

const getPriorityType = (priority) => {
  const typeMap = {
    'low': 'info',
    'medium': 'warning',
    'high': 'danger'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const textMap = {
    'low': '低优先级',
    'medium': '中优先级',
    'high': '高优先级'
  }
  return textMap[priority] || '中优先级'
}

const formatDeadline = (deadline) => {
  if (!deadline) return ''
  return new Date(deadline).toLocaleString()
}

const beforeUpload = (file) => {
  const isValidType = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png'
  ].includes(file.type)
  
  const isLt10M = file.size / 1024 / 1024 < 10
  
  if (!isValidType) {
    ElMessage.error('上传文件只能是文档、图片格式!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

const validateForm = async () => {
  if (!formRef.value) return false
  
  try {
    await formRef.value.validate()
    
    // 额外验证提交方式
    if (taskForm.submissionTypes.length === 0) {
      ElMessage.error('请选择至少一种提交方式')
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

const saveDraft = async () => {
  if (!(await validateForm())) return
  
  saving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

const publishTask = async () => {
  if (!(await validateForm())) return
  
  publishing.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 构造任务数据
    const taskData = {
      ...taskForm,
      groupId: props.groupId,
      status: 'published',
      createdAt: new Date().toISOString()
    }
    
    ElMessage.success('任务发布成功')
    emit('task-created', taskData)
    
    // 重置表单
    resetForm()
    
  } catch (error) {
    console.error('发布任务失败:', error)
    ElMessage.error('发布任务失败')
  } finally {
    publishing.value = false
  }
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  Object.assign(taskForm, {
    title: '',
    type: '',
    description: '',
    deadline: '',
    priority: 'medium',
    points: 10,
    submissionTypes: ['text'],
    allowLateSubmission: false,
    requireApproval: false,
    notifyStudents: true,
    attachments: []
  })
}
</script>

<style scoped>
.quick-task-form {
  max-width: 100%;
}

.additional-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-preview {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.preview-header h4 {
  margin: 0;
  color: #303133;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points {
  font-size: 12px;
  color: #409EFF;
  font-weight: bold;
}

.preview-content {
  color: #606266;
  line-height: 1.6;
}

.deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  font-size: 14px;
  color: #f56c6c;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-upload__tip) {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .additional-settings {
    gap: 12px;
  }
}
</style>
