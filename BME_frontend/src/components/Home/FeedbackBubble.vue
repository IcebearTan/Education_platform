<template>
  <div>
    <!-- 反馈气泡 -->
    <div class="feedback-bubble" @click="openFeedbackDialog" @mouseover="handleMouseOver" @mouseleave="handleMouseLeave">
      {{ bubbleText }}
    </div>

    <!-- 反馈对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="问题反馈"
      width="500"
      :before-close="handleClose"
      draggable
      align-center
      :lock-scroll=false
    >
      <el-form
        ref="feedbackFormRef"
        :model="feedbackForm"
        :rules="rules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item label="问题标题" prop="title">
          <el-input
            v-model="feedbackForm.title"
            placeholder="请输入问题标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="问题描述" prop="content">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="5"
            placeholder="请详细描述您遇到的问题..."
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="相关图片">
          <el-upload
            v-model:file-list="fileList"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            list-type="picture-card"
            :limit="1"
            accept="image/*"
            :auto-upload="false"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png/gif文件，且不超过2MB，最多1张
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="submitFeedback" :loading="isSubmitting">
            提交反馈
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px" align-center :lock-scroll=false>
      <img :src="previewImageUrl" style="width: 100%; height: auto;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElUpload, ElIcon, ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../../api'

// 响应式数据
const bubbleText = ref('报个Bug')
const dialogVisible = ref(false)
const isSubmitting = ref(false)
const feedbackFormRef = ref(null)
const fileList = ref([])
const previewVisible = ref(false)
const previewImageUrl = ref('')

// 表单数据
const feedbackForm = reactive({
  title: '',
  content: ''
})

// 表单验证规则
const rules = reactive({
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2-100个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度应在10-1000个字符之间', trigger: 'blur' }
  ]
})

// 气泡悬停效果
const handleMouseOver = () => {
  bubbleText.value = '(^_^)'
}

const handleMouseLeave = () => {
  bubbleText.value = '报个Bug'
}

// 打开反馈对话框
const openFeedbackDialog = () => {
  dialogVisible.value = true
}

// 关闭对话框
const handleClose = (done) => {
  ElMessageBox.confirm('确定要关闭反馈窗口吗？未保存的内容将丢失。', '确认关闭', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    lockScroll: false
  }).then(() => {
    resetForm()
    dialogVisible.value = false
    if (typeof done === 'function') done()
  }).catch(() => {
    // 用户取消关闭
    if (typeof done === 'function') done(false)
  })
}

// 重置表单
const resetForm = () => {
  if (feedbackFormRef.value) {
    feedbackFormRef.value.resetFields()
  }
  feedbackForm.title = ''
  feedbackForm.content = ''
  fileList.value = []
}

// 图片上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 移除图片
const handleRemove = (file) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

// 预览图片
const handlePreview = (file) => {
  previewImageUrl.value = file.url || file.response?.data?.url || ''
  previewVisible.value = true
}

// 提交反馈
const submitFeedback = async () => {
  if (!feedbackFormRef.value) return

  feedbackFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请检查表单填写')
      return
    }

    isSubmitting.value = true

    try {
      // 只取第一张图片
      const imageFile = fileList.value[0]?.raw
      const formData = new FormData()
      formData.append('title', feedbackForm.title)
      formData.append('content', feedbackForm.content)
      if (imageFile) formData.append('image', imageFile)

      // 提交到后端 - 根据实际接口调整
      const response = await api({
        url: '/information/error/add',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.code === 200) {
        ElMessage.success('反馈提交成功，感谢您的反馈！')
        resetForm()
        dialogVisible.value = false
      } else {
        ElMessage.error(response.data.message || '提交失败，请重试')
      }
    } catch (error) {
      console.error('提交反馈失败:', error)
      ElMessage.error('提交失败，请检查网络后重试')
    } finally {
      isSubmitting.value = false
    }
  })
}
</script>

<style scoped>
.feedback-bubble {
  position: fixed;
  bottom: 60px;
  right: 60px;
  width: 110px;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #67C23A, #3EC6E0 40%, #85CE61 70%, #B3E5AB 90%, #4AD9C2 100%);
  background-size: 400% 400%;
  box-shadow: 0 0 20px rgba(103, 194, 58, 0.6), 0 0 40px rgba(62, 198, 224, 0.3), 0 0 40px rgba(133, 206, 97, 0.4);
  animation: gradient-move 6s infinite, pulse 3s infinite;
  cursor: pointer;
  transition: box-shadow 0.3s ease, background-size 0.3s ease, transform 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
  z-index: 1000;
  text-align: center;
  letter-spacing: 1px;
  padding: 2px 10px;
}

.feedback-bubble:hover {
  transform: scale(1.08);
  box-shadow: 0 0 30px rgba(103, 194, 58, 0.8), 0 0 60px rgba(62, 198, 224, 0.5), 0 0 60px rgba(133, 206, 97, 0.6);
  animation: gradient-move-faster 3s infinite, pulse 1.5s infinite;
}

.feedback-bubble:active {
  transform: scale(0.95);
  box-shadow: 0 0 15px rgba(103, 194, 58, 0.5), 0 0 30px rgba(62, 198, 224, 0.2), 0 0 30px rgba(133, 206, 97, 0.3);
}

@keyframes gradient-move {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes gradient-move-faster {
  0% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 0% 50%; }
  75% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes pulse {
  0% { box-shadow: 0 0 20px rgba(103, 194, 58, 0.6), 0 0 40px rgba(133, 206, 97, 0.4); }
  50% { box-shadow: 0 0 30px rgba(103, 194, 58, 0.8), 0 0 60px rgba(133, 206, 97, 0.6); }
  100% { box-shadow: 0 0 20px rgba(103, 194, 58, 0.6), 0 0 40px rgba(133, 206, 97, 0.4); }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .feedback-bubble {
    bottom: 30px;
    right: 30px;
    width: 90px;
    height: 38px;
    font-size: 15px;
    border-radius: 19px;
    padding: 0 8px;
  }
}

/* 上传组件样式优化 */
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  margin: 0 8px 8px 0;
}

:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 104px;
}
</style>
