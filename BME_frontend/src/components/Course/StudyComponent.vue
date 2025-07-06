<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
// import api from '../../../api'
// import LearningPathComponent from './LearningPathComponent.vue'
import api from '../../api';
import LearningPathComponent from './LearningPathComponent.vue'

const router = useRouter()

const colorPalette = [
    "#b391ff", // 蓝紫色: 和谐邻近色
    "#91bdff", // 原始色: 柔和蓝色
    "#91ffde", // 蓝绿色: 清新冷色调
    "#ffcc91", // 橙黄色: 温暖对比色
    "#ff91c0"  // 玫红色: 活力点缀色
];

const randomColor = (courseName) => {
    // 简单哈希：将字符串转成数字和 
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
        hash = courseName.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
    }
    // 取余映射到色板 
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
};

const courseList = ref([])  // 使用 ref 来声明响应式数据

const buttons = reactive([
    { label: '全部课程', active: true },
    { label: '硬件组', active: false },
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
        console.log(courseList.value)

    } catch (err) {
        console.error(err)
    }
}

const handleCourseClick = (courseId) => {
    console.log(courseId)
    console.log(typeof courseId)
    router.push({ path: '/study/details', query: { id: courseId } })
}

// 计算属性：根据按钮过滤课程
const filteredCourses = computed(() => {
    const activeBtn = buttons.find(btn => btn.active);
    if (!activeBtn || activeBtn.label === '全部课程') {
        return courseList.value;
    }
    // 假设每个课程有 Group 字段
    return courseList.value.filter(course => course.Course_Tags === activeBtn.label);
});

const hoverCourse = ref(null)
const hoverPosition = ref({ x: 0, y: 0 })

const handleMouseEnter = (course, event) => {
    hoverCourse.value = course;
    const cardRect = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = 320; // 估算悬浮框宽度（px），可根据实际调整
    const gap = 10; // 间距

    // 判断右侧空间是否足够
    if (window.innerWidth - cardRect.right > tooltipWidth + gap) {
        // 右侧空间足够，展示在右侧
        hoverPosition.value = {
            x: cardRect.right + gap,
            y: cardRect.top
        }
    } else {
        // 右侧空间不够，展示在左侧
        hoverPosition.value = {
            x: cardRect.left - tooltipWidth - gap,
            y: cardRect.top
        }
    }
}
const handleMouseLeave = () => {
    hoverCourse.value = null
}

onMounted(() => {
    getCourseList()  // 在组件挂载时调用获取课程列表的方法
})
</script>

<template>
    <div class="headContainer">
        <!-- 这里强制设置了缩放 -->
        <div style="min-width: 1500px;">
            <LearningPathComponent />
        </div>

    </div>
    <div class="mainContainer">
        <div style="width: 1300px;">
            <div class="button-group-container">
                <el-button v-for="(button, index) in buttons" :key="index" :type="button.active ? 'primary' : 'text'"
                    class="styled-button" @click="setActive(index)">
                    {{ button.label }}
                </el-button>
            </div>
        </div>

        <div class="columnContainer">
            <template v-if="filteredCourses.length === 0">
                <el-card style="width: 100%; text-align: center; box-shadow: 0 0 0 0 ; border: none;">
                    <div>暂时没有课程哦╮(╯▽╰)╭</div>
                </el-card>
            </template>
            <template v-else>
                <el-card class="boxCard" v-for="course in filteredCourses" :key="course.Course_Id"
                    @click="handleCourseClick(course.Course_Id)"
                    @mouseenter="handleMouseEnter(course, $event)"
                    @mouseleave="handleMouseLeave">
                    <div style="width: 100%; height: 100%; display: flex;">
                        <div class="bookCover" :style="{ backgroundColor: randomColor(course.Course_title) }">{{ course.Course_title }}</div>
                        <div class="bookInfo">
                            <div class="cardTitle">{{ course.Course_title }}</div>
                            <div class="cardText">{{ course.Course_Introduction }}</div>
                            <div class="cardFooter">共 {{ course.Course_Chapters }} 章</div>
                        </div>
                    </div>
                </el-card>

                <transition name="fade-tooltip">
                    <div
                        v-if="hoverCourse"
                        class="course-tooltip"
                        :style="{
                        left: hoverPosition.x + 20 + 'px',
                        top: hoverPosition.y + 20 + 'px'
                        }"
                    >
                        <div class="tooltip-title">{{ hoverCourse.Course_title }}</div>
                        <div class="tooltip-intro">{{ hoverCourse.Course_Introduction }}</div>
                        <div class="tooltip-footer">共 {{ hoverCourse.Course_Chapters }} 章</div>
                    </div>
                </transition>
            </template>
        </div>
    </div>
</template>

<style scoped>
.course-tooltip {
    position: fixed;
    z-index: 9999;
    min-width: 220px;
    max-width: 300px;
    padding: 18px 22px;
    border-radius: 16px;
    background: rgba(255,255,255,0.7);
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    backdrop-filter: blur(10px);
    color: #333;
    pointer-events: none;
    transition: opacity 0.2s;
    font-size: 15px;
    /* 防止超出屏幕 */
    word-break: break-all;
}

.tooltip-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
}

.tooltip-intro {
    font-size: 14px;
    margin-bottom: 10px;
    color: #666;
}

.tooltip-footer {
    font-size: 13px;
    color: #888;
}
.fade-tooltip-enter-active, .fade-tooltip-leave-active {
  transition: opacity 0.25s;
}
.fade-tooltip-enter-from, .fade-tooltip-leave-to {
  opacity: 0;
}
.fade-tooltip-enter-to, .fade-tooltip-leave-from {
  opacity: 1;
}

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
    width: 100%;

    height: 300px;
    background-color: #f5f4f2;
    background-image: 
        repeating-radial-gradient(circle, rgb(255, 255, 255) 1px, transparent 3px, transparent 18px);
    /* 1px为点大小，3px为点边界，18px为点间距，可根据需要调整 */
    transition: 1s ease-in-out;
    
}
.headContainer:hover{
    background-size: 180px 180px;
}

.headGraph {
    font-size: 20px;
    font-weight: bold;
    display: inline-block;

    height: 100%;

}

.mainContainer {
    height: 100%;
    /* margin-left: 15%;
    margin-right: 15%; */
    margin-top: 20px;
    margin-bottom: 20px;

    /* width: 100%; */

    /* display: flex;
    align-items: center;
    flex-wrap: wrap; */

    display: flex;
    flex-direction: column;
    align-items: center;

    overflow: hidden;
}

.columnContainer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    width: 1300px;

    margin-top: 25px;
}

.boxCard {
    width: 31%;
    height: 110px;
    margin: 10px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.07), 0 1.5px 8px 0 rgba(53,53,53,0.04);
    transition: box-shadow 0.22s cubic-bezier(.4,0,.2,1), transform 0.22s cubic-bezier(.4,0,.2,1);
    cursor: pointer;
    border: 1px solid #f3f6fa;
}

.boxCard:hover {
    transform: translateY(-6px) scale(1.025);
    box-shadow: 0 8px 32px 0 rgba(64, 158, 255, 0.13), 0 2px 12px 0 rgba(53,53,53,0.08);
    border: 1px solid #e0eaff;
    background: #fafdff;
}

/* 媒体查询：当屏幕宽度小于等于 768px 时 (竖屏模式) */
@media (max-width: 768px) {
    /* .mainContainer 的调整如果 StudyComponent 内部有这个类，也一并移动 */
    /* 如果 .mainContainer 是 StudyView 的，则保留在 StudyView */
    /* .mainContainer {
    margin-left: 0;
    margin-right: 0;
    padding-left: 10px;
    padding-right: 10px;
    box-sizing: border-box;
  } */

    .columnContainer {
        /* 确保这个类名与 StudyComponent.vue 中包裹卡片的容器一致 */
        flex-direction: column !important;
        /* 关键：改为纵向排列, !important 增加优先级以防万一 */
        align-items: center !important;
        /* 让卡片在纵向排列时居中 */
        width: 100% !important;
        /* 竖屏时占满父容器宽度 */
    }

    .boxCard {
        /* 确保这个类名与 StudyComponent.vue 中的卡片一致 */
        width: 90% !important;
        /* 竖屏时卡片宽度 */
        max-width: 400px !important;
        margin: 10px 0 !important;
        /* 调整上下外边距 */
    }
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
    height: 3em;
    /* width: 95%; */
    /* 限制高度为两行的高度 */
    line-height: 1.5em;
    /* 设置行高 */
    overflow: hidden;
    /* 超出部分隐藏 */
    display: -webkit-box;
    /* 必须要用 webkit-box 才能支持 line-clamp */
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    /* 添加省略号（可选） */

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

.bookCover {
    /* background-color: #91bdff; */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    font-weight: bold;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    min-width: 65px;
    max-width: 65px;
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

.bookInfo {
    height: 100px;
    width: 75%;
    margin-top: 5px;
    margin-left: 5px;
}

.button-group-container {
    display: flex;
    /* justify-content: center; */
    margin-top: 30px;
    margin-left: 10px;
    margin-right: auto;
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