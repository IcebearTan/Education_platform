<template>
  <div class="teaching-task-management">
    <!-- 调试信息 -->
    <!-- <div style="background: #f0f9ff; padding: 10px; margin-bottom: 16px; border-radius: 4px; font-size: 12px;">
      <p>调试信息 - TeachingTaskManagement组件已渲染</p>
      <p>GroupId: {{ groupId }}</p>
      <p>Tasks数量: {{ tasks.length }}</p>
      <p>Loading状态: {{ loading }}</p>
    </div> -->

    <!-- 任务统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ taskStats.total }}</div>
              <div class="stats-label">总任务数</div>
              <el-icon class="stats-icon"><Document /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card pending">
            <div class="stats-content">
              <div class="stats-number">{{ taskStats.pending }}</div>
              <div class="stats-label">进行中</div>
              <el-icon class="stats-icon"><Clock /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card completed">
            <div class="stats-content">
              <div class="stats-number">{{ taskStats.completed }}</div>
              <div class="stats-label">已完成</div>
              <el-icon class="stats-icon"><Check /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card overdue">
            <div class="stats-content">
              <div class="stats-number">{{ taskStats.overdue }}</div>
              <div class="stats-label">已过期</div>
              <el-icon class="stats-icon"><Close /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 任务操作栏 -->
    <div class="task-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          发布新任务
        </el-button>
        <el-button @click="refreshTasks">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-select v-model="filterStatus" placeholder="任务状态" style="width: 120px" @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="进行中" value="pending" />
          <el-option label="已完成" value="completed" />
          <el-option label="已过期" value="overdue" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索任务"
          style="width: 200px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="task-list">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <el-empty description="暂无任务" />
      </div>
      <div v-else>
        <div v-for="task in filteredTasks" :key="task.id" class="task-item">
          <div class="task-header">
            <div class="task-title-row">
              <div class="task-title">{{ task.title }}</div>
              <el-tag 
                :type="getPriorityType(task.priority)" 
                size="small" 
                class="priority-tag"
              >
                {{ getPriorityText(task.priority) }}
              </el-tag>
            </div>
            <div class="task-actions">
              <el-tag :type="getTaskStatusType(task.status)">
                {{ getTaskStatusText(task.status) }}
              </el-tag>
              <el-dropdown @command="(cmd) => handleTaskAction(cmd, task)">
                <el-button text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">查看详情</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑任务</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除任务</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="task-content">
            <p class="task-description">{{ task.description || '暂无描述' }}</p>
            <div class="task-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                截止时间：{{ formatDate(task.deadline) }}
              </span>
              <span class="meta-item">
                <el-icon><Check /></el-icon>
                已提交：{{ task.completed_count || 0 }}人
              </span>
              <span class="meta-item">
                <el-icon><User /></el-icon>
                未提交：{{ getUnsubmittedCount(task) }}人
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="showCreateDialog" title="发布新任务" width="600px">
      <el-form :model="newTask" :rules="taskRules" ref="taskFormRef" label-width="100px">
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="newTask.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="newTask.description"
            type="textarea"
            :rows="4"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="newTask.deadline"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newTask.priority" placeholder="选择优先级" style="width: 100%">
            <el-option label="高优先级" value="high" />
            <el-option label="中优先级" value="medium" />
            <el-option label="低优先级" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            v-model:file-list="newTask.attachments"
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
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTask" :loading="creating">
          发布任务
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑任务" width="600px">
      <el-form :model="editTask" :rules="taskRules" ref="editTaskFormRef" label-width="100px">
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="editTask.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="editTask.description"
            type="textarea"
            :rows="4"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="editTask.deadline"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="editTask.priority" placeholder="选择优先级" style="width: 100%">
            <el-option label="高优先级" value="high" />
            <el-option label="中优先级" value="medium" />
            <el-option label="低优先级" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            v-model:file-list="editTask.attachments"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, MoreFilled, Calendar, User,
  Document, Upload, Clock, Check, Close
} from '@element-plus/icons-vue'

const router = useRouter()

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

const emit = defineEmits(['task-updated'])

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const editing = ref(false)
const tasks = ref([])
const filterStatus = ref('')
const searchKeyword = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const taskFormRef = ref()
const editTaskFormRef = ref()
const currentEditTask = ref(null)

// 新任务表单
const newTask = ref({
  title: '',
  description: '',
  deadline: '',
  priority: 'medium',
  attachments: []
})

// 编辑任务表单
const editTask = ref({
  id: null,
  title: '',
  description: '',
  deadline: '',
  priority: '',
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
const taskStats = computed(() => {
  const total = tasks.value.length
  const pending = tasks.value.filter(t => t.status === 'pending').length
  const completed = tasks.value.filter(t => t.status === 'completed').length
  const overdue = tasks.value.filter(t => t.status === 'overdue').length
  
  return { total, pending, completed, overdue }
})

const filteredTasks = computed(() => {
  let result = tasks.value

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(task => task.status === filterStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(task =>
      task.title.toLowerCase().includes(keyword) ||
      (task.description && task.description.toLowerCase().includes(keyword))
    )
  }

  return result
})

// 方法
const getTaskStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'info'
}

const getTaskStatusText = (status) => {
  const textMap = {
    'pending': '进行中',
    'completed': '已完成',
    'overdue': '已过期'
  }
  return textMap[status] || '未知'
}

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

const getUnsubmittedCount = (task) => {
  return (task.participants || 0) - (task.completed_count || 0)
}

const getCompletionRate = (task) => {
  if (!task.participants || task.participants === 0) return 0
  return Math.round(((task.completed_count || 0) / task.participants) * 100)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '未设置'
  return new Date(dateStr).toLocaleString()
}

const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleTaskAction = async (action, task) => {
  switch (action) {
    case 'view':
      // 跳转到教师任务详情页
      router.push({
        path: '/teacher-task-detail',
        query: {
          taskId: task.id,
          groupId: props.groupId,
          groupName: props.groupData?.group_name || '教学小组'
        }
      })
      break
    case 'edit':
      handleEditTask(task)
      break
    case 'delete':
      await handleDeleteTask(task)
      break
  }
}

const handleEditTask = (task) => {
  currentEditTask.value = task
  editTask.value = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    deadline: task.deadline,
    priority: task.priority || 'medium',
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
    
    // 更新任务列表中的数据
    const taskIndex = tasks.value.findIndex(t => t.id === editTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex],
        ...editTask.value,
        updated_time: new Date().toISOString()
      }
    }
    
    showEditDialog.value = false
    ElMessage.success('任务更新成功')
    emit('task-updated')
    
  } catch (error) {
    console.error('更新任务失败:', error)
    ElMessage.error('更新任务失败')
  } finally {
    editing.value = false
  }
}

const handleDeleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务"${task.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用删除API
    tasks.value = tasks.value.filter(t => t.id !== task.id)
    ElMessage.success('任务删除成功')
    emit('task-updated')
  } catch {
    // 用户取消删除
  }
}

const handleCreateTask = async () => {
  if (!taskFormRef.value) return
  
  try {
    await taskFormRef.value.validate()
    creating.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 添加到任务列表
    const task = {
      id: Date.now(),
      ...newTask.value,
      priority: 'medium', // 默认中优先级
      status: 'pending',
      participants: Math.floor(Math.random() * 20) + 5,
      completed_count: 0,
      created_time: new Date().toISOString()
    }
    
    tasks.value.unshift(task)
    
    // 重置表单
    newTask.value = {
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      attachments: []
    }
    
    showCreateDialog.value = false
    ElMessage.success('任务发布成功')
    emit('task-updated')
    
  } catch (error) {
    console.error('发布任务失败:', error)
  } finally {
    creating.value = false
  }
}

const refreshTasks = async () => {
  await fetchTasks()
  ElMessage.success('数据已刷新')
}

const fetchTasks = async () => {
  loading.value = true
  
  try {
    console.log('开始获取任务列表，groupId:', props.groupId)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    tasks.value = [
      {
        id: 1,
        title: '数学作业第一章',
        priority: 'medium',
        description: '完成教材第一章的所有练习题，包括课后习题1-10题。要求：1. 写出详细解题过程；2. 标明每题的解题思路；3. 如有疑问及时提问。',
        deadline: '2025-09-01T23:59:00',
        type: 'homework',
        status: 'pending',
        participants: 25,
        completed_count: 18,
        created_time: '2025-08-20T10:00:00'
      },
      {
        id: 2,
        title: '物理实验报告',
        priority: 'high',
        description: '根据实验课内容，撰写详细的实验报告。包括：实验目的、实验原理、实验步骤、数据记录、结果分析、实验结论等部分。',
        deadline: '2025-08-28T23:59:00',
        type: 'experiment',
        status: 'overdue',
        participants: 23,
        completed_count: 12,
        created_time: '2025-08-15T14:30:00'
      },
      {
        id: 3,
        title: '期中测试复习',
        priority: 'high',
        description: '复习前五章内容，准备期中测试。重点复习概念、公式和典型例题。',
        deadline: '2025-09-10T09:00:00',
        type: 'test',
        status: 'completed',
        participants: 25,
        completed_count: 25,
        created_time: '2025-08-25T16:00:00'
      },
      {
        id: 4,
        title: '编程项目：学生管理系统',
        priority: 'medium',
        description: '使用Python开发一个简单的学生管理系统，要求实现学生信息的增删改查功能。技术要求：使用面向对象编程，包含异常处理，有完整的用户界面。',
        deadline: '2025-09-15T23:59:00',
        type: 'project',
        status: 'pending',
        participants: 20,
        completed_count: 8,
        created_time: '2025-08-22T09:00:00'
      },
      {
        id: 5,
        title: '英语口语展示',
        priority: 'low',
        description: '准备5分钟的英语口语展示，主题为"我的未来职业规划"。要求：发音清晰、语法正确、内容充实、有适当的肢体语言。',
        deadline: '2025-09-03T14:30:00',
        type: 'presentation',
        status: 'pending',
        participants: 22,
        completed_count: 15,
        created_time: '2025-08-18T11:20:00'
      },
      {
        id: 6,
        title: '历史课讨论：改革开放的影响',
        priority: 'low',
        description: '参与课堂讨论，分析改革开放对中国社会经济发展的影响。请提前准备发言提纲，每人发言时间3-5分钟。',
        deadline: '2025-08-30T15:00:00',
        type: 'discussion',
        status: 'pending',
        participants: 28,
        completed_count: 20,
        created_time: '2025-08-23T13:45:00'
      },
      {
        id: 7,
        title: '化学实验：酸碱中和反应',
        priority: 'medium',
        description: '完成酸碱中和反应实验，记录实验现象，分析实验结果。实验报告要求：实验步骤清晰、数据准确、分析深入。',
        deadline: '2025-09-05T17:00:00',
        type: 'experiment',
        status: 'pending',
        participants: 24,
        completed_count: 10,
        created_time: '2025-08-21T08:30:00'
      },
      {
        id: 8,
        title: '数学竞赛模拟测试',
        priority: 'high',
        description: '参加数学竞赛模拟测试，题目难度较高，主要考查数学思维和解题技巧。测试时间120分钟。',
        deadline: '2025-09-08T10:00:00',
        type: 'test',
        status: 'pending',
        participants: 15,
        completed_count: 5,
        created_time: '2025-08-24T16:15:00'
      },
      {
        id: 9,
        title: '文学作品阅读报告',
        priority: 'low',
        description: '阅读指定文学作品《平凡的世界》第一部，撰写读后感。要求：不少于1000字，有个人见解，文笔流畅。',
        deadline: '2025-09-12T23:59:00',
        type: 'homework',
        status: 'pending',
        participants: 26,
        completed_count: 12,
        created_time: '2025-08-19T14:00:00'
      },
      {
        id: 10,
        title: '计算机基础操作考试',
        priority: 'high',
        description: '计算机基础操作技能考试，包括Word文档编辑、Excel表格制作、PowerPoint演示文稿制作等内容。',
        deadline: '2025-08-29T16:00:00',
        type: 'test',
        status: 'overdue',
        participants: 30,
        completed_count: 28,
        created_time: '2025-08-16T10:00:00'
      }
    ]
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

// 监听props变化
watch(() => props.groupId, () => {
  fetchTasks()
})

// 生命周期
onMounted(() => {
  console.log('TeachingTaskManagement 组件已挂载，props:', props)
  fetchTasks()
})
</script>

<style scoped>
.teaching-task-management {
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

.stats-card.completed {
  border-left: 4px solid #67C23A;
}

.stats-card.overdue {
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

.task-toolbar {
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

.task-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.loading {
  padding: 20px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.task-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px;
  transition: background-color 0.2s;
}

.task-item:hover {
  background-color: #f8f9fa;
}

.task-item:last-child {
  border-bottom: none;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.priority-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.priority-tag.high {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.priority-tag.medium {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.priority-tag.low {
  background-color: #f0f9ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-content {
  color: #606266;
}

.task-description {
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.task-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .task-toolbar {
    flex-direction: column;
    gap: 16px;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .task-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-overview .el-col {
    margin-bottom: 12px;
  }
}
</style>
