<script setup>
import { onMounted, ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../../api'
import { API_URL } from '../../api'
import { Star, StarFilled } from '@element-plus/icons-vue'
import StudentProgressComponent from './StudentProgressComponent.vue'
import StudentRankComponent from './StudentRankComponent.vue'

const store = useStore()  // 获取 Vuex store
const router = useRouter()  // 获取 Vue Router 实例

const courseDetails = ref(null)
const courseId = ref(router.currentRoute.value.query.id)
const courseInfo = ref([])

const formatedCourseDetails = ref([])

const difficulty = 3 // 课程难度，这里暂时写死，实际应该从后端获取

const items = [
    { label: '医学', type: 'success' },
    { label: '计算机', type: 'info' },
    { label: '人工智能', type: 'warning' },
    { label: '医疗器械', type: 'danger' },
    { label: '医学', type: 'success' },
    { label: '计算机', type: 'info' },
    { label: '人工智能', type: 'warning' },
    { label: '医疗器械', type: 'danger' }
];

const colorPalette = [
    "#b391ff", // 蓝紫色: 和谐邻近色
    "#91bdff", // 原始色: 柔和蓝色
    "#91ffde", // 蓝绿色: 清新冷色调
    "#ffcc91", // 橙黄色: 温暖对比色
    "#ff91c0"  // 玫红色: 活力点缀色
];

const randomColor = (courseName) => {
    console.log(courseName)
    // 简单哈希：将字符串转成数字和 
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
        hash = courseName.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
    }
    // 取余映射到色板 
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
};

const fetchCourseInfo = async () => {
  try {
    const res = await api({
      url: '/course/search',
      method: 'get',
      params: {
        Course_Id: courseId.value
      }
    })

    if (res.data.code === 200) {
      courseInfo.value = res.data
      console.log(courseInfo.value)
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchCourseDetails = async () => {
  try {
    const res = await api({
      url: '/course/chapter_list',
      method: 'get',
      params: {
        Course_Id: courseId.value
      }
    })
    courseDetails.value = res.data
    formatedCourseDetails.value = formatChapters(courseDetails.value)

    if (res.data.code === 200) {
      //由于后端设计问题这里还需要修改
      // console.log(courseDetails.value)
    }
  } catch (error) {
    console.error(error)
  }
}

const formatChapters = (chapters) => {
  const formattedData = [];
  let currentTitle = null;
  let titleId = 1;  // 用于给大标题添加 ID，从 1 开始

  chapters.forEach(chapter => {
    if (chapter.Chapter_Priority === 0) {
      // 大标题，开始一个新的章节，并给大标题加上 ID
      currentTitle = {
        name: chapter.Chapter_Name,
        order: chapter.Chapter_Order,
        subChapters: []  // 存储小标题
      };
      formattedData.push(currentTitle);
    } else if (chapter.Chapter_Priority === 1 && currentTitle) {
      // 小标题，添加到最近的大标题下
      currentTitle.subChapters.push({
        name: chapter.Chapter_Name,
        order: chapter.Chapter_Order
      });
    }
  });

  return formattedData;
}

const fetchDownloadUrl = async () => {
  try {
    const res = await api({
      url: '/course/book_down',
      method: 'get',
      params: {
        Course_Id: courseId.value
      }
    })

    if (res.data.code === 200) {
      console.log(res)
      await downloadBook(res)
    }
  } catch (error) {
    console.error(error)
  }
}

const downloadBook = async (res) => {
  console.log(API_URL)
  const downCode = res.data.Down_Code;
  const url = `${API_URL}/course/book_download?Down_Code=${encodeURIComponent(downCode)}`
  const URL = String(url)
  window.open(URL, '_blank')
}

const handleDownload = () => {
  fetchDownloadUrl()
}

const coverColor = computed(() => {
  // 如果没有标题，使用默认色
  return courseInfo.value?.Course_Title
    ? randomColor(courseInfo.value.Course_Title)
    : colorPalette[0];
});

function hexToRgba(hex, alpha) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(s => s + s).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
}

// 生成渐变色（可以根据 coverColor 调整深浅）
const wrapperBg = computed(() => {
  // 这里用 coverColor 作为主色，和白色做渐变
  return `linear-gradient(360deg, ${hexToRgba(coverColor.value, 0.55)} 0%, #f8f9ff 100%)`;
});

// 查询当前用户是否已经加入课程
const isEnrolled = ref(false)
const enrolledList = ref([])
const userProgress = ref() //个人进度

const getEnrollments = async () => {
  try {
    const res = await api({
      url: '/learningProgress/student',
      method: 'get',
    })

    if (res.data.code === 200) {
      // console.log(res)
      enrolledList.value = res.data.data.records
      console.log(enrolledList.value)
    }
  } catch (error) { }
}

const checkEnrollment = async () => {
  await getEnrollments()
  // console.log(courseId.value)
  const courseIdInt = parseInt(courseId.value, 10); // 转为整数
  // console.log(enrolledList.value.length)
  for (let i = 0; i < enrolledList.value.length; i++) {
    console.log(enrolledList.value[i])
    if (enrolledList.value[i].course_id === courseIdInt) {
      // 已加入课程
      isEnrolled.value = true;
      userProgress.value = enrolledList.value[i].progress;
      break;
    }
  }
}

const checkUnlock = (chapterOrder) => {
  if (userProgress.value >= chapterOrder) {
    return true;
  } else {
    return false;
  }
}

// 在组件挂载后执行
onMounted(() => {
  fetchCourseDetails()
  fetchCourseInfo()

  checkEnrollment()
})

// 方法：警告提示
const caution = () => {
  ElMessage.error('前面的内容以后再来探索吧！')
}
</script>

<template>
  <div class="course-wrapper" :style="{ background: wrapperBg }">
    <div class="course-details">
      <div class="course-info">
        <div class="course-info-left" 
        :style="{backgroundColor: courseInfo?.Course_Title ? randomColor(courseInfo.Course_Title) : colorPalette[0]}">
        {{ courseInfo.Course_Title }}</div>
        <div class="course-info-right">
          <h2 style="height: 20%;margin: 0;">
            {{ courseInfo.Course_Title }}
          </h2>
          <div class="course-description">
            {{ courseInfo.Introduction }}
          </div>
          <div class="course-bottom">
            <el-button type="primary" plain size="large" disabled="true" @click="caution()">{{ isEnrolled ? '正在学习' : '加入学习'}}</el-button>
            <el-button type="primary" size="large" @click="handleDownload()">下载内容</el-button>
          </div>
        </div>

      </div>
      <div class="course-contents">
        <div style="height: 50px;width: 90%; padding-bottom: 20px; border-bottom: solid 1px #ddd; margin-bottom: 10px;">
          <span
            style="font-size: 25px; font-weight: bold; padding-bottom: 19px; border-bottom: solid 3px #000;">目录</span>
        </div>
        <div class="course-content-card">
          <div class="course-content-item" v-for="(item, index) in formatedCourseDetails" :key="index">
            <div style="font-size: 20px; font-weight: 500; margin-bottom: 10px;">
              <span class="course-content-item-index">{{ index + 1 }}</span>
              <span style="position: relative; left: -15px">{{ item.name }}</span>
            </div>
            <div class="course-content-item-sub" v-for="(subItem, subIndex) in item.subChapters" :key="subIndex">
              <div>{{ subItem.name }}</div>
              <div>
                <el-icon>
                  <Lock />
                </el-icon>
              </div>
            </div>
          </div>
          <div
            style="display: flex; justify-content: center; align-items: center; height: 50px; margin-bottom: 20px; font-size: 15px; color: #999;">
            没有更多内容啦~</div>
        </div>
      </div>
    </div>

    <!-- 已经开始学习所展示的内容 -->
    <div v-if="isEnrolled" style="width: 300px;">
      <div class="course-process">
        <StudentProgressComponent :user-progress="userProgress" />
      </div>
      <div class="class-rank">
        <StudentRankComponent :course-id="courseId" />
      </div>
    </div>

    <!-- 未加入学习展示的内容 -->
    <div v-else style="width: 300px;">
      <div class="course-difficulty">
        <span style="margin-left: 8px; color: #888; font-size: 15px; top: 2px; position: relative;">课程难度</span>
        <div>
          <el-icon
            v-for="n in 5"
            :key="n"
            :class="n <= difficulty ? 'star-icon' : 'star-outline-icon'"
          >
            <component :is="n <= difficulty ? StarFilled : Star" />
          </el-icon>
          <span style="margin-left: 8px; color: #888; font-size: 15px; top: 2px; position: relative;">中等</span>
        </div>
      </div>
      <div class="course-period">
        <span style="width: 50%; border-right: solid 1px #ddd;">
          <div style="color: #111;">16 章 / 35 节</div>
          <div style="font-size: 13px; color:#999; margin-top: 10px;">章节数量</div>
        </span>
        <span style="width: 40%;">
          <div style="color: #111;">100 学时</div>
          <div style="font-size: 13px; color:#999; margin-top: 10px;">预计时长</div>
        </span>
      </div>
      <div class="course-tags">
        <el-tag
          v-for="item in items"
          :key="item.label"
          :type="item.type"
          effect="light"
          round
        >
          {{ item.label }}
        </el-tag>
      </div>
    </div>

  </div>

</template>

<style scoped>
.course-tags{
  display: flex;
  justify-content:first baseline;
  flex-wrap: wrap;
  gap: 8px 5px;
}
.course-period {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 20px;

  padding-left: 8px;
}
.course-difficulty{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 20px;
}
.star-icon {
  color: #FFcf00;
  font-size: 26px;
  margin-right: 2px;
  vertical-align: middle;
}
.star-outline-icon {
  color: #e0e0e0;
  font-size: 22px;
  margin-right: 2px;
  vertical-align: middle;
}

.course-wrapper {
  padding-top: 20px;
  min-height: 950px;
  /* background-color: #eeefff; 这一行可以去掉 */
  display: flex;
  justify-content: center;
}

.course-process {
  width: 300px;
  height: 120px;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px;
  padding-bottom: 10px;

  border-radius: 16px;
  background: rgba(255,255,255,0.7);
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  backdrop-filter: blur(10px);
  transition: all 0.15s ease-in-out;

  cursor: pointer;
}
.course-process:hover {
  background: rgba(255,255,255,0.8);
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  backdrop-filter: blur(20px);

  transform: scale(1.02);
}

.course-process h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.course-details {
  display: flex;
  flex-direction: column;

  width: 750px;
  /* height: 250px; */

  margin-top: 20px;
  margin-bottom: 20px;

}

.class-rank{
  padding-right: 5px;
  width: 320px;
}

@media (max-width: 768px) {
  .course-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .course-details {
    width: 90% !important;
    /* 可以尝试加 !important 提高优先级 */
    margin-right: 0 !important;
    margin-bottom: 20px !important;
  }

  .course-process,
  .class-rank {
    /* 确保 .class-rank 也有定义，或者右侧栏的容器有统一的类名 */
    width: 90% !important;
    margin-left: 0 !important;
    margin-right: auto;
    /* 可以尝试让右侧栏在垂直堆叠时也居中 */
    margin-left: auto;

  }
}

.course-info {
  display: flex;
  flex-direction: row;
  justify-content: center;

  margin-bottom: 20px;
}

.course-info-left {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background-color: #91bdff;
  box-shadow: 0 0 12px 2px #d2dbe9;
  color: #fff;

  margin-right: 35px;
  border-radius: 10px;
  padding: 10px;

  width: 130px;
  height: 180px;
  text-align: center;

  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
}

.course-info-left::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  border-radius: 0 0 10px 10px;
}

.course-info-left:hover {
  box-shadow: 0 0 16px 2px #d0d1d2;
}

.course-info-left:hover::before {
  opacity: 1;
}

.course-info-right {
  position: relative;

  display: flex;
  flex-direction: column;

  width: 500px;
  height: 200px;
}

.course-contents {
  height: 50%;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  flex-direction: column;
  margin-top: 20px;
}

.course-bottom {
  position: absolute;
  bottom: 0;

  /* margin: 10px; */
  margin-left: 0;

  display: flex;
  justify-content: space-between;
}

.main-col {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.course-content-card {
  background-color: #ffffff;
  width: 90%;

  border-radius: 5px;
  box-shadow: #e9e9e9 0px 0px 10px 2px;

  margin-top: 20px;
}

.course-content-item {
  border-bottom: solid 1px #d1d1d1;
  margin: 20px;

  padding-bottom: 10px;
}

.course-content-item-index {
  display: inline-block;

  position: relative;
  left: -35px;
  width: 50px;
  text-align: center;
  border-radius: 50px;
  background-color: #333;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.course-content-item-sub {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #555;
  /* margin-bottom: 10px; */
  padding: 10px;

  border-radius: 5px;
  cursor: pointer;
}

.course-content-item-sub:hover {
  background-color: #ededed;
}

.course-description {
  color: #555;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-wrapper {
  display: flex;
  justify-content: center;
}
</style>
