<template>
  <div class="teaching-group-card" @click="$emit('view-group', group)">
    <div class="card-header">
      <div class="group-info">
        <div class="group-name">{{ group.group_name }}</div>
        <div class="group-type">
          <el-tag :type="getGroupTypeTag(group.group_type)">
            {{ getGroupTypeLabel(group.group_type) }}
          </el-tag>
        </div>
      </div>
      <div class="card-actions" @click.stop>
        <el-dropdown @command="handleCommand">
          <el-button text>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>
                编辑
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided>
                <el-icon><Delete /></el-icon>
                删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <div class="card-body">
      <div class="group-stats">
        <div class="stat-item">
          <div class="stat-number">{{ group.student_count || 0 }}</div>
          <div class="stat-label">学生数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ group.task_count || 0 }}</div>
          <div class="stat-label">任务数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ group.pending_count || 0 }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
      
      <div class="group-students">
        <div class="students-label">学生成员：</div>
        <div class="students-list">
          <template v-if="group.students && group.students.length > 0">
            <div class="student-avatars">
              <el-avatar
                v-for="(student, index) in group.students.slice(0, 4)"
                :key="student.Student_Id"
                :size="32"
                :src="getStudentAvatar(student)"
                :style="{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 4 - index }"
              >
                {{ student.Student.charAt(0) }}
              </el-avatar>
              <div v-if="group.students.length > 4" class="more-students">
                +{{ group.students.length - 4 }}
              </div>
            </div>
            <div class="students-names">
              {{ getStudentNames(group.students) }}
            </div>
          </template>
          <template v-else>
            <span class="no-students">暂无学生</span>
          </template>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="group-time">
        创建时间：{{ formatTime(group.create_time) }}
      </div>
      <div class="quick-actions">
        <el-button size="small" type="primary" @click.stop="$emit('view-group', group)">
          管理
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MoreFilled, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  group: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['edit-group', 'delete-group', 'view-group'])

const getGroupTypeTag = (type) => {
  const typeMap = {
    'study': 'success',
    'project': 'warning',
    'default': 'info'
  }
  return typeMap[type] || typeMap.default
}

const getGroupTypeLabel = (type) => {
  const labelMap = {
    'study': '学习小组',
    'project': '项目小组',
    'default': '其他'
  }
  return labelMap[type] || labelMap.default
}

const getStudentAvatar = (student) => {
  // 这里可以返回学生的真实头像，现在先返回空字符串使用默认头像
  return ''
}

const getStudentNames = (students) => {
  if (!students || students.length === 0) return '暂无学生'
  if (students.length <= 2) {
    return students.map(s => s.Student).join('、')
  }
  return `${students.slice(0, 2).map(s => s.Student).join('、')} 等${students.length}人`
}

const formatTime = (timeStr) => {
  if (!timeStr) return '未知'
  const date = new Date(timeStr)
  return date.toLocaleDateString()
}

const handleCommand = (command) => {
  switch (command) {
    case 'edit':
      emit('edit-group', props.group)
      break
    case 'delete':
      emit('delete-group', props.group)
      break
  }
}
</script>

<style scoped>
.teaching-group-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.teaching-group-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 0;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.group-type {
  margin-bottom: 4px;
}

.card-actions {
  margin-left: 16px;
}

.card-body {
  padding: 16px 20px;
}

.group-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.group-students {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.students-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.students-list {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatars {
  display: flex;
  align-items: center;
}

.more-students {
  background: #f0f0f0;
  color: #909399;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-left: -8px;
}

.students-names {
  font-size: 14px;
  color: #606266;
  flex: 1;
}

.no-students {
  font-size: 14px;
  color: #c0c4cc;
  font-style: italic;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 20px;
}

.group-time {
  font-size: 12px;
  color: #909399;
}

.quick-actions {
  display: flex;
  gap: 8px;
}
</style>
