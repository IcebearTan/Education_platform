<template>
    <div>
    <el-dialog
      v-model="pendcourseVisible"
      title="课程进度设置"
      width="450px"
      :close-on-click-modal="false"
      class="progress-dialog"
    >
      <div>
        <el-form label-width="100px">
          <el-form-item label="课程名称">
            <el-select
              v-model="selectedCourse"
              placeholder="请选择课程"
              @change="handleCourseChange"
              style="width: 100%"
              class="custom-select"
            >
              <el-option
                v-for="course in courses"
                :key="course.course_name"
                :label="course.course_name"
                :value="course"
              />
            </el-select>
          </el-form-item>

          <!-- 章选择下拉框 -->
          <el-form-item label="选择章">
            <el-select
              v-model="selectedChapter"
              placeholder="请选择章"
              @change="handleChapterSelect"
              style="width: 100%"
              class="custom-select"
            >
              <el-option
                v-for="chapter in chaptersList"
                :key="chapter.order"
                :label="`第${chapter.num}章：${chapter.name}`"
                :value="chapter.order"
              />
            </el-select>
          </el-form-item>

          <!-- 节选择下拉框 -->
          <el-form-item label="选择节">
            <el-select
              v-model="selectedProgress"
              placeholder="请选择节"
              style="width: 100%"
              class="custom-select"
              :disabled="!selectedChapter || sectionsList.length === 0"
            >
              <el-option
                v-for="section in sectionsList"
                :key="section.order"
                :label="`第${section.num}节：${section.name}`"
                :value="section.order"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

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
      width="500px"
      :close-on-click-modal="false"
      class="progress-dialog"
    >
      <!-- 动态加载提示 -->
      <div v-if="isloading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon> 正在加载中...
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
              <!-- <el-button type="primary" size="small" @click="pendCourse(user)">
                <el-icon><Plus /></el-icon> 新增记录
              </el-button> -->
            </div>

            <!-- 课程进度列表 -->
            <div
              class="progress-item"
              v-for="(course, pIndex) in user.courses"
              :key="pIndex"
            >
              <!-- 进度条标题 -->
              <div class="progress-title">
                <span class="course-name">{{ course.course_name }}</span>
              </div>

              <!-- 当前章节信息 -->
              <div v-if="course.chapterInfo.chapter_num" class="chapter-info">
                <div class="chapter-header">
                  当前进度：
                  <span class="chapter-num">第{{ course.chapterInfo.chapter_num }}章</span>
                  <span v-if="course.chapterInfo.section_num" class="section-num">
                    第{{ course.chapterInfo.section_num }}节
                  </span>
                </div>
                <div class="chapter-name">
                  {{ course.chapterInfo.chapter_name }}
                  <span v-if="course.chapterInfo.section_name">
                    - {{ course.chapterInfo.section_name }}
                  </span>
                </div>
              </div>

              <!-- 进度条 -->
              <div class="progress-bar-container">
                <div class="progress-track">
                  <!-- 动态设置进度条宽度 -->
                  <div
                    class="progress-bar"
                    :style="{ width: `${(course.progress / course.total) * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- 章节选择区域 -->
              <div class="chapter-selection">
                <el-select
                  v-model="course.currentChapterForSelect"
                  placeholder="选择章"
                  @change="handleChapterSelectInProgress(user, course)"
                  size="small"
                >
                  <el-option
                    v-for="option in course.organizedOptions?.chapters || []"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                
                <el-select
                  v-model="course.currentChapter"
                  placeholder="选择节"
                  @change="handleChapterChange(user, course)"
                  size="small"
                  :disabled="!course.currentChapterForSelect"
                >
                  <el-option
                    v-for="option in (course.organizedOptions?.sections && course.currentChapterForSelect ? 
                      course.organizedOptions.sections[course.currentChapterForSelect] || [] : [])"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
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
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="pendProgress">确 定</el-button>
        </span>
      </template>
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
  import { onBeforeMount, computed } from 'vue';
  import { ref } from 'vue';
  import { ElDialog, ElMessage, ElMessageBox} from 'element-plus';
  import { useStore } from 'vuex'; // 添加store引入
  import { Plus, Loading } from '@element-plus/icons-vue'; // 导入图标

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

  let users = ref([]);
  const title = ref('');
  
  const showHint = ref(false);
  const searchQuery = ref('');
  
  let Groups = ref([]);

  const records = ref([]);
  const selectedCourseId = ref(null); // 用于存储当前选中小组的课程ID
  const courseChapters = ref([]); // 存储课程章节列表

  // 配置用户进度（点击表格中的按钮时调用）
  function configProgress(group) {
    dialogVisible.value = true;
    selectedGroupid.value = group.group_id;
    selectedCourseId.value = group.course_id; // 设置当前选中的课程ID
    getGroupProgress();
  }

  // 获取小组进度数据
  async function getGroupProgress() {
    isloading.value = true;
    console.log('Fetching Progress data...');
    try {
      const res = await api.get(`/learningProgress/group?Group_Id=${selectedGroupid.value}`);

      if (res && res.data) {
        title.value = res.data.data.group_name;

        // 保存原始用户数据以便后续处理
        const rawUsers = res.data.data.result;
        
        // 获取课程章节列表
        await getCourseChapters(selectedCourseId.value);
        
        // 处理用户数据
        users.value = rawUsers.map(user => {
          return {
            name: user.username,
            id: user.user_id,
            courses: user.records
              .filter(record => record.course_id === selectedCourseId.value) // 筛选对应课程的记录
              .map(record => {
                // 组织章节选项为两级结构
                const chapters = [];
                const sectionsMap = {};
                
                // 提取所有章
                courseChapters.value.filter(ch => ch.Chapter_Priority === 0).forEach(chapter => {
                  const chapterNum = courseChapters.value.filter(
                    ch => ch.Chapter_Priority === 0 && ch.Chapter_Order <= chapter.Chapter_Order
                  ).length;
                  
                  chapters.push({
                    value: chapter.Chapter_Order,
                    label: `第${chapterNum}章：${chapter.Chapter_Name}`
                  });
                  
                  // 为每一章初始化节数组
                  sectionsMap[chapter.Chapter_Order] = [];
                });
                
                // 按章组织所有节
                courseChapters.value.filter(ch => ch.Chapter_Priority === 1).forEach(section => {
                  // 查找该节所属的章
                  for (let i = section.Chapter_Order - 1; i >= 1; i--) {
                    const potentialParent = courseChapters.value.find(
                      ch => ch.Chapter_Order === i && ch.Chapter_Priority === 0
                    );
                    if (potentialParent) {
                      // 计算节号
                      const sectionNum = courseChapters.value.filter(
                        ch => ch.Chapter_Priority === 1 && 
                            potentialParent.Chapter_Order < ch.Chapter_Order && 
                            ch.Chapter_Order <= section.Chapter_Order
                      ).length;
                      
                      // 添加到所属章的节数组
                      if (sectionsMap[potentialParent.Chapter_Order]) {
                        sectionsMap[potentialParent.Chapter_Order].push({
                          value: section.Chapter_Order,
                          label: `第${sectionNum}节：${section.Chapter_Name}`
                        });
                      }
                      break;
                    }
                  }
                });

                // 查找当前进度对应的章节信息
                const currentChapter = courseChapters.value.find(
                  chapter => chapter.Chapter_Order === record.progress
                ) || { Chapter_Name: "未知章节", Chapter_Order: record.progress, Chapter_Priority: 1 };

                // 找到当前节所属的章
                let parentChapterOrder = null;
                if (currentChapter && currentChapter.Chapter_Priority === 1) {
                  for (let i = currentChapter.Chapter_Order - 1; i >= 1; i--) {
                    const potentialParent = courseChapters.value.find(
                      ch => ch.Chapter_Order === i && ch.Chapter_Priority === 0
                    );
                    if (potentialParent) {
                      parentChapterOrder = potentialParent.Chapter_Order;
                      break;
                    }
                  }
                }

                // 如果是章，不预选章
                if (currentChapter.Chapter_Priority === 0) {
                  parentChapterOrder = null;
                }

                return {
                  course_id: record.course_id,
                  course_name: record.course_name,
                  total: record.course_chapters,
                  progress: record.progress,
                  currentChapter: record.progress, // 当前选中的节
                  currentChapterForSelect: parentChapterOrder, // 当前节所属的章
                  chapterInfo: {
                    chapter_num: record.chapter_num || 0,
                    section_num: record.section_num || 0,
                    chapter_name: record.chapter_name || "未知章节",
                    section_name: record.section_name || ""
                  },
                  // 组织成二级结构的选项
                  organizedOptions: {
                    chapters: chapters,
                    sections: sectionsMap
                  }
                };
              }),
          };
        });
      }

      isloading.value = false;
    } catch (error) {
      console.error("Error fetching data:", error);
      isloading.value = false;
    }
  }

  // 获取课程章节列表
  async function getCourseChapters(courseId) {
    try {
      const res = await api.get(`/course/chapter_list?Course_Id=${courseId}`);
      if (res && res.data) {
        courseChapters.value = res.data;
      }
    } catch (error) {
      console.error("Error fetching course chapters:", error);
      courseChapters.value = [];
    }
  }

  // 处理章节选择变化的逻辑
  const handleChapterChange = (user, course) => {
    console.log(`用户 ${user.name} 的课程 ${course.course_name} 选择了章节 ${course.currentChapter}`);

    // 只有在选择了具体的节时才更新记录
    if (course.currentChapter) {
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
    }
  };

  async function getGroupList() {
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
  // 当前选中的章
  const selectedChapter = ref(null);
  // 根据选中的课程动态生成的进度选项
  const chapterOptions = ref([]);
  // 章列表
  const chaptersList = ref([]);
  // 节列表
  const sectionsList = ref([]);
  // 当前选中的用户id
  const selectedUserId = ref(null);

  const selectedGroupid = ref(null);

  const courses = ref([]);

  function claerForm() {
    selectedCourse.value = null;
    selectedProgress.value = null;
    selectedChapter.value = null;
    chapterOptions.value = [];
    chaptersList.value = [];
    sectionsList.value = [];
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

  // 处理章选择变化
  const handleChapterSelect = () => {
    if (selectedChapter.value) {
      // 根据选中的章筛选对应的节
      sectionsList.value = chapterOptions.value
        .filter(option => !option.isChapter && 
          // 查找该节所属的章
          findParentChapter(option.value) === selectedChapter.value
        )
        .map(section => {
          const parentOrder = findParentChapter(section.value);
          const parentChapter = chapterOptions.value.find(ch => ch.isChapter && ch.value === parentOrder);
          const chapterNum = parentChapter ? getChapterNumFromLabel(parentChapter.label) : 0;
          
          return {
            order: section.value,
            name: section.label.split('：')[1],
            num: getSectionNumFromLabel(section.label)
          };
        });
        
      // 如果有节，默认选中第一个
      if (sectionsList.value.length > 0) {
        selectedProgress.value = sectionsList.value[0].order;
      } else {
        selectedProgress.value = null;
      }
    } else {
      sectionsList.value = [];
      selectedProgress.value = null;
    }
  };
  
  // 辅助函数：从章节标签中提取章号
  const getChapterNumFromLabel = (label) => {
    const match = label?.match(/第(\d+)章/);
    return match ? parseInt(match[1]) : 0;
  };
  
  // 辅助函数：从章节标签中提取节号
  const getSectionNumFromLabel = (label) => {
    const match = label?.match(/第\d+章 第(\d+)节/);
    return match ? parseInt(match[1]) : 0;
  };
  
  // 查找节所属的章的order
  const findParentChapter = (sectionOrder) => {
    const section = courseChapters.value.find(ch => ch.Chapter_Order === sectionOrder);
    if (!section || section.Chapter_Priority === 0) return null;
    
    // 向前查找最近的一个章
    for (let i = section.Chapter_Order - 1; i >= 1; i--) {
      const chapter = courseChapters.value.find(
        ch => ch.Chapter_Order === i && ch.Chapter_Priority === 0
      );
      if (chapter) return chapter.Chapter_Order;
    }
    return null;
  };

  // 处理课程选择变化
  const handleCourseChange = async () => {
    if (selectedCourse.value) {
      // 获取课程章节列表
      try {
        const res = await api.get(`/course/chapter_list?Course_Id=${selectedCourse.value.course_id}`);
        if (res && res.data) {
          courseChapters.value = res.data;
          
          // 组织章节数据
          const organized = {};
          
          // 先找出所有的章（priority=0）
          const mainChapters = res.data.filter(chapter => chapter.Chapter_Priority === 0);
          
          // 为每章创建一个对象，用于存储该章下的所有节
          mainChapters.forEach(chapter => {
            organized[chapter.Chapter_Order] = {
              name: chapter.Chapter_Name,
              sections: []
            };
          });
          
          // 将节（priority=1）分配到各自的章下
          res.data.forEach(chapter => {
            if (chapter.Chapter_Priority === 1) {
              // 找到该节所属的章
              let parentChapterOrder = null;
              
              // 从该节往前查找最近的一个章
              for (let i = chapter.Chapter_Order - 1; i >= 1; i--) {
                const potentialParent = res.data.find(
                  ch => ch.Chapter_Order === i && ch.Chapter_Priority === 0
                );
                if (potentialParent) {
                  parentChapterOrder = potentialParent.Chapter_Order;
                  break;
                }
              }
              
              // 如果找到了所属的章，添加到该章的sections数组中
              if (parentChapterOrder !== null && organized[parentChapterOrder]) {
                organized[parentChapterOrder].sections.push({
                  order: chapter.Chapter_Order,
                  name: chapter.Chapter_Name
                });
              }
            }
          });
          
          // 生成章节选项
          const options = [];
          
          // 遍历每一章
          Object.keys(organized).forEach(chapterOrder => {
            const chapter = organized[chapterOrder];
            
            // 添加章本身作为一个选项
            const chapterNum = res.data.filter(
              ch => ch.Chapter_Priority === 0 && ch.Chapter_Order <= parseInt(chapterOrder)
            ).length;
            
            options.push({
              value: parseInt(chapterOrder),
              label: `第${chapterNum}章：${chapter.name}`,
              isChapter: true
            });
            
            // 添加该章下的所有节
            chapter.sections.forEach(section => {
              // 计算节号
              const sectionNum = res.data.filter(
                ch => ch.Chapter_Priority === 1 && 
                     parseInt(chapterOrder) < ch.Chapter_Order && 
                     ch.Chapter_Order <= section.order
              ).length;
              
              options.push({
                value: section.order,
                label: `第${chapterNum}章 第${sectionNum}节：${section.name}`,
                isChapter: false
              });
            });
          });
          
          // 按value值（Chapter_Order）排序
          options.sort((a, b) => a.value - b.value);
          
          chapterOptions.value = options;
          
          // 设置章列表
          chaptersList.value = mainChapters.map(chapter => {
            const chapterNum = res.data.filter(
              ch => ch.Chapter_Priority === 0 && ch.Chapter_Order <= chapter.Chapter_Order
            ).length;
            
            return {
              order: chapter.Chapter_Order,
              name: chapter.Chapter_Name,
              num: chapterNum
            };
          });
          
          // 默认选择第一个章
          if (chaptersList.value.length > 0) {
            selectedChapter.value = chaptersList.value[0].order;
            handleChapterSelect(); // 触发章选择事件以加载节
          }
        }
      } catch (error) {
        console.error("Error fetching course chapters:", error);
        chapterOptions.value = [];
        chaptersList.value = [];
        sectionsList.value = [];
        selectedChapter.value = null;
        selectedProgress.value = null;
      }
    } else {
      chapterOptions.value = [];
      chaptersList.value = [];
      sectionsList.value = [];
      selectedChapter.value = null;
      selectedProgress.value = null;
    }
  };

  // 处理编辑进度时章选择变化
  const handleChapterSelectInProgress = (user, course) => {
    // 当章选择改变时，重置节选择
    course.currentChapter = null;
  };

  // 点击确认按钮时的处理逻辑
  async function handleConfirm() {
    // 检查课程、进度和用户 ID 是否都已选中
    if (
      selectedCourse.value &&
      selectedProgress.value !== null &&
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
.progress-dialog {
  --el-dialog-bg-color: #f5f7fa;
  --el-dialog-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.progress-dialog :deep(.el-dialog__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f0f2f5;
  border-radius: 8px 8px 0 0;
}

.progress-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.progress-dialog :deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
  text-align: right;
}

.custom-select :deep(.el-input__wrapper) {
  background-color: #fff;
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
    max-height: 450px; /* 设置弹窗内容的高度，确保内容可滚动 */
    display: flex;
    flex-direction: column; /* 用户列表垂直排列 */
  }

  /* 可滚动容器 */
  .scroll-container {
    flex: 1; /* 确保滚动容器占满剩余空间 */
    overflow-y: auto; /* 垂直滚动 */
    max-height: 450px;
  }

  .scroll-container::-webkit-scrollbar {
    width: 6px;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background-color: #c0c4cc;
    border-radius: 10px;
  }

  .scroll-container::-webkit-scrollbar-track {
    background-color: #f5f7fa;
  }

  /* 每个用户项 */
  .list-item {
    display: flex;
    flex-direction: column; /* 用户内部内容垂直排列 */
    margin-bottom: 16px;
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }

  /* 用户标题 */
  .user-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #ebeef5;
  }

  .user-name {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }

  /* 进度条容器 */
  .progress-item {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;
    background-color: #f8f9fb;
  }

  .progress-title {
    margin-bottom: 10px;
  }

  .course-name {
    font-weight: 600;
    color: #409eff;
    font-size: 14px;
  }

  /* 章节信息样式 */
  .chapter-info {
    margin: 10px 0;
    padding: 8px;
    background-color: #f0f7ff;
    border-radius: 6px;
  }

  .chapter-header {
    font-size: 14px;
    color: #606266;
    margin-bottom: 5px;
  }

  .chapter-num, .section-num {
    font-weight: 600;
    color: #409eff;
    margin-right: 5px;
  }

  .chapter-name {
    font-size: 13px;
    color: #606266;
    font-style: italic;
  }

  /* 进度条 */
  .progress-bar-container {
    margin: 12px 0;
  }

  .progress-track {
    width: 100%;
    height: 8px;
    background-color: #e4e7ed;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background-color: #409eff;
    background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
    background-size: 1rem 1rem;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  /* 章节选择区域 */
  .chapter-selection {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .chapter-selection .el-select {
    flex: 1;
  }

  /* 加载状态 */
  .loading-container {
    text-align: center;
    padding: 30px;
    font-size: 16px;
    color: #909399;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .user-separator {
    height: 1px;
    width: 100%;
    background-color: #ebeef5;
    margin: 10px 0;
  }

  .no-progress {
    padding: 15px;
    text-align: center;
    color: #909399;
    font-style: italic;
    background-color: #f8f9fb;
    border-radius: 6px;
  }
</style>
  