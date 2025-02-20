<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MenuComponent from '../components/MenuComponent.vue'
import api from '../api'
import StudentProgressComponent from './studentProgressComponent.vue'
import StudentRankComponent from './StudentRankComponent.vue'

const store = useStore()  // 获取 Vuex store
const router = useRouter()  // 获取 Vue Router 实例

const courseDetails = ref(null)
const courseId = ref(router.currentRoute.value.query.id)
const courseInfo = ref([])

const formatedCourseDetails = ref([])
// Number(router.currentRoute.value.query.id)

// 页面挂载时调用的函数，类似 Vue 2 中的 created()
// const fetchUserData = async () => {
//   try {
//     const res = await api({
//       url: '/user/user_index',
//       method: 'get',
//     })

//     if (res.data.code === 200) {
//       // console.log(res)
//       store.dispatch('setUser', res.data)  // 将用户信息保存到 Vuex
//     }
//   } catch (error) {
//     ElMessage.error('登录失效，请重新登录')
//     router.push('/login')  // 跳转到登录页面
//   }
// }

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

const donwloadBook = async () => {
  try {
    const res = await api({
      responseType: 'blob',
      url: '/course/book_down',
      method: 'get',
      params: {
        Course_Id: courseId.value
      }
    })
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'manual_pc_template');  // 下载文件名称
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (res.data.code === 200) {
      console.log(res)
    }
  } catch (error) {
    console.error(error)
  }
}

const downloadFile = () => {
  api.get({path: '/course/book_down', params: { Course_Id: courseId.value }})
  .then(response => {
    // 假设响应是一个文件，处理文件下载
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'manual_pc_template');  // 下载文件名称
    document.body.appendChild(link);
    link.click();
    link.remove();
  })
  .catch(error => console.error('Download error:', error));
}


const handleFileDownload = (blobData, fileName) => {
  // 创建 Blob 对象
  const blob = new Blob([blobData], { type: blobData.type });

  // 创建临时下载链接
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  // 设置下载属性（文件名）
  link.setAttribute('download', fileName || 'downloaded_file.ext');

  // 触发下载
  document.body.appendChild(link);
  link.click();

  // 清理资源
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

const handleDownload = () => {
  donwloadBook()
}

// 在组件挂载后执行
onMounted(() => {
  // courseId.value = router.value.quer.id

  fetchCourseDetails()
  fetchCourseInfo()
})

// 方法：警告提示
const caution = () => {
  ElMessage.error('前面的内容以后再来探索吧！')
}
</script>

<template>
  <div class="course-wrapper">
    <div class="course-details">
      <div class="course-info">
        <div class="course-info-left" style="">{{ courseInfo.Course_Title }}</div>
        <div class="course-info-right">
          <h2 style="height: 20%;margin: 0;">
            {{ courseInfo.Course_Title }}
          </h2>
          <div class="course-description">
            {{ courseInfo.Introduction }}
          </div>
          <div class="course-bottom">
            <el-button type="primary" plain size="large" @click="caution()">加入学习</el-button>
            <el-button type="primary" size="large" @click="handleDownload()">下载内容</el-button>
          </div>
        </div>
        
      </div>
      <div class="course-contents">
        <div style="height: 50px;width: 90%; padding-bottom: 20px; border-bottom: solid 1px #ddd; margin-bottom: 10px;">
          <span style="font-size: 25px; font-weight: bold; padding-bottom: 19px; border-bottom: solid 3px #000;">目录</span>
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
                <el-icon><Lock /></el-icon>
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; height: 50px; margin-bottom: 20px; font-size: 15px; color: #999;">没有更多内容啦~</div>
        </div>
      </div>
    </div>

    <div>
      <div class="course-process">
        <StudentProgressComponent />
      </div>
      <div class="class-rank">
        <StudentRankComponent />
      </div>
    </div>
    
  </div>
    
</template>

<style scoped>

.course-wrapper {
  
}

.course-process{
  width: 300px;
  height: 120px;
  margin-top: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  padding-bottom: 10px;
  background-color: #fff;
}

.course-details {
  display: flex;
  flex-direction: column;

  width: 750px;
  /* height: 250px; */

  margin-top: 20px;
  margin-bottom: 20px;
  
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
  background-color: #91bdff;
  box-shadow: 0 0 15px 2px #d2dbe9;
  color: #fff;

  margin-right: 35px; 
  border-radius: 10px;
  padding: 10px;

  width: 130px;
  height: 180px;
  text-align: center;
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
}

.course-bottom{
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

.course-content-card{
  background-color: #ffffff;
  width: 90%;

  border-radius: 5px;
  box-shadow: #e9e9e9  0px 0px 12px 2px;

  margin-top: 15px;
}

.course-content-item{
  border-bottom: solid 1px #d1d1d1;
  margin: 20px;

  padding-bottom: 10px;
}
.course-content-item-index{
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
.course-content-item-sub{
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #555;
  /* margin-bottom: 10px; */
  padding: 10px;

  border-radius: 5px;
  cursor: pointer;
}
.course-content-item-sub:hover{
  background-color: #ededed;
}

.course-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-wrapper {
  display: flex;
  justify-content: center;

  /* background: linear-gradient(
    135deg, 
    #dee7ff 0%,      
    #dce6ff 30%,     
    #ffffff 100%     
  );
  background-size: 100% 100%;
  box-shadow: inset 0 8px 32px rgba(255, 255, 255, 0.15);  */
}
</style>
