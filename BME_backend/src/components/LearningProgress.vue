<template>
    <div class="selectable" style="width: 100%; height: 100%; position: relative; overflow: hidden;">
        <el-dialog
    title="提示"
    v-model="dialogVisible"
    width="30%"
    :before-close="handleClose"
    center
  >
    <div class="ranking-list" v-if="!isLoading">
      <div class="scroll-container">
        <!-- 用户列表 -->
        <div
          class="list-item"
          v-for="(user, index) in users"
          :key="index"
        >
          <div class="user-header">
            <span class="user-name">{{ user.name }}</span>
          </div>
          <!-- 用户的所有进度条 -->
          <div
            class="progress-item"
            v-for="(progress, pIndex) in user.progresses"
            :key="pIndex"
          >
            <div class="progress-chapter">{{ '第 ' + progress.chapter + ' 章' }}</div>
            <div class="progress-bar-container">
              <div class="progress-track">
                <div
                  class="progress-bar"
                  :style="{ width: `${progress.percent}%` }"
                ></div>
              </div>
              <el-button class="progress-button" type="primary" size="small">按键</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading-container">loading...</div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
    </span>
  </el-dialog>
        <div class="header-container selectable">
        <div class="l-container">学习进度（按小组分类）列表
        <el-button class="config" size="large" @click="appendGruopDialogVisible = true" >新建小组</el-button>
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
                <el-button type="primary" size="small"  @click ="configProgress(scoped.row)">编辑组员进度</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
export default {
  data() {
    return {
      dialogVisible: false,
      isLoading: false,
      users: [
      {
          rank: 4,
          name: "用户 5",
          progresses: [
            { percent: 60, chapter: 1 }, // 第一个进度条
            { percent: 40, chapter: 2 }, // 第二个进度条
          ],
        },
        {
          rank: 4,
          name: "用户 5",
          progresses: [
            { percent: 60, chapter: 1 }, // 第一个进度条
            { percent: 40, chapter: 2 }, // 第二个进度条
          ],
        },
        {
          rank: 4,
          name: "用户 5",
          progresses: [
            { percent: 60, chapter: 1 }, // 第一个进度条
            { percent: 40, chapter: 2 }, // 第二个进度条
          ],
        },
        {
          rank: 4,
          name: "用户 5",
          progresses: [
            { percent: 60, chapter: 1 }, // 第一个进度条
            { percent: 40, chapter: 2 }, // 第二个进度条
          ],
        },
        {
          rank: 4,
          name: "用户 4",
          progresses: [
            { percent: 60, chapter: 1 }, // 第一个进度条
            { percent: 40, chapter: 2 }, // 第二个进度条
          ],
        },
        {
          rank: 5,
          name: "用户 5",
          progresses: [
            { percent: 50, chapter: 1 },
            { percent: 70, chapter: 3 },
          ],
        },
        {
          rank: 6,
          name: "用户 6",
          progresses: [
            { percent: 80, chapter: 1 },
          ],
        },
        {
          rank: 7,
          name: "用户 7",
          progresses: [
            { percent: 30, chapter: 1 },
            { percent: 20, chapter: 2 },
          ],
        },
        {
          rank: 8,
          name: "用户 8",
          progresses: [
            { percent: 55, chapter: 1 },
          ],
        },
        {
          rank: 9,
          name: "用户 9",
          progresses: [
            { percent: 25, chapter: 1 },
            { percent: 65, chapter: 2 },
          ],
        },
        {
          rank: 10,
          name: "用户 10",
          progresses: [
            { percent: 15, chapter: 1 },
          ],
        },
      ],
    };
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
  },
};
</script>

  <script setup>
  import api from '../api';
  import { onBeforeMount } from 'vue';
  import { ref, reactive} from 'vue';
  import { ElDialog, ElMessage, ElMessageBox} from 'element-plus';
  
  const appendGruopDialogVisible = ref(false)
  const dialogVisible = ref(false)
  const isloading = ref(false)
  
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
  
  async function configProgress(group){
    dialogVisible.value = true;
    console.log('Fetching Progress data...');
    try {
        const res = await api.get(`/learningProgress/group?Group_Id=2`);
        console.log(res);
        
    }catch (error) {
    console.error("Error fetching data:", error);
    }
  }

  async function getGroupList()
  {
    console.log('Fetching Groups...');
        try {
          Groups.value.length = 0; // 清空之前的组数据
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
  
  function filterObjectsByMatchingValues(array1, array2, key1, key2) {
    return array1.filter(obj1 =>
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
  /* 排名列表样式 */
  .ranking-list {
  height: 400px; /* 设置弹窗内容的高度，确保内容可滚动 */
  display: flex;
  flex-direction: column; /* 用户列表垂直排列 */
}

/* 可滚动容器 */
.scroll-container {
  flex: 1; /* 确保滚动容器占满剩余空间 */
  overflow-y: auto; /* 垂直滚动 */
  /* 添加滚动条美化 */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
}

/* 每个用户项 */
.list-item {
  display: flex;
  flex-direction: column; /* 用户内部内容垂直排列 */
  margin-bottom: 10px;
}

/* 用户标题 */
.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
}

/* 进度条容器 */
.progress-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

/* 章节信息 */
.progress-chapter {
  font-size: 14px;
  color: #666;
  margin-right: 10px;
}

/* 进度条及其按键的容器 */
.progress-bar-container {
  display: flex;
  align-items: center;
}

/* 进度条 */
.progress-track {
  width: 150px; /* 进度条宽度 */
  height: 10px;
  background-color: #ddd;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #00c851;
  position: absolute;
  top: 0;
  left: 0;
}

/* 进度条旁边的按键 */
.progress-button {
  margin-left: 10px;
  font-size: 12px; /* 调整按键字体大小 */
}

/* 加载状态 */
.loading-container {
  text-align: center;
  font-size: 18px;
  color: #666;
}

/* 弹窗底部按钮组 */
.dialog-footer {
  display: flex;
  justify-content: flex-end; /* 按钮组右对齐 */
  margin-top: 10px;
}
  </style>
  