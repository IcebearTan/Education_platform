<template>
  <div class="teaching-management-container">
    <div class="teaching-management-card">
      <div class="title">
        <div class="title-text">小组管理</div>
        <div class="title-actions">
          <el-button type="primary" @click="createNewGroup">
            <el-icon><Plus /></el-icon>
            创建新小组
          </el-button>
          <el-select
            v-model="selectedGroupType"
            placeholder="选择小组类型"
            style="width: 120px; margin-left: 12px;"
          >
            <el-option
              v-for="item in teachingGroupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="groups-container">
        <el-form :model="form" ref="formRef" class="transparent-form">
          <div v-if="isLoading" class="scroll-container"> 
            <el-loading text="加载中..." />
          </div>
          <div v-else class="scroll-container">
            <template v-if="filteredGroups.length > 0">
              <TeachingGroupCard
                v-for="(group, index) in filteredGroups"
                :key="index"
                :group="group"
                @edit-group="handleEditGroup"
                @delete-group="handleDeleteGroup"
                @view-group="handleViewGroup"
              />
            </template>
            <template v-else>
              <div class="no-group">
                <el-empty 
                  :image-size="120"
                  description="暂无管理的小组"
                >
                  <el-button type="primary" @click="createNewGroup">创建第一个小组</el-button>
                </el-empty>
              </div>
            </template>
          </div>
        </el-form>
      </div>
    </div>
    
    <!-- 创建/编辑小组弹窗 -->
    <el-dialog
      v-model="groupDialogVisible"
      :title="isEditMode ? '编辑小组' : '创建新小组'"
      width="600px"
    >
      <el-form :model="groupForm" label-width="100px">
        <el-form-item label="小组名称" required>
          <el-input v-model="groupForm.name" placeholder="请输入小组名称" />
        </el-form-item>
        <el-form-item label="小组类型" required>
          <el-select v-model="groupForm.type" placeholder="选择小组类型" style="width: 100%">
            <el-option label="学习小组" value="study" />
            <el-option label="项目小组" value="project" />
          </el-select>
        </el-form-item>
        <el-form-item label="小组描述">
          <el-input 
            v-model="groupForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入小组描述"
          />
        </el-form-item>
        <el-form-item label="学生邀请">
          <el-select
            v-model="groupForm.students"
            multiple
            placeholder="选择学生成员"
            style="width: 100%"
          >
            <el-option
              v-for="student in availableStudents"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="groupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGroup">
            {{ isEditMode ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import api from '../../api'
import TeachingGroupCard from './TeachingGroupCard.vue'

const router = useRouter()
const store = useStore()

const form = ref({})
const isLoading = ref(true)
const teachingGroups = ref([])

// 教学小组类型选项
const teachingGroupOptions = [
  { value: 'all', label: '全部小组' },
  { value: 'study', label: '学习指导小组' },
  { value: 'project', label: '项目指导小组' }
]

const selectedGroupType = ref('all')

// 弹窗相关
const groupDialogVisible = ref(false)
const isEditMode = ref(false)
const currentEditId = ref(null)

const groupForm = ref({
  name: '',
  type: 'study',
  description: '',
  students: []
})

const availableStudents = ref([])

// 获取教学小组数据
const getTeachingGroups = async () => {
  try {
    isLoading.value = true
    teachingGroups.value = []

    const response = await api.get('/user/group')
    
    if (response.data.code === 200) {
      const currentUserId = store.state.user?.User_Id
      if (!currentUserId) return

      const userId = parseInt(currentUserId)
      
      // 只获取用户作为导师管理的小组
      const allGroups = [
        ...(response.data.project_group || []),
        ...(response.data.study_group || [])
      ]
      
      const managedGroups = allGroups.filter(group => group.teacher_id === userId)
      
      // 处理小组数据
      managedGroups.forEach(group => {
        // 确保有必要的字段
        if (!group.group_name && group.title) {
          group.group_name = group.title
        }
        
        // 添加小组类型标识
        if (!group.group_type) {
          // 根据某些特征判断小组类型，或设置默认值
          group.group_type = group.title?.includes('项目') ? 'project' : 'study'
        }
        
        // 处理学生信息
        if (group.students && group.students.length > 0) {
          group.student_count = group.students.length
          group.student_names = group.students.map(s => s.Student).join('、')
        } else {
          group.student_count = 0
          group.student_names = '暂无学生'
        }
      })
      
      teachingGroups.value = managedGroups
    }
  } catch (error) {
    console.error('获取教学小组失败:', error)
    ElMessage.error('获取小组数据失败')
  } finally {
    isLoading.value = false
  }
}

// 筛选小组
const filteredGroups = computed(() => {
  if (selectedGroupType.value === 'all') {
    return teachingGroups.value
  }
  return teachingGroups.value.filter(group => group.group_type === selectedGroupType.value)
})

// 创建新小组
const createNewGroup = () => {
  isEditMode.value = false
  currentEditId.value = null
  groupForm.value = {
    name: '',
    type: 'study',
    description: '',
    students: []
  }
  groupDialogVisible.value = true
  loadAvailableStudents()
}

// 编辑小组
const handleEditGroup = (group) => {
  isEditMode.value = true
  currentEditId.value = group.group_id
  groupForm.value = {
    name: group.group_name,
    type: group.group_type,
    description: group.description || '',
    students: group.students ? group.students.map(s => s.Student_Id) : []
  }
  groupDialogVisible.value = true
  loadAvailableStudents()
}

// 删除小组
const handleDeleteGroup = async (group) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除小组"${group.group_name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 调用删除API
    await api.delete(`/group/${group.group_id}`)
    ElMessage.success('小组删除成功')
    getTeachingGroups() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除小组失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 查看小组详情
const handleViewGroup = (group) => {
  router.push({
    name: 'teaching-group-management',
    params: { groupId: group.group_id },
    query: { group_name: group.group_name }
  })
}

// 加载可选学生列表
const loadAvailableStudents = async () => {
  try {
    const response = await api.get('/user/students')
    if (response.data.code === 200) {
      availableStudents.value = response.data.data.map(student => ({
        id: student.Student_Id,
        name: student.Student_Name
      }))
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

// 提交小组表单
const submitGroup = async () => {
  try {
    const payload = {
      name: groupForm.value.name,
      type: groupForm.value.type,
      description: groupForm.value.description,
      students: groupForm.value.students
    }
    
    if (isEditMode.value) {
      await api.put(`/group/${currentEditId.value}`, payload)
      ElMessage.success('小组更新成功')
    } else {
      await api.post('/group', payload)
      ElMessage.success('小组创建成功')
    }
    
    groupDialogVisible.value = false
    getTeachingGroups() // 刷新列表
  } catch (error) {
    console.error('保存小组失败:', error)
    ElMessage.error('保存失败')
  }
}

// 监听筛选变化
watch(selectedGroupType, () => {
  // 可以在这里添加额外的筛选逻辑
})

onMounted(() => {
  getTeachingGroups()
})
</script>

<style scoped>
.teaching-management-container {
  width: 100%;
  /* margin-top: 10px; */
}

.teaching-management-card {
  min-height: 1000px;
  background-color: #fff;
  /* border-radius: 10px; */
  /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.title-text {
  font-size: 20px;
  font-weight: bold;
  color: #444;
  border-bottom: #444 2px solid;
  padding-bottom: 10px;
}

.title-actions {
  display: flex;
  align-items: center;
}

.groups-container {
  /* padding: 20px; */
}

.transparent-form {
  height: 900px;
  min-height: 300px;
  overflow: hidden;
}

.scroll-container {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
}

.no-group {
  text-align: center;
  padding: 60px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
