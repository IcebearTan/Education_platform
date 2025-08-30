<template>
  <div class="teaching-group-settings">
    <!-- 基本设置 -->
    <div class="settings-section">
      <h3>基本设置</h3>
      <el-form :model="basicSettings" :rules="basicRules" ref="basicFormRef" label-width="120px">
        <el-form-item label="小组名称" prop="groupName">
          <el-input v-model="basicSettings.groupName" placeholder="请输入小组名称" />
        </el-form-item>
        
        <el-form-item label="小组描述" prop="description">
          <el-input
            v-model="basicSettings.description"
            type="textarea"
            :rows="4"
            placeholder="请输入小组描述"
          />
        </el-form-item>
        
        <el-form-item label="小组类型" prop="groupType">
          <el-select v-model="basicSettings.groupType" style="width: 200px">
            <el-option label="学习小组" value="study" />
            <el-option label="项目小组" value="project" />
            <el-option label="研究小组" value="research" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="小组状态" prop="status">
          <el-switch
            v-model="basicSettings.isActive"
            active-text="活跃"
            inactive-text="暂停"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
        
        <el-form-item label="最大成员数" prop="maxMembers">
          <el-input-number
            v-model="basicSettings.maxMembers"
            :min="1"
            :max="100"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveBasicSettings" :loading="saving">
            保存基本设置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 权限设置 -->
    <div class="settings-section">
      <h3>权限设置</h3>
      <div class="permission-grid">
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-title">学生可以邀请其他学生</div>
            <div class="permission-desc">允许学生邀请新成员加入小组</div>
          </div>
          <el-switch v-model="permissions.studentCanInvite" />
        </div>
        
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-title">学生可以创建任务</div>
            <div class="permission-desc">允许学生发布小组任务</div>
          </div>
          <el-switch v-model="permissions.studentCanCreateTask" />
        </div>
        
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-title">学生可以上传文件</div>
            <div class="permission-desc">允许学生上传和分享文件</div>
          </div>
          <el-switch v-model="permissions.studentCanUpload" />
        </div>
        
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-title">自动审核加入申请</div>
            <div class="permission-desc">新成员加入时无需手动审核</div>
          </div>
          <el-switch v-model="permissions.autoApprove" />
        </div>
        
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-title">公开小组信息</div>
            <div class="permission-desc">小组信息对其他用户可见</div>
          </div>
          <el-switch v-model="permissions.publicGroup" />
        </div>
      </div>
      
      <el-button type="primary" @click="savePermissions" :loading="saving" style="margin-top: 20px">
        保存权限设置
      </el-button>
    </div>

    <!-- 通知设置 -->
    <div class="settings-section">
      <h3>通知设置</h3>
      <div class="notification-grid">
        <div class="notification-item">
          <div class="notification-info">
            <div class="notification-title">新成员加入</div>
            <div class="notification-desc">当有新成员加入时通知</div>
          </div>
          <el-switch v-model="notifications.newMember" />
        </div>
        
        <div class="notification-item">
          <div class="notification-info">
            <div class="notification-title">任务提交</div>
            <div class="notification-desc">当学生提交任务时通知</div>
          </div>
          <el-switch v-model="notifications.taskSubmission" />
        </div>
        
        <div class="notification-item">
          <div class="notification-info">
            <div class="notification-title">任务截止提醒</div>
            <div class="notification-desc">任务截止前自动提醒</div>
          </div>
          <el-switch v-model="notifications.taskDeadline" />
        </div>
        
        <div class="notification-item">
          <div class="notification-info">
            <div class="notification-title">成绩发布</div>
            <div class="notification-desc">当发布成绩时通知学生</div>
          </div>
          <el-switch v-model="notifications.gradeRelease" />
        </div>
      </div>
      
      <div class="notification-methods">
        <h4>通知方式</h4>
        <el-checkbox-group v-model="notifications.methods">
          <el-checkbox label="email">邮箱通知</el-checkbox>
          <el-checkbox label="system">系统内通知</el-checkbox>
          <el-checkbox label="wechat">微信通知</el-checkbox>
        </el-checkbox-group>
      </div>
      
      <el-button type="primary" @click="saveNotifications" :loading="saving" style="margin-top: 20px">
        保存通知设置
      </el-button>
    </div>

    <!-- 数据管理 -->
    <div class="settings-section">
      <h3>数据管理</h3>
      <div class="data-actions">
        <div class="action-item">
          <div class="action-info">
            <div class="action-title">导出小组数据</div>
            <div class="action-desc">导出所有学生数据和学习记录</div>
          </div>
          <el-button @click="exportGroupData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
        
        <div class="action-item">
          <div class="action-info">
            <div class="action-title">备份小组</div>
            <div class="action-desc">创建小组的完整备份</div>
          </div>
          <el-button @click="backupGroup">
            <el-icon><FolderOpened /></el-icon>
            创建备份
          </el-button>
        </div>
        
        <div class="action-item">
          <div class="action-info">
            <div class="action-title">清空聊天记录</div>
            <div class="action-desc">删除所有聊天记录（不可恢复）</div>
          </div>
          <el-button type="warning" @click="clearChatHistory">
            <el-icon><Delete /></el-icon>
            清空记录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 危险操作 -->
    <div class="settings-section danger-section">
      <h3>危险操作</h3>
      <div class="danger-actions">
        <div class="action-item">
          <div class="action-info">
            <div class="action-title">解散小组</div>
            <div class="action-desc">永久删除小组和所有相关数据（不可恢复）</div>
          </div>
          <el-button type="danger" @click="showDeleteConfirm = true">
            <el-icon><Delete /></el-icon>
            解散小组
          </el-button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="showDeleteConfirm" title="确认解散小组" width="500px">
      <div class="delete-warning">
        <el-icon size="48" color="#f56c6c"><WarningFilled /></el-icon>
        <h3>此操作无法撤销！</h3>
        <p>解散小组后，以下数据将被永久删除：</p>
        <ul>
          <li>所有学生数据和学习记录</li>
          <li>所有任务和提交记录</li>
          <li>所有聊天记录和文件</li>
          <li>所有统计数据</li>
        </ul>
        <p>请输入小组名称 <strong>"{{ basicSettings.groupName }}"</strong> 以确认解散：</p>
        <el-input v-model="deleteConfirmText" placeholder="请输入小组名称" />
      </div>
      <template #footer>
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button
          type="danger"
          @click="deleteGroup"
          :disabled="deleteConfirmText !== basicSettings.groupName"
          :loading="deleting"
        >
          确认解散
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, FolderOpened, Delete, WarningFilled
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

const emit = defineEmits(['group-updated'])
const router = useRouter()

// 响应式数据
const saving = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')
const basicFormRef = ref()

// 基本设置
const basicSettings = reactive({
  groupName: '',
  description: '',
  groupType: 'study',
  isActive: true,
  maxMembers: 50
})

// 权限设置
const permissions = reactive({
  studentCanInvite: false,
  studentCanCreateTask: false,
  studentCanUpload: true,
  autoApprove: false,
  publicGroup: false
})

// 通知设置
const notifications = reactive({
  newMember: true,
  taskSubmission: true,
  taskDeadline: true,
  gradeRelease: true,
  methods: ['email', 'system']
})

// 表单验证规则
const basicRules = {
  groupName: [
    { required: true, message: '请输入小组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '小组名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }
  ],
  groupType: [
    { required: true, message: '请选择小组类型', trigger: 'change' }
  ]
}

// 方法
const saveBasicSettings = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    saving.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('基本设置保存成功')
    emit('group-updated')
  } catch (error) {
    console.error('保存基本设置失败:', error)
  } finally {
    saving.value = false
  }
}

const savePermissions = async () => {
  saving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('权限设置保存成功')
  } catch (error) {
    console.error('保存权限设置失败:', error)
    ElMessage.error('保存权限设置失败')
  } finally {
    saving.value = false
  }
}

const saveNotifications = async () => {
  saving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('通知设置保存成功')
  } catch (error) {
    console.error('保存通知设置失败:', error)
    ElMessage.error('保存通知设置失败')
  } finally {
    saving.value = false
  }
}

const exportGroupData = () => {
  ElMessage.info('导出数据功能开发中')
}

const backupGroup = () => {
  ElMessage.info('备份功能开发中')
}

const clearChatHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有聊天记录吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('聊天记录已清空')
  } catch {
    // 用户取消
  }
}

const deleteGroup = async () => {
  deleting.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('小组已解散')
    showDeleteConfirm.value = false
    
    // 跳转到小组列表页
    router.push({ name: 'teaching-management' })
  } catch (error) {
    console.error('解散小组失败:', error)
    ElMessage.error('解散小组失败')
  } finally {
    deleting.value = false
  }
}

const loadSettings = () => {
  // 从props.groupData加载设置
  if (props.groupData) {
    Object.assign(basicSettings, {
      groupName: props.groupData.group_name || props.groupData.title || '',
      description: props.groupData.description || '',
      groupType: props.groupData.group_type || 'study',
      isActive: props.groupData.is_active !== false,
      maxMembers: props.groupData.max_members || 50
    })
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.teaching-group-settings {
  max-width: 800px;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-section h3 {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.permission-grid {
  display: grid;
  gap: 16px;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.permission-info {
  flex: 1;
}

.permission-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.permission-desc {
  font-size: 14px;
  color: #909399;
}

.notification-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.notification-info {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 14px;
  color: #909399;
}

.notification-methods {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.notification-methods h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.data-actions {
  display: grid;
  gap: 16px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.action-info {
  flex: 1;
}

.action-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 14px;
  color: #909399;
}

.danger-section {
  border: 2px solid #f56c6c;
  background: #fef0f0;
}

.danger-section h3 {
  color: #f56c6c;
  border-bottom-color: #f56c6c;
}

.danger-actions {
  display: grid;
  gap: 16px;
}

.delete-warning {
  text-align: center;
  padding: 20px;
}

.delete-warning h3 {
  color: #f56c6c;
  margin: 16px 0;
}

.delete-warning p {
  color: #606266;
  margin: 12px 0;
}

.delete-warning ul {
  text-align: left;
  margin: 16px 0;
  padding-left: 20px;
  color: #606266;
}

.delete-warning strong {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .teaching-group-settings {
    max-width: 100%;
  }
  
  .permission-item,
  .notification-item,
  .action-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .permission-info,
  .notification-info,
  .action-info {
    margin-bottom: 8px;
  }
}
</style>
