<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const courseList = ref([])  // 使用 ref 来声明响应式数据

const buttons = reactive([
      { label: '硬件组', active: true },
      { label: '软件组', active: false },
      { label: '先进制造组', active: false },
]);

// 设置活动按钮的方法
const setActive = (index) => {
    buttons.forEach((button, i) => {
    button.active = i === index;
    });
};

const getCourseList = async () => {
    try {
        const res = await api({
            url: '/course/list',
            method: 'get',
        })
        courseList.value = res.data  // 将返回的数据赋值给响应式变量
    } catch (err) {
        console.error(err)
    }
}

const handleCourseClick = (courseId) => {
    console.log(courseId)
    console.log(typeof courseId)
    router.push({ path: '/study/details', query: { id: courseId } })
}

onMounted(() => {
    getCourseList()  // 在组件挂载时调用获取课程列表的方法
})
</script>

<template>
    <div class="headContainer">
        <div class="headText">探索学习路径</div>
        <div class="headGraph">学习路径</div>
    </div>
    <div class="mainContainer">
        <div class="button-group-container">
            <el-button
                v-for="(button, index) in buttons"
                :key="index"
                :type="button.active ? 'primary' : 'text'"
                class="styled-button"
                @click="setActive(index)"
            >
                {{ button.label }}
            </el-button>
        </div>
        <div style="margin-left: 10px;font-weight: normal; margin-top: 30px; margin-bottom: 10px; font-size: 20px; color: #333;">最新课程</div>
        <div class="columnContainer">
            <el-card class="boxCard" v-for="course in courseList" :key="course.Course_Id" @click="handleCourseClick(course.Course_Id)">
                <div style="width: 100%; height: 100%; display: flex; flex-wrap: wrap;">
                    <div class="bookCover">{{ course.Course_title }}</div>
                    <div class="bookInfo">
                        <div class="cardTitle">{{ course.Course_title }}</div>
                        <div class="cardText">{{ course.Course_Introduction }}</div>
                        <div class="cardFooter">共 {{ course.Course_Chapters }} 章</div>
                    </div>
                </div>
                
            </el-card>
        </div>
        <!-- <el-card class="boxCard"></el-card> -->
    </div>
</template>

<style scoped>
.headText {
    font-size: 30px;
    font-weight: bold;
    display: inline-block;

    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    
}
.headContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;

    height: 300px;
    background-color: #eeeeee;
}
.headGraph {
    font-size: 20px;
    font-weight: bold;
    display: inline-block;

    height: 100%;

}
.mainContainer {
    height: 100%;
    margin-left: 15%;
    margin-right: 15%;
    margin-top: 20px;
    margin-bottom: 20px;

    width: 100%;

    /* display: flex;
    align-items: center;
    flex-wrap: wrap; */
}
.columnContainer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    /* width: 100%; */
}
.boxCard{
    /* min-width: 390px; */
    width: 30%;
    height: 110px;

    margin: 10px;
    border-radius: 6px;

    box-shadow: 0 2px 10px 0 rgba(53, 53, 53, 0.1);
    transition: all 0.3s ease;

    cursor: pointer;
}
.boxCard:hover {
    transform: translateY(-5px);

    box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.1);

}
.cardTitle {
    font-size: 15px;
    font-weight: normal;
    height: 25%;
}
.cardText {
    font-size: 12px;
    height: 3em; /* 限制高度为两行的高度 */
    line-height: 1.5em; /* 设置行高 */
    overflow: hidden; /* 超出部分隐藏 */
    display: -webkit-box; /* 必须要用 webkit-box 才能支持 line-clamp */
    -webkit-line-clamp: 2; /* 限制为两行 */
    -webkit-box-orient: vertical; /* 垂直排列 */
    text-overflow: ellipsis; /* 添加省略号（可选） */

    margin-bottom: 20px;
    margin-top: 5px;
    color: #888;
}
.cardFooter {
    position: relative;
    
    font-size: 12px;
    height: 25%;
    color: #aaa;
}
.boxCard :deep(.el-card__body) {
    padding: 0px;
}

.bookCover{
    background-color: #91bdff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    font-weight: bold;
    width: 65px;
    height: 90px;

    border-radius: 5px;
    margin: 5px;
    padding: 5px;

    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;

    color: #fff;

    /* padding: 5px; */
}
.bookInfo{
    height: 100%;

    margin-top: 5px;
    margin-left: 5px;
}
.button-group-container {
  display: flex;
  /* justify-content: center; */
  margin-top: 30px;
  margin-left: 10px;
}

.styled-button {
  font-size: 17px;
  padding: 18px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;

  margin-right: 20px;
}

.styled-button:hover {
  background-color: #f0f0f0;
}

.styled-button:focus {
  outline: none;
}

.el-button--primary {
  background-color: #f0f0f0;
  color: #444;
  border-color: #f0f0f0;
}

.el-button--primary:hover {
  background-color: #f0f0f0;
  color: #444;

}

.el-button--text {
  background-color: transparent;
  color: #333;
  border: 1px solid transparent;
}

.el-button--text:hover {
  background-color: #f0f0f0;
  color: #444;

}
</style>