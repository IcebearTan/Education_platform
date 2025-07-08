<template>
  <div class="student-group-task">
    <!-- 顶部操作区：发布任务按钮（极简风格，原生button） -->
    <div v-if="userRole === 'teacher'" class="task-actions-minimal">
      <button class="publish-btn-minimal" @click="onPublishClick" :disabled="submitLoading">
        <span style="display:flex;align-items:center;justify-content:center;width:100%;">
          <el-icon style="margin-right:4px;"><Plus /></el-icon>
          发布任务
        </span>
      </button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error-block">
      <svg class="empty-icon" viewBox="0 0 64 64" width="48" height="48" fill="none">
        <circle cx="32" cy="32" r="30" fill="#f5f6fa"/>
        <path d="M20 40h24M24 28v-4a8 8 0 1 1 16 0v4" stroke="#c0c4cc" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="20" y="28" width="24" height="12" rx="6" fill="#e4e7ed"/>
      </svg>
      <div class="empty-text">{{ error }}</div>
    </div>
    <template v-else>
      <div v-for="([date, dayTasks]) in groupedTasks" :key="date" class="date-task">
        <div class="date">{{ formatDate(date) }}</div>
        <div v-for="task in dayTasks" :key="task.id" class="task-box">
          <div class="title">
            <span v-if="task._priority" class="priority-tag" :class="'priority-' + task._priority">{{ task._priority }}</span>
            {{ task.title }}
          </div>
          <div class="content">{{ task.content }}</div>
          <div class="box-footer">
            <div class="deadline">截止时间：{{ task.end_time }}</div>
            <div v-if="userRole === 'teacher'" class="task-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click="onEditTask(task)"
                plain
                style="margin-right: 8px;"
              >
                修改
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="onDeleteTask(task)"
                :loading="deleteLoading === task.id"
                plain
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 发布任务弹窗 -->
    <el-dialog :title="isEditMode ? '修改任务' : '发布新任务'" :lock-scroll=false v-model="taskDialogVisible" width="40%">
      <div class="task-form">
        <el-form :model="taskForm" :validate-on-rule-change=false ref="taskFormRef" :rules="{
          title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
          content: [{ required: true, message: '请输入任务内容', trigger: 'blur' }],
          deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
        }" label-width="100px">
          <el-form-item label="任务标题" prop="title">
            <el-input v-model="taskForm.title" name="title"></el-input>
          </el-form-item>
          <el-form-item label="任务内容" prop="content">
            <el-input type="textarea" v-model="taskForm.content" :rows="4" name="content"></el-input>
          </el-form-item>
          <el-form-item label="截止时间" prop="deadline">
            <el-date-picker v-model="taskForm.deadline" type="datetime" placeholder="选择截止时间" :disabled-date="disabledDate" name="deadline"></el-date-picker>
          </el-form-item>
          <el-form-item label="任务优先级" prop="priority">
            <el-select v-model="taskForm.priority" placeholder="选择任务优先级">
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
          <el-button @click="taskDialogVisible = false" :disabled="submitLoading">取 消</el-button>
          <el-button type="primary" @click="submitTask" :loading="submitLoading" :disabled="submitLoading">{{ isEditMode ? '保存修改' : '确 定' }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除任务确认弹窗 -->
    <el-dialog title="删除任务" v-model="deleteDialogVisible" width="30%" :lock-scroll="false">
      <p style="margin: 20px 0; text-align: center; font-size: 16px;">
        确定要删除任务 "<strong>{{ taskToDelete?.title }}</strong>" 吗？
      </p>
      <p style="margin: 10px 0; text-align: center; color: #999; font-size: 14px;">
        此操作不可撤销
      </p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false" :disabled="deleteLoading">取 消</el-button>
          <el-button type="danger" @click="confirmDeleteTask" :loading="deleteLoading" :disabled="deleteLoading">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '../../api'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  userRole: {
    type: String,
    default: 'teacher'
  },
  groupId: {
    type: Number,
    default: 2
  }
})

const tasks = ref([]);
const loading = ref(true);
const error = ref('');

// 任务发布弹窗相关
const taskDialogVisible = ref(false)
const taskForm = ref({
  title: '',
  content: '',
  deadline: '',
  priority: 'normal'
})
const taskFormRef = ref(null)
const submitLoading = ref(false)

// 删除任务相关
const deleteDialogVisible = ref(false)
const taskToDelete = ref(null)
const deleteLoading = ref(false)

const isEditMode = ref(false)
const editTaskId = ref(null)

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatDateTime(val) {
  if (!val) return '';
  const d = new Date(val);
  const pad = n => n < 10 ? '0' + n : n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

async function fetchTasks() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api({
      url: '/information/task/query',
      method: 'get',
      // params: { group_id: props.groupId }
    });
    // 适配后端新结构，合并五类优先级任务
    let list = [];
    if (res.data && res.data.data) {
      const urgent = Array.isArray(res.data.data.urgent_priority) ? res.data.data.urgent_priority : [];
      const high = Array.isArray(res.data.data.high_priority) ? res.data.data.high_priority : [];
      const medium = Array.isArray(res.data.data.medium_priority) ? res.data.data.medium_priority : [];
      const low = Array.isArray(res.data.data.low_priority) ? res.data.data.low_priority : [];
      const unimportant = Array.isArray(res.data.data.unimportant_priority) ? res.data.data.unimportant_priority : [];
      list = [
        ...urgent.map(t => ({ ...t, _priority: '紧急' })),
        ...high.map(t => ({ ...t, _priority: '高' })),
        ...medium.map(t => ({ ...t, _priority: '中' })),
        ...low.map(t => ({ ...t, _priority: '低' })),
        ...unimportant.map(t => ({ ...t, _priority: '不重要' })),
      ];
    }
    if (list.length > 0) {
      // 按优先级排序（紧急→高→中→低→不重要）
      const priorityOrder = { '紧急': 0, '高': 1, '中': 2, '低': 3, '不重要': 4 };
      tasks.value = list.sort((a, b) => priorityOrder[a._priority] - priorityOrder[b._priority]);
    } else {
      error.value = '暂无任务数据';
    }
  } catch (e) {
    error.value = '获取任务失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

// 发布任务
const submitTask = async () => {
  if (submitLoading.value) return;
  if (!taskFormRef.value) return;
  await taskFormRef.value.validate(async (valid) => {
    if (!valid) return;
    submitLoading.value = true;
    error.value = '';
    try {
      const payload = {
        Title: taskForm.value.title,
        Content: taskForm.value.content,
        End_Time: formatDateTime(taskForm.value.deadline),
        Priority: mapPriority(taskForm.value.priority),
        Group_Id: props.groupId
      };
      if (isEditMode.value) {
        payload.Id = editTaskId.value; // 编辑时带上任务id
      }
      await api({
        url: '/information/task/add',
        method: 'post',
        data: payload
      });
      console.log('任务提交成功', payload);
      ElMessage.success(isEditMode.value ? '任务修改成功！' : '任务发布成功！');
      taskDialogVisible.value = false;
      taskForm.value = { title: '', content: '', deadline: '', priority: 'normal' };
      fetchTasks();
    } catch (e) {
      error.value = isEditMode.value ? '任务修改失败，请重试' : '任务发布失败，请重试';
      ElMessage.error(error.value);
    } finally {
      submitLoading.value = false;
    }
  });
}

// 删除任务
function onDeleteTask(task) {
  taskToDelete.value = task;
  deleteDialogVisible.value = true;
}

async function confirmDeleteTask() {
  if (!taskToDelete.value || deleteLoading.value) return;
  
  deleteLoading.value = true;
  try {
    await api({
      url: '/information/task/delete',
      method: 'post',
      data: {
        id: taskToDelete.value.id
      }
    });
    ElMessage.success('任务删除成功！');
    deleteDialogVisible.value = false;
    taskToDelete.value = null;
    fetchTasks(); // 重新获取任务列表
  } catch (e) {
    ElMessage.error('任务删除失败，请重试');
  } finally {
    deleteLoading.value = false;
  }
}

function onPublishClick() {
  isEditMode.value = false
  taskDialogVisible.value = true;
}

function onEditTask(task) {
  isEditMode.value = true;
  editTaskId.value = task.id;
  taskForm.value = {
    title: task.title,
    content: task.content,
    deadline: task.end_time ? new Date(task.end_time) : '',
    priority: (() => {
      switch (task._priority) {
        case '紧急': return 'urgent';
        case '高': return 'high';
        case '中': return 'normal';
        case '低': return 'low';
        case '不重要': return 'unimportant';
        default: return 'normal';
      }
    })()
  };
  taskDialogVisible.value = true;
}

watch(taskDialogVisible, (val) => {
  if (!val) {
    taskForm.value = { title: '', content: '', deadline: '', priority: 'normal' }
    if (taskFormRef.value) taskFormRef.value.clearValidate()
  }
})

onMounted(() => {
  fetchTasks();
})

// 分组：{ '2025-07-07': [task, ...], ... }
const groupedTasks = computed(() => {
  const groups = {};
  for (const task of tasks.value) {
    const d = new Date(task.create_time);
    const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  }
  // 按日期倒序排列
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
});

</script>

<style scoped>
.student-group-task{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 auto;
  min-height: 0;
}

/* 极简风格按钮区 */
.task-actions-minimal {
  width: 100%;
  margin-top: 8px;
  margin-bottom: 18px;
  display: flex;
  justify-content: flex-end;
  background: none;
  box-shadow: none;
  padding: 0;
}
.publish-btn-minimal {
  width: 100%;
  max-width: 320px;
  min-width: 180px;
  border: 1px solid #e0e0e0;
  background: transparent;
  color: #222;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  transition: background 0.18s;
  outline: none;
  box-shadow: none;
  cursor: pointer;
  margin: 0 auto;
  display: block;
}
.publish-btn-minimal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.publish-btn-minimal:hover:not(:disabled) {
  background: #f7f7fa;
  border-color: #d0d0d0;
}

.date-task{
  width: 95%;
}

.date{
  width: fit-content;
  font-size: 18px;
  font-weight: bold;
  padding-bottom: 5px;
  margin-bottom: 20px;
  border-bottom: solid 3px #000;
  color: #000;
}

.task-box{
  width: 100%;
  height: 120px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 18px;
  border-radius: 10px;
  box-shadow: 0 0 7px #eee;
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
}

.task-box:hover{
  box-shadow: 0 0 16px #e2e2e2;
  transform: translateY(-6px);
  cursor: pointer;
}

.title{
  font-size: 18px;
  margin-bottom: 10px;
  margin-left: 20px;
  color: #222;
}

.content{
  font-size: 14px;
  color: #666;
  margin-left: 20px;
  margin-right: 20px;
  height: 3em;
  line-height: 1.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  text-overflow: ellipsis;
}

.box-footer{
  font-size: 12px;
  color: #999;
  margin-top: auto;
  margin-left: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-actions {
  margin-right: 20px;
}

.task-actions .el-button {
  font-size: 12px;
  padding: 4px 12px;
}

.loading {
  font-size: 18px;
  color: #666;
  margin: 20px;
}

.error-block {
  width: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0 24px 0;
  background: none;
}
.empty-icon {
  margin-bottom: 12px;
  display: block;
}
.empty-text {
  color: #b0b3bb;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 1px;
  text-align: center;
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

.priority-tag {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  margin-right: 8px;
  padding: 2px 10px;
  border-radius: 10px;
  color: #fff;
  vertical-align: middle;
}
.priority-tag.priority-紧急 { background: #e74c3c; }
.priority-tag.priority-高 { background: #f39c12; }
.priority-tag.priority-中 { background: #3498db; }
.priority-tag.priority-低 { background: #27ae60; }
.priority-tag.priority-不重要 { background: #7f8c8d; }
</style>