<template>
  <div class="selectable" style="width: 100%; height: 100%; position: relative; overflow: hidden;">

    <el-dialog v-model="appendGruopDialogVisible" @closed="clearForm" title="新建小组" width="500">
    <el-form :model="form" @submit.prevent>
      <el-form-item class="GroupInput" label="小组名称" :label-width="140">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      
      <el-form-item class="GroupInput" label="小组类别" :label-width="140" >
        <el-select v-model="form.type" placeholder="study/project">
          <el-option label="study" value="study" />
          <el-option label="project" value="project" />
      </el-select>
      </el-form-item>
      <el-form-item class="GroupInput" label="选择课程" :label-width="140">
        <el-select v-model="form.course_id" placeholder="请选择课程">
          <el-option 
            v-for="course in courseList" 
            :key="course.value" 
            :label="course.label" 
            :value="course.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="GroupInput" label="组员信息" :label-width="140" >
        <el-input v-model="form.student" @keyup.enter="configBuildGroup" autocomplete="off" placeholder="请输入学生编号，不同编号间用空格隔开"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="() => { appendGruopDialogVisible = false; clearForm(); }">取消</el-button>
        <el-button type="primary" @click="configBuildGroup">
          应用
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="configGruopDialogVisible" @closed="clearForm" title="编辑小组" width="500">
    <el-form :model="form" @submit.prevent>
      <el-form-item class="GroupInput" label="小组名称" :label-width="140">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      
      <el-form-item class="GroupInput" label="小组类别" :label-width="140" >
        <el-select v-model="form.type" placeholder="study/project">
          <el-option label="study" value="study" />
          <el-option label="project" value="project" />
      </el-select>
      </el-form-item>
      <el-form-item class="GroupInput" label="选择课程" :label-width="140">
        <el-select v-model="form.course_id" placeholder="请选择课程">
          <el-option 
            v-for="course in courseList" 
            :key="course.value" 
            :label="course.label" 
            :value="course.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="GroupInput" label="组员信息" :label-width="140" >
        <el-input v-model="form.student" @keyup.enter="configConfigGroup" autocomplete="off" placeholder="请输入学生编号，不同编号间用空格隔开"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="() => { configGruopDialogVisible = false; clearForm(); }">取消</el-button>
        <el-button type="primary" @click="configConfigGroup">
          应用
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- <el-dialog v-model="appendMemberDialogVisible" title="添加组员" width="500">
    <el-form :model="form" @submit.prevent>
      <el-form-item class="GroupInput" label="组员信息" :label-width="140">
        <el-input v-model="form.student" @keyup.enter="configAppendGroup" autocomplete="off" placeholder="请输入学生编号，不同编号间用空格隔开"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="appendMemberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="configAppendGroup">
          应用
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="deleteMemberDialogVisible" title="删除组员" width="500">
    <el-form :model="form" @submit.prevent>
      <el-form-item class="GroupInput" label="组员信息" :label-width="140">
        <el-input v-model="form.student" @keyup.enter="configDeleteGroup" autocomplete="off" placeholder="请输入学生编号，不同编号间用空格隔开"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="deleteMemberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="configDeleteGroup">
          应用
        </el-button>
      </div>
    </template>
  </el-dialog> -->

    <div class="header-container selectable">
      <div class="l-container">小组列表
      <el-button class="config" size="large" type="warning" @click="appendGruopDialogVisible = true" >新建小组</el-button>
     </div>
      <div class="r-container">
        <el-form :inline="true" class="form-inline" @submit.prevent>
          <el-form-item label="小组查询" style="margin: 0; align-items: center;">
            <el-input 
            @focus="showHint = true"
            @blur="showHint = false" 
            v-model="searchQuery" @keyup.enter="search" placeholder="搜索框">
            </el-input>
            <div
            v-if="showHint"
            class="input-hint"
            style="position: absolute; top: 100%; left: 0; margin-top: 5px; color: #888; font-size: 12px;" 
            >
            输入小组名称或老师、组员编号进行搜索，不同编号间用空格隔开
            </div>
          </el-form-item>
          <el-form-item style="margin: 0; align-items: center; margin-right: 20px; margin-left: 10px;">
            <el-button @click="search" type="primary" >
              <el-icon>
                <Search />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="selectable" style="margin: 20px;">
      <div class="table">
        <el-table :data="Groups" style="width: 100%; max-height: 500px; overflow-y: auto;">
          <el-table-column v-for="item in tableLabel" :key="item.prop" :prop="item.prop" :label="item.label"
            :width="item.width ? item.width : 125" :align="item.align" />
          <el-table-column fixed="right" label="Operations" min-width="120">
            <template #="scoped">
              <el-button type="primary" size="small"  @click ="configGroup(scoped.row)">编辑小组</el-button>
              <!-- <el-button type="primary" size="small"  @click ="appendMember(scoped.row)">添加组员</el-button>
              <el-button type="danger" size="small" @click ="deleteMember(scoped.row)">删除组员</el-button> -->
              <el-button type="danger" size="small" @click ="deleteGroup(scoped.row)">删除小组</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '../api';
import { onBeforeMount } from 'vue';
import { ref, reactive} from 'vue';
import { ElDialog, ElMessage, ElMessageBox} from 'element-plus';
import { useStore } from 'vuex'; // 添加store引入

const store = useStore(); // 初始化store

const appendGruopDialogVisible = ref(false)
const appendMemberDialogVisible = ref(false)
const deleteMemberDialogVisible = ref(false)
const configGruopDialogVisible = ref(false)

let tableLabel = ref([
  {
    label: '小组名称',
    prop: 'group_name',
    width: 100,
    align:'center'
  },
  {
    label:'小组类型',
    prop: 'group_type',
    width: 100,
    align:'center'
  },
  {
    label: '课程名称',
    prop: 'title',
    width: 220,
    align:'center'
  },
  {
    label: '小组成员',
    prop: 'student',
    width: 330,
    align:'center'
  },
  {
    label: '老师',
    prop: 'teacher',
    width: 100,
    align:'center'
  },
  {
    label: '老师ID',
    prop: 'teacher_id',
    width: 100,
    align:'center'
  },
]);

const showHint = ref(false);
const searchQuery = ref('');

let Groups = ref([]);
// 添加课程列表的响应式数据
const courseList = ref([]);

async function getGroupList()
{
  console.log('Fetching Groups...');
      try {
        Groups.value.length = 0; // 清空之前的组数据
        const res = await api.get(`/user/group/list`);
        res.data.project_groups.forEach(group => {
          group.group_type = 'project';  //给group加上类型标签
          // 确保title字段存在，如果不存在则显示"未知课程"
          if (!group.title) {
            group.title = "未知课程";
          }
          if(group.group.length > 0) {
            group.student = ''; //初始化组员字符串
            for(let i = 0; i < group.group.length; i++) {
              group.student += group.group[i].Student_Id + ':' + group.group[i].Student + ','; //将组员的姓名和ID拼接成字符串
            }
            group.student = group.student.slice(0, -1); //去掉最后一个逗号
          } else {
            group.student = '无'; //如果没有组员，则显示无
          }
        });
        res.data.study_groups.forEach(group => {
          group.group_type = 'study';
          // 确保title字段存在，如果不存在则显示"未知课程"
          if (!group.title) {
            group.title = "未知课程";
          }
          if(group.group.length > 0) {
            group.student = ''; //初始化组员字符串
            for(let i = 0; i < group.group.length; i++) {
              group.student += group.group[i].Student_Id + ':' + group.group[i].Student + ','; //将组员的姓名和ID拼接成字符串
            }
            group.student = group.student.slice(0, -1); //去掉最后一个逗号
          } else {
            group.student = '无'; //如果没有组员，则显示无
          }
        });
        
        // 获取当前用户ID
        const currentUser = store.state.user;
        
        if (currentUser && currentUser.User_Id) {
          // 筛选当前用户作为老师的小组
          // 将用户ID转换为数字以避免前导零的问题
          const currentUserId = Number(currentUser.User_Id);
          const teacherGroups = [...res.data.project_groups, ...res.data.study_groups].filter(
            group => Number(group.teacher_id) === currentUserId
          );
          Groups.value = teacherGroups;
        } else {
          // 如果无法获取用户信息，显示所有小组（保留原有行为）
          Groups.value.push(...res.data.project_groups);
          Groups.value.push(...res.data.study_groups);
        }
        
        console.log(res);
        console.log(Groups);
        
      } catch (error) {
        console.error("Error fetching data:", error);
}
}

// 获取课程列表的函数
async function getCourseList() {
  try {
    const res = await api.get('/course/list');
    courseList.value = res.data.map(course => ({
      value: parseInt(course.Course_Id), // 将ID转为数字
      label: course.Course_title
    }));
    console.log('课程列表加载成功:', courseList.value);
  } catch (error) {
    console.error('获取课程列表失败:', error);
    ElMessage.error('获取课程列表失败');
  }
}

onBeforeMount(async () => {
  await getGroupList();
  await getCourseList(); // 获取课程列表
});

const form = reactive({
  name: '',
  type: '',
  student:'',
  course_id: null,
  group_id: null // 添加group_id字段
})

const tempForm = reactive({
  name: '',
  type: '',
  student:[]
})

function clearForm()
{
  form.name = '';
  form.type = '';
  form.student = '';
  form.course_id = null;
  form.group_id = null; // 清空group_id
}
function clearTempForm()
{
  tempForm.name = '';
  tempForm.type = '';
  tempForm.student = [];
}

async function BuildGroup()
{
  // 验证课程ID是否已选择
  if (form.course_id === null || form.course_id === undefined) {
    ElMessage.error('请选择课程');
    return;
  }

  const studentString = form.student; // 获取输入的学生 ID 字符串
  const studentArray = studentString.split(" ").map(id => ({ student_id: id })); // 转换为对象数组

  const returnGroup = {
    Group_Name: form.name,
    Group_Type: form.type,
    Group_member: studentArray, // 将对象数组赋值给 Group_member
    Course_Id: parseInt(form.course_id), // 确保Course_Id是整数类型
  };

  console.log('提交的小组数据:', returnGroup);

  try{
    const response = await api.post('/user/group_add', returnGroup);
    console.log(response);
    ElMessage.success('创建小组成功');
  }
  catch (error) {
    console.error('Failed to add group:', error);
    ElMessage.error('创建小组失败');
  }

}

async function configBuildGroup()
{
  await BuildGroup();
  appendGruopDialogVisible.value = false;
  clearForm(); // 清空表单
  await getGroupList(); // 重新获取小组列表
}

function appendMember(group)
{
  // console.log(group);
  
  appendMemberDialogVisible.value = true;

  tempForm.name = group.group_name,
  tempForm.type = group.group_type,
  tempForm.student.push(...group.group.map(item => ({student_id: item.Student_Id}))) // 将对象数组赋值给 Group_member

}

async function configAppendGroup()
{
  const studentString = form.student;
  const studentArray = studentString.split(" ").map(id => ({ student_id: id }));

  const returnGroup = {
    Group_Name: tempForm.name,
    Group_Type: tempForm.type,
    Group_member: [...tempForm.student, ...studentArray], // 将对象数组赋值给 Group_member
  };

  try{
    // console.log(returnGroup);
    const response = await api.post('/user/group_add', returnGroup);
    console.log(response);
    ElMessage.success('添加组员成功');
  }
  catch (error) {
    console.error('Failed to add member:', error);
  }

  appendMemberDialogVisible.value = false;
  clearTempForm(); // 清空临时表单
  clearForm(); // 清空表单
  await getGroupList(); // 重新获取小组列表
}

function deleteMember(group)
{
  // console.log(group);
  
  deleteMemberDialogVisible.value = true;

  tempForm.name = group.group_name,
  tempForm.type = group.group_type,
  tempForm.student.push(...group.group.map(item => ({student_id: item.Student_Id}))) // 将对象数组赋值给 Group_member
}

async function configDeleteGroup()
{
  const studentString = form.student;
  const studentArray = studentString.split(" ").map(id => ({ student_id: id }));

  tempForm.student = tempForm.student.filter(
  tempStudent => !studentArray.some(
    student => String(student.student_id) === String(tempStudent.student_id) // 确保比较的是 student_id 的值
  )
);

  console.log('studentArray:', studentArray);
  console.log(tempForm.student);
  

  const returnGroup = {
    Group_Name: tempForm.name,
    Group_Type: tempForm.type,
    Group_member: [...tempForm.student], // 将对象数组赋值给 Group_member
  };

  try{
    // console.log(returnGroup);
    const response = await api.post('/user/group_add', returnGroup);
    console.log("组员飞飞");
    ElMessage.success('删除组员成功');
  }
  catch (error) {
    console.error('Failed to delete member:', error);
  }

  deleteMemberDialogVisible.value = false;
  clearTempForm(); // 清空临时表单
  clearForm(); // 清空表单
  await getGroupList(); // 重新获取小组列表
}

function configGroup(group) {
  // 打开编辑小组的对话框
  configGruopDialogVisible.value = true;

  // 将传入的 group 信息赋值到表单中
  form.name = group.group_name; // 小组名称
  form.type = group.group_type; // 小组类型
  form.course_id = group.course_id || null; // 课程ID
  form.group_id = group.group_id; // 设置小组ID

  // 将学生 ID 拼接成空格分隔的字符串
  if (group.student && typeof group.student === 'string') {
    const studentIds = group.student
      .split(',') // 按逗号分隔
      .map(item => item.split(':')[0]) // 提取学生 ID
      .join(' '); // 用空格拼接
    form.student = studentIds; // 赋值到表单
  } else {
    form.student = ''; // 如果没有学生信息，设置为空
  }
}

async function configConfigGroup(){
  // 验证课程ID是否已选择
  if (form.course_id === null || form.course_id === undefined) {
    ElMessage.error('请选择课程');
    return;
  }

  const studentString = form.student; // 获取输入的学生 ID 字符串
  const studentArray = studentString.split(" ").map(id => ({ student_id: id })); // 转换为对象数组

  const returnGroup = {
    Group_Name: form.name, // 小组名称
    Group_Type: form.type, // 小组类型
    Group_member: studentArray, // 小组成员（学生 ID 数组）
    Course_Id: parseInt(form.course_id), // 确保Course_Id是整数类型
  };
  
  // 只有在编辑小组时才添加Group_Id字段
  if (form.group_id) {
    returnGroup.Group_Id = parseInt(form.group_id); // 添加Group_Id字段，确保是整数类型
  }

  try {
    // 打印 returnGroup 以便调试
    console.log("Sending group data to backend:", returnGroup);

    // 发送 POST 请求到后端
    const response = await api.post('/user/group_add', returnGroup);

    // 打印后端返回的响应
    console.log("Response from backend:", response);

    // 显示成功消息
    ElMessage.success('小组信息提交成功');
    
    // 关闭对话框
    configGruopDialogVisible.value = false;
    clearForm(); // 清空表单
    await getGroupList(); // 重新获取小组列表
    
  } catch (error) {
    // 捕获并打印错误
    console.error('Failed to submit group data:', error);

    // 显示错误消息
    ElMessage.error('提交小组信息失败，请稍后重试');
  }
}

async function deleteGroup(group)
{
  ElMessageBox.confirm(
  `你确定要删除该小组吗？`, // 弹窗标题
  {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning', // 弹窗类型：success, warning, info, error
    showClose: true, // 是否显示关闭按钮
  }
).then(async () => {
  try{
    await api.post('/user/group/delete', {
      Group_Id: group.group_id, // 传递小组 ID
    });
    console.log("小组飞飞");
    ElMessage.success('删除小组成功');
    await getGroupList(); // 重新获取小组列表
  }
  catch (error) {
    console.error('Failed to delete group:', error);
  }
}
).catch(() => {})
}

function filterObjectsByMatchingValues(array1, array2, key1, key2) {
  return array1.filter
  (
    obj1 =>
    array2.some(obj2 => {
      // 获取 key1 的值
      const key1Value = obj1[key1];

      // 如果 key1Value 是字符串，解析为编号数组
      let key1Ids = [];
      if (typeof key1Value === 'string') {
        key1Ids = key1Value.split(',').map(item => item.split(':')[0]); // 提取编号部分
      } else if (typeof key1Value === 'number') {
        // 如果 key1Value 是数字，直接使用
        key1Ids = [String(key1Value)];
      } else {
        console.warn(`Unsupported key1Value type:`, key1Value);
        return false; // 跳过不支持的类型
      }

      // 获取 key2 的值
      const key2Value = obj2[key2];

      // 检查 key2Value 是否存在于 key1Ids 中
      return key1Ids.includes(String(key2Value));
    })
  );
}

function filterGroupsByGroupName(groups, searchString) {
  // 将输入的搜索字符串按空格分割为关键词数组
  const keywords = searchString.split(" ").filter(keyword => keyword.trim() !== "");

  // 遍历 groups 数组，筛选出符合条件的对象
  return groups.filter(group => {
    // 遍历关键词，检查 group_name 是否包含任意一个关键词（忽略大小写）
    return keywords.some(keyword => group.group_name.toLowerCase().includes(keyword.toLowerCase()));
  });
}

async function search() {
  const searchString = searchQuery.value.trim(); // 获取用户输入的搜索字符串
  if (!searchString) {
    await getGroupList(); // 如果输入为空，重置列表
    console.log("reset");
    return;
  }

  // 判断输入内容是否包含非数字字符（如中文、英文或其他语言的文字）
  const containsNonNumeric = /[^\d\s]/.test(searchString);

  if (containsNonNumeric) {
    // 如果包含非数字字符，使用 group_name 的筛选方法
    Groups.value = filterGroupsByGroupName(Groups.value, searchString);
  } else {
    // 如果是纯数字（编号），使用原有的筛选方法
    const studentArray = searchString.split(" ").map(id => ({ student_id: id })); // 转换为对象数组

    // 使用 Set 跟踪已添加的对象
    const uniqueResults = new Set();

    // 第一次筛选
    const filteredByTeacher = filterObjectsByMatchingValues(Groups.value, studentArray, "teacher_id", "student_id");
    filteredByTeacher.forEach(item => uniqueResults.add(item));

    // 第二次筛选
    const filteredByStudent = filterObjectsByMatchingValues(Groups.value, studentArray, "student", "student_id");
    filteredByStudent.forEach(item => uniqueResults.add(item));

    // 将 Set 转换为数组并赋值给 Groups
    Groups.value = Array.from(uniqueResults);
  }

  console.log(Groups.value);

  searchQuery.value = ''; // 清空搜索框
}



</script>

<style scoped>

.GroupInput {
  margin-top: 20px;
  font-size: 20px;
  font-weight: 900;
  position: relative;
  right: 40px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin: 10px;
  height: 40px;

  .l-container {
    display: inline-block;

    font-size: 30px;
    font-weight: 900;

    margin-left: 20px;

    color: #3b5cd5;
  }

  .r-container {
    display: flex;
    align-items: center;

    .form-inline {
      display: flex;
      justify-content: center;

      .el-form-item {
        text-align: center;
      }

      margin: 0;
    }
  }
}

.default-card {
  display: inline-block;
  width: 350px;

  margin: 20px;

  cursor: pointer;
}

.default-card:hover {
  transform: translateY(-10px);
  box-shadow: #c4c4c4 0px 0px 10px;
}

.config{
  animation: backgroundChange 100s infinite;
  margin-left: 10px;
  color: #fff;
}
@keyframes backgroundChange {
  0% {
    background-color: #fc8803bf; /* 粉色 */
  }
  25% {
    background-color: #ffc400; /* 浅橙色 */
  }
  50% {
    background-color: #a2ff00; /* 紫色 */
  }
  75% {
    background-color: #6a95da; /* 蓝色 */
  }
  100% {
    background-color: #f898e5; /* 回到粉色 */
  }
}

.input-hint {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.selectable {
    user-select: text;
}

</style>
