<template>
  <div class="study-group-card" @click="viewDetails">
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
            :type="group.role === 'teacher' ? 'success' : 'info'" 
            size="small"
            class="role-tag"
          >
            {{ group.role_label }}
          </el-tag>
        </div>
      </div>
      <div class="group-stats">
        <div class="stat-item">
          <i class="el-icon-user"></i>
          <span>{{ group.student_count || 0 }}人</span>
        </div>
      </div>
    </div>
    
    <div class="card-content">
      <div class="group-description" v-if="group.description">
        <p>{{ group.description }}</p>
      </div>
      
      <div class="group-members">
        <div class="members-header">
          <span class="members-title">小组成员</span>
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
              :src="student.avatar || '/src/assets/ice_bear_avatar.jpg'"
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
          <span>暂无其他成员</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const viewDetails = () => {
  router.push({
    name: 'study-group-details',
    params: { groupId: props.group.group_id || props.group.id }
  })
}
</script>

<style scoped>
.study-group-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  cursor: pointer;
}

.study-group-card:hover {
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
  .study-group-card {
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
