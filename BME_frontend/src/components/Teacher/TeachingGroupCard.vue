<template>
  <div class="teaching-group-card" @click="$emit('view-group', group)">
    <div class="card-header">
      <div class="group-info">
        <h3 class="group-name">{{ group.group_name }}</h3>
        <div class="group-meta">
          <el-tag 
            :type="group.group_type === 'project' ? 'warning' : 'primary'" 
            size="small"
          >
            {{ group.group_type === 'project' ? '项目小组' : '学习小组' }}
          </el-tag>
          <el-tag 
            type="success" 
            size="small"
            class="role-tag"
          >
            导师
          </el-tag>
        </div>
      </div>
      <div class="group-stats">
        <div class="stat-item">
          <i class="el-icon-user"></i>
          <span>{{ group.student_count || 0 }}人</span>
        </div>
        <div class="card-actions" @click.stop>
          <el-dropdown @command="handleCommand">
            <el-button text size="small">
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
    </div>
    
    <div class="card-content">
      <div class="group-description" v-if="group.description">
        <p>{{ group.description }}</p>
      </div>
      
      <div class="group-members">
        <div class="members-header">
          <span class="members-title">学生成员</span>
        </div>
        <div class="members-list" v-if="group.students && group.students.length > 0">
          <div 
            v-for="student in group.students.slice(0, 5)" 
            :key="student.Student_Id"
            class="member-avatar"
            :title="student.Student"
          >
            <el-avatar 
              :size="32" 
              :src="getStudentAvatar(student)"
            >
              {{ student.Student?.charAt(0) }}
            </el-avatar>
          </div>
          <div 
            v-if="group.students.length > 5" 
            class="more-members"
            :title="`还有${group.students.length - 5}人`"
          >
            +{{ group.students.length - 5 }}
          </div>
        </div>
        <div v-else class="no-members">
          <span>暂无学生成员</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MoreFilled, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  group: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['edit-group', 'delete-group', 'view-group'])

const getStudentAvatar = (student) => {
  // 这里可以返回学生的真实头像，现在先返回空字符串使用默认头像
  return ''
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
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  cursor: pointer;
}

.teaching-group-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #409eff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.group-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.role-tag {
  margin-left: 4px;
}

.group-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.stat-item i {
  color: #409eff;
}

.card-actions {
  margin-left: 8px;
}

.group-description {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.group-members {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.members-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.members-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-avatar {
  position: relative;
  cursor: pointer;
}

.member-avatar:hover {
  transform: scale(1.1);
}

.more-members {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.no-members {
  color: #999;
  font-size: 13px;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .teaching-group-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .group-meta {
    flex-wrap: wrap;
  }
}
</style>
