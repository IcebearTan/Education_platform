<template>
    <div>
    <el-dialog
      v-model="pendcourseVisible"
      title="课程进度设置"
      width="30%"
    >
      <div>
        <!-- 课程名称下拉框 -->
        <el-form label-width="80px">
          <el-form-item label="课程名称">
            <el-select
              v-model="selectedCourse"
              placeholder="请选择课程"
              @change="handleCourseChange"
            >
              <el-option
                v-for="course in courses"
                :key="course.course_name"
                :label="course.course_name"
                :value="course"
              />
            </el-select>
          </el-form-item>

          <!-- 进度下拉框 -->
          <el-form-item label="课程进度">
            <el-select
              v-model="selectedProgress"
              placeholder="请选择进度"
            >
              <el-option
                v-for="(chapter, index) in chapterOptions"
                :key="index"
                :label="`${chapter}/${selectedCourse.total}章节`"
                :value="chapter"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="pendcourseVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
    <div class="selectable" style="width: 100%; height: 100%; position: relative; overflow: hidden;">
      <el-dialog
      :title="title"
      v-model="dialogVisible"
      width="30%"
      center
    >
      <!-- 动态加载提示 -->
      <div v-if="isloading" class="loading-container">
        loading...
      </div>

      <!-- 用户列表 -->
      <div v-else class="ranking-list">
        <div class="scroll-container">
          <!-- 遍历每个用户 -->
          <div
            class="list-item"
            v-for="(user, index) in users"
            :key="index"
          >
            <!-- 用户名称 -->
            <div class="user-header">
              <span class="user-name">{{ user.name }}</span>
              <el-button @click="pendCourse(user)">新增记录</el-button>
            </div>

            <!-- 课程进度列表 -->
            <div
              class="progress-item"
              v-for="(course, pIndex) in user.courses"
              :key="pIndex"
            >
              <!-- 进度条标题 -->
              <div class="progress-chapter">{{ course.course_name }}</div>

              <!-- 进度条 -->
              <div class="progress-bar-container">
                <div class="progress-track">
                  <!-- 动态设置进度条宽度 -->
                  <div
                    class="progress-bar"
                    :style="{ width: `${(course.progress / course.total) * 100}%` }"
                  ></div>
                </div>

                <!-- 下拉框和进度显示 -->
                <div class="progress-details-container">
                  <!-- 下拉框 -->
                  <select
                    v-model="course.currentChapter"
                    @change="handleChapterChange(user, course)"
                  >
                    <option
                      v-for="(chapter, cIndex) in course.chapters"
                      :key="cIndex"
                      :value="chapter"
                    >
                      {{ chapter }}
                    </option>
                  </select>

                  <!-- 当前章节数显示 -->
                  <span class="current-chapter-display">
                    / {{ course.total }} 章节
                  </span>
                </div>
              </div>
            </div>

            <!-- 如果用户没有课程记录，显示提示 -->
            <div v-if="user.courses.length === 0" class="no-progress">
              该用户暂无课程记录。
            </div>
            <div v-if="index < users.length - 1" class="user-separator"></div>
          </div>
        </div>
      </div>

      <!-- 对话框底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="pendProgress">确 定</el-button>
      </span>
    </el-dialog>
        <div class="header-container selectable">
        <div class="l-container">学习进度（按小组分类）列表
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

  <script setup>
  import api from '../api';
  import { onBeforeMount } from 'vue';
  import { ref } from 'vue';
  import { ElDialog, ElMessage, ElMessageBox} from 'element-plus';
  import { useStore } from 'vuex'; // 添加store引入

  const store = useStore(); // 初始化store

  const dialogVisible = ref(false)
  const isloading = ref(true)
  
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

  let users = ref([]);
  const title = ref('');
  
  const showHint = ref(false);
  const searchQuery = ref('');
  
  let Groups = ref([]);

  const records = ref([]);
  
async function getGroupProgress(group_id)
  {
    isloading.value = true;
    console.log('Fetching Progress data...');
  try {
    const res = await api.get(`/learningProgress/group?Group_Id=${selectedGroupid.value}`);
    // console.log(res);

    if (res && res.data) {
      title.value = res.data.data.group_name;

      users.value = res.data.data.result.map(user => {
        return {
          name: user.username,
          id: user.user_id,
          courses: user.records.map(record => {
            return {
              course_id: record.course_id,
              course_name: record.course_name,
              total: record.course_chapters,
              progress: record.progress,
              currentChapter: record.progress, // 设置默认的当前章节
              chapters: Array.from({ length: record.course_chapters }, (_, i) => i + 1), // 假设章节从 1 到 total
            };
          }),
        };
      });
    }

    // console.log('Processed data:', users.value);
    isloading.value = false;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  }

  function configProgress(group) {
  dialogVisible.value = true;
  selectedGroupid.value = group.group_id;
  getGroupProgress();
  }

// 处理章节选择变化的逻辑
const handleChapterChange = (user, course) => {
  console.log(course);
  
  console.log(`用户 ${user.name} 的课程 ${course.course_name} 选择了章节 ${course.currentChapter}`);

  // 创建新的记录对象
  const newRecord = {
    Course_Id: course.course_id,
    Progress: course.currentChapter,
    User_Id: user.id,
  };

  // 根据 User_Id 和 Course_Id 找到对应的记录索引
  const recordIndex = records.value.findIndex(
    record =>
      record.User_Id === user.id && record.Course_Id === course.course_id
  );

  if (recordIndex !== -1) {
    // 如果已存在记录，则更新该记录
    records.value[recordIndex].Progress = newRecord.Progress;
  } else {
    // 如果不存在记录，则添加新记录
    records.value.push(newRecord);
  }

  console.log('更新后的 records:', records.value);
};

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
          
          // console.log(res);
          // console.log("Groups:",Groups);
          
        } catch (error) {
          console.error("Error fetching data:", error);
  }
  }
  
  async function pendProgress(){
    if(records.value.length === 0) {
      ElMessage.warning('当前修改的记录为空');
      return;
    }
    else{
      const returndata = {
        Records: [...records.value]
      }
      console.log(returndata);
      try {
        await api.post('/learningProgress/update', returndata);
        ElMessage.success('更新成功');
        dialogVisible.value = false;
        records.value.length = 0; // 清空记录数组
      }
      catch (error) {
        console.error("Error updating data:", error);
        ElMessage.error('更新失败，请稍后重试');
      }
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
  
    // console.log(Groups.value);
  
    searchQuery.value = ''; // 清空搜索框
  }
  
  // 新增课程进度模块
  const pendcourseVisible = ref(false)
  const isloading_pendcourse = ref(true)
  // 当前选中的课程
  const selectedCourse = ref(null);
  // 当前选中的进度
  const selectedProgress = ref(null);
  // 根据选中的课程动态生成的进度选项
  const chapterOptions = ref([]);
  // 当前选中的用户id
  const selectedUserId = ref(null);

  const selectedGroupid = ref(null);

  const courses = ref([
  ]);

  function claerForm () {
    selectedCourse.value = null;
    selectedProgress.value = null;
    chapterOptions.value = [];
    selectedUserId.value = null;
  }

  async function pendCourse(user){
      pendcourseVisible.value = true;
      isloading_pendcourse.value = true;
      console.log('Fetching Course data...');
      try {
        const res = (await api.get(`/course/list`))['data'];
        // console.log(res);
        courses.value = res.map(course => {
          return {
            course_name: course.Course_title,
            total: course.Course_Chapters,
            course_id: course.Course_Id,
          }
        });
        // console.log('Processed data:', courses.value);
        selectedUserId.value = user.id;
        isloading_pendcourse.value = false;
      }
    catch (error) {
      console.error("Error fetching data:", error);
      pendcourseVisible.value = false;
    }
  }

    // 处理课程选择变化
    const handleCourseChange = () => {
      if (selectedCourse.value) {
        // 根据选中的课程的总章节数生成进度选项
        chapterOptions.value = Array.from(
          { length: selectedCourse.value.total },
          (_, index) => index + 1
        );
        // 默认选中第一个章节
        selectedProgress.value = 1;
      } else {
        chapterOptions.value = [];
        selectedProgress.value = null;
      }
    };

    // 点击确认按钮时的处理逻辑
  async function handleConfirm (){
  // 检查课程、进度和用户 ID 是否都已选中
  if (
    selectedCourse.value &&
    selectedProgress.value &&
    selectedUserId.value
  ) {
    // 将选中的课程名称、课程进度和用户 ID 打包成一个对象
    const record = {
      Course_Id: selectedCourse.value.course_id,
      Progress: selectedProgress.value,
      User_Id: selectedUserId.value,
    };
    try {
    // 发送 POST 请求到后端
    await api.post('/learningProgress/update', record);

    // 打印后端返回的响应
    // console.log("Response from backend:", response);

    // 显示成功消息
    ElMessage.success('学习进度添加成功');

    getGroupProgress();
  } catch (error) {
    // 捕获并打印错误
    console.error('Failed to pend course progress:', error);

    // 显示错误消息
    ElMessage.error('学习进度添加失败，请稍后重试');
  }
    // 关闭弹窗
    pendcourseVisible.value = false;
    claerForm();
  } else {
    // 如果缺少必要信息，提示用户
    ElMessage.warning('请选择课程、进度和确认用户 ID！');
    claerForm();
  }
};

  
  </script>
  
<style scoped>

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
.user-separator {
  height: 1px;
  width: 100%;
  background-color: #ddd;
  margin: 10px 0;
}
  </style>
  