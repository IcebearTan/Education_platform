<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MenuComponent from '../components/MenuComponent.vue'
import api from '../api'

const store = useStore()  // 获取 Vuex store
const router = useRouter()  // 获取 Vue Router 实例

const courseDetails = ref(null)
const courseId = ref(router.currentRoute.value.query.id)

const formatedCourseDetails = ref([])
// Number(router.currentRoute.value.query.id)

// 页面挂载时调用的函数，类似 Vue 2 中的 created()
const fetchUserData = async () => {
  try {
    const res = await api({
      url: '/user/user_index',
      method: 'get',
    })

    if (res.data.code === 200) {
      // console.log(res)
      store.dispatch('setUser', res.data)  // 将用户信息保存到 Vuex
    }
  } catch (error) {
    ElMessage.error('登录失效，请重新登录')
    router.push('/login')  // 跳转到登录页面
  }
}

const fetchCourseDetails = async () => {
  console.log(typeof courseId.value)
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
    console.log(formatedCourseDetails.value)

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

// 在组件挂载后执行
onMounted(() => {
  // courseId.value = router.value.quer.id

  fetchUserData()
  fetchCourseDetails()
})

// 方法：警告提示
const caution = () => {
  ElMessage.error('前面的内容以后再来探索吧！')
}
</script>

<template>
  <div class="course-wrapper">
      <el-row style="width: 100%;">
        <el-col :span="4" class="left-col"></el-col>
        <el-col :span="16" class="main-col">
          <el-row>
            <el-col :span="16">
              <div class="course-details">
                <el-row style="width: 90%; margin: 0 auto;">
                  <el-col :span="7">
                    <div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 30px; background-color: #eee; margin-right: 35px; border-radius: 10px;">
                      暂无图片
                    </div>
                  </el-col>
                  <el-col :span="17">
                    <h2 style="height: 20%;margin-bottom: 0;">
                      C语言程序设计
                    </h2>
                    <div class="course-description">
                      C语言是许多现代编程语言的基础，掌握C语言可以帮助理解其他语言。同时C语言强调对计算机底层的控制，能增强逻辑思维和问题解决能力。在生物医疗电子中，许多系统和应用程序是用C语言编写的，学习它能够为未来的开发打下坚实的基础。总之，学习C语言，是走进编程世界的重要一步。
                      学习资料：这一部分采用课内外结合的学习方式，依照课内进度，以《C程序设计》为基础，结合卓越工程师训练营系列的《C语言程序设计与应用》和课外题目进行，内容以大纲为基础，以分组汇报的方式进行灵活安排和考查，同时提供学员交流空间。
                    </div>
                    <div class="course-bottom">
                      <el-button type="primary" size="large" @click="caution()">加入学习</el-button>
                    </div>
                    
                  </el-col>
                </el-row>
              </div>
              <div class="course-contents">
                <div style="height: 50px;width: 90%; padding-bottom: 20px; border-bottom: solid 1px #ddd; margin-bottom: 10px;">
                  <span style="font-size: 25px; font-weight: bold; padding-bottom: 19px; border-bottom: solid 3px #000;">目录</span>
                </div>
                <div class="course-content-card">
                  <div class="course-content-item" v-for="(item, index) in formatedCourseDetails" :key="index">
                    <div style="font-size: 20px; font-weight: 500; margin-bottom: 10px;">
                      <span style="margin-right: 10px;">{{ index + 1 }}</span>
                      <span>{{ item.name }}</span>
                    </div>
                    <div class="course-content-item-sub" v-for="(subItem, subIndex) in item.subChapters" :key="subIndex">{{ subItem.name }}<span>未解锁</span></div>
                  </div>
                  <div style="display: flex; justify-content: center; align-items: center; height: 50px; margin-bottom: 20px;">没有更多内容啦~</div>
                  
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="course-process">
                课程进度:0/17
              </div>
              <div class="course-class">
                <div>导师：Jie Luo</div>
                <div>
                  同班同学<div>Icebear</div><div>Labor</div>
                </div>
              </div>
            </el-col>
          </el-row>
          
        </el-col>
        <el-col :span="4" class="right-col"></el-col>
      </el-row>
    </div>
</template>

<style scoped>

.course-wrapper {
  
  min-height: 100vh;
  display: flex;
  justify-content: space-between;
  
  
}

.left-side {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 50%;
  height: 100%;
}

.course-details {
  display: flex;
  /* justify-content: center;
  align-items: center; */
  width: 100%;
  height: 250px;

  margin-top: 20px;
  margin-bottom: 20px;
  /* background-color: #f5f5f5; */
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

  margin: 10px;
  margin-left: 0;
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
  box-shadow: #d1d1d1  0px 0px 12px 2px;

  margin-top: 15px;
}

.course-content-item{
  border-bottom: solid 1px #d1d1d1;
  margin: 20px;

  padding-bottom: 10px;
}

.course-content-item-sub{
  display: flex;
  justify-content: space-between;
  font-size: 16px;
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
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.left-col {
  /* background-color: #f5f5f5; */
  text-align: center;
  padding: 10px;

  height: 400px;

  font-size: 100px;
  font-weight: 900;
}

.right-col {
  /* background-color: #f5f5f5; */
  text-align: center;
  padding: 10px;

  height: 400px;

  font-size: 100px;
  font-weight: 900;
}
</style>
