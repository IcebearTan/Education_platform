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
          <el-select v-model="groupForm.type" placeholder="选择小组类型" style="width: 100%" @change="handleTypeChange">
            <el-option label="学习小组" value="study" />
            <el-option label="项目小组" value="project" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="groupForm.type === 'study'" label="关联课程" required>
          <el-select v-model="groupForm.courseId" placeholder="选择关联课程" style="width: 100%">
            <el-option
              v-for="course in availableCourses"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
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
        <el-form-item label="邀请学生">
          <el-select
            v-model="groupForm.students"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="搜索学生姓名或学号"
            :remote-method="searchStudents"
            :loading="searchLoading"
            style="width: 100%"
            size="large"
          >
            <el-option
              v-for="student in availableStudents"
              :key="student.id"
              :label="`${student.name} (${student.studentId})`"
              :value="student.id"
            >
              <span style="float: left">{{ student.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ student.studentId }}</span>
            </el-option>
          </el-select>
          <div class="invite-help-text">
            <p>💡 提示：输入学生姓名或学号进行搜索，可以选择多个学生</p>
          </div>
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
  courseId: '',
  description: '',
  students: []
})

const availableStudents = ref([])
const availableCourses = ref([])
const searchLoading = ref(false)

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
    courseId: '',
    description: '',
    students: []
  }
  groupDialogVisible.value = true
  loadAvailableCourses()
  // 初始化时清空学生列表，等待搜索
  availableStudents.value = []
}

// 编辑小组
const handleEditGroup = (group) => {
  isEditMode.value = true
  currentEditId.value = group.group_id
  groupForm.value = {
    name: group.group_name,
    type: group.group_type,
    courseId: group.course_id || '',
    description: group.description || '',
    students: group.students ? group.students.map(s => s.Student_Id) : []
  }
  groupDialogVisible.value = true
  loadAvailableCourses()
  // 如果有已选择的学生，预加载他们的信息
  if (group.students && group.students.length > 0) {
    availableStudents.value = group.students.map(s => ({
      id: s.Student_Id,
      name: s.Student,
      studentId: s.Student_Id.toString()
    }))
  } else {
    availableStudents.value = []
  }
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
    name: 'teaching-group-details',
    params: { 
      groupId: group.group_id
    },
    query: { 
      group_name: group.group_name 
    }
  })
}

// 加载可选课程列表
const loadAvailableCourses = async () => {
  try {
    // 模拟课程数据，实际项目中应该从API获取
    const mockCourses = [
      { id: 'course_001', name: 'JavaScript 基础与进阶' },
      { id: 'course_002', name: 'Vue.js 框架开发' },
      { id: 'course_003', name: 'React 前端开发' },
      { id: 'course_004', name: 'Node.js 后端开发' },
      { id: 'course_005', name: 'Python 数据分析' },
      { id: 'course_006', name: 'Java Spring Boot' },
      { id: 'course_007', name: '数据库设计与优化' },
      { id: 'course_008', name: '移动端开发实战' }
    ]
    
    availableCourses.value = mockCourses
    
    // 实际API调用示例：
    // const response = await api.get('/courses')
    // if (response.data.code === 200) {
    //   availableCourses.value = response.data.data
    // }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  }
}

// 搜索学生
const searchStudents = async (query) => {
  if (!query) {
    availableStudents.value = []
    return
  }

  searchLoading.value = true
  
  try {
    // 模拟远程搜索API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟学生数据
    const mockStudents = [
      { id: 'stu_001', name: '张小明', studentId: '2025013', major: '计算机科学与技术', grade: '大三' },
      { id: 'stu_002', name: '李小红', studentId: '2025014', major: '软件工程', grade: '大二' },
      { id: 'stu_003', name: '王小刚', studentId: '2025015', major: '人工智能', grade: '大三' },
      { id: 'stu_004', name: '赵小美', studentId: '2025016', major: '数据科学与大数据技术', grade: '大一' },
      { id: 'stu_005', name: '刘小强', studentId: '2025017', major: '网络工程', grade: '大二' },
      { id: 'stu_006', name: '陈小丽', studentId: '2025018', major: '信息安全', grade: '大三' },
      { id: 'stu_007', name: '杨小龙', studentId: '2025019', major: '物联网工程', grade: '大二' },
      { id: 'stu_008', name: '周小华', studentId: '2025020', major: '电子信息工程', grade: '大一' },
      { id: 'stu_009', name: '吴小梅', studentId: '2025021', major: '通信工程', grade: '大三' },
      { id: 'stu_010', name: '郑小峰', studentId: '2025022', major: '自动化', grade: '大二' }
    ]
    
    // 过滤搜索结果
    const filteredStudents = mockStudents.filter(student => 
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.studentId.toLowerCase().includes(query.toLowerCase())
    )
    
    availableStudents.value = filteredStudents
    
    // 实际API调用示例：
    // const response = await api.get('/students/search', {
    //   params: { keyword: query }
    // })
    // if (response.data.code === 200) {
    //   availableStudents.value = response.data.data
    // }
    
  } catch (error) {
    console.error('搜索学生失败:', error)
    ElMessage.error('搜索学生失败')
  } finally {
    searchLoading.value = false
  }
}

// 小组类型变化处理
const handleTypeChange = (type) => {
  if (type !== 'study') {
    groupForm.value.courseId = ''
  }
}

// 提交小组表单
const submitGroup = async () => {
  try {
    // 验证必填字段
    if (!groupForm.value.name.trim()) {
      ElMessage.warning('请输入小组名称')
      return
    }
    
    if (groupForm.value.type === 'study' && !groupForm.value.courseId) {
      ElMessage.warning('学习小组必须选择关联课程')
      return
    }
    
    const payload = {
      name: groupForm.value.name,
      type: groupForm.value.type,
      courseId: groupForm.value.courseId,
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
  padding: 0;
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

/* 邀请提示文本样式 */
.invite-help-text {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.invite-help-text p {
  margin: 0;
  line-height: 1.4;
}
</style>
