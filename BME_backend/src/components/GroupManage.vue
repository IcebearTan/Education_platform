<template>
  <div style="width: 100%; height: 100%; position: relative; overflow: hidden;">

    <el-dialog v-model="appendGruopDialogVisible" title="新建小组" width="500">
    <el-form :model="form">
      <el-form-item class="buildGroup" label="小组名称" :label-width="140">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item class="buildGroup" label="小组类别" :label-width="140" >
        <el-input v-model="form.type" autocomplete="off" placeholder="study/project"/>
      </el-form-item>
      <el-form-item class="buildGroup" label="组员信息" :label-width="140" >
        <el-input v-model="form.student" autocomplete="off" placeholder="请输入学生编号，不同编号间用空格隔开"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="appendGruopDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="configBuildGroup">
          应用
        </el-button>
      </div>
    </template>
  </el-dialog>

    <div class="header-container">
      <div class="l-container">小组列表
      <el-button class="config" size="large" @click="appendGruopDialogVisible = true" >新建小组</el-button>
     </div>
      <div class="r-container">
        <el-form :inline="true" class="form-inline" :model="formInline">
          <el-form-item label="小组查询" style="margin: 0; align-items: center;">
            <el-input placeholder=" 输入小组名称或组员名称"></el-input>
          </el-form-item>
          <el-form-item style="margin: 0; align-items: center; margin-right: 20px; margin-left: 10px;">
            <el-button type="primary" >
              <el-icon>
                <Search />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div style="margin: 20px;">
      <div class="table">
        <el-table :data="Groups" style="width: 100%; max-height: 500px; overflow-y: auto;">
          <el-table-column v-for="item in tableLabel" :key="item.prop" :prop="item.prop" :label="item.label"
            :width="item.width ? item.width : 125" :align="item.align" />
          <el-table-column fixed="right" label="Operations" min-width="120">
            <template #="scoped">
              <el-button type="primary" size="small"  @click ="appendMember(scope.row)">增加成员</el-button>
              <el-button type="danger" size="small" @click ="deleteMember(scope.row)">删除成员</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog v-model="appendMemberDialogVisible" title="新建小组" width="500">
    <el-form :model="form">
      <el-form-item class="buildGroup" label="小组名称" :label-width="140">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="appendMemberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="configBuildGroup">
          应用
        </el-button>
      </div>
    </template>
  </el-dialog>

      <el-pagination
        :total="totalItems" layout="prev, pager, next" style="position:absolute; bottom: 0; margin-bottom: 20px;">
      </el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '../api';
import { onBeforeMount } from 'vue';
import { ref, reactive} from 'vue';
import { md5 } from 'js-md5';
import { ElDialog ,ElMessage, ElMessageBox } from 'element-plus';

const appendGruopDialogVisible = ref(false)
const appendMemberDialogVisible = ref(false)
const deleteMemberDialogVisible = ref(false)


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
    label: '小组成员',
    prop: 'student',
    width: 400,
    align:'center'
  },
  {
    label: '创建者',
    prop: 'teacher',
    width: 100,
    align:'center'
  },
  {
    label: '创建者ID',
    prop: 'teacher_id',
    width: 100,
    align:'center'
  },
]);

let Groups = ref([]);

async function getGroupList()
{
  console.log('Fetching Groups...');
      try {
        const res = await api.get(`/user/group/list`);
        res.data.project_groups.forEach(group => {
          group.group_type = 'project';  //给group加上类型标签
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
        Groups.value.push(...res.data.project_groups);
        Groups.value.push(...res.data.study_groups);
        console.log(res);
        console.log(Groups);
        
      } catch (error) {
        console.error("Error fetching data:", error);
}
}

onBeforeMount(async () => {
  await getGroupList();
});

const form = reactive({
  name: '',
  type: '',
  student:''
})

async function BuildGroup()
{
  const studentString = form.student; // 获取输入的学生 ID 字符串
  const studentArray = studentString.split(" ").map(id => ({ student_id: id })); // 转换为对象数组

  const returnGroup = {
    Group_Name: form.name,
    Group_Type: form.type,
    Group_member: studentArray, // 将对象数组赋值给 Group_member
  };

  try{
    // console.log(returnGroup);
    const response = await api.post('/user/group_add', returnGroup);
    console.log(response);
    ElMessage.success('创建小组成功');
  }
  catch (error) {
    console.error('Failed to add group:', error);
  }
}

async function configBuildGroup()
{
  await BuildGroup();
  appendGruopDialogVisible.value = false;
}

async function appendMember(group)
{

}
async function deleteMember(group)
{

}
</script>

<style scoped>

.buildGroup {
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

.loading {
  margin-left: 30px;
  font-size: 20px;
  font-weight: 900;

  color: #4f4f4f;
}

.details {
  color: #767676;
}

.create-button {
  display: inline-block;
  margin-bottom: 5px;

  margin-left: 10px;
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

</style>
