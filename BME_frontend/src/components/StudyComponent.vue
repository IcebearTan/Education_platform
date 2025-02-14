<script>
import { RouterLink } from 'vue-router';
import api from '../api';

export default {
    data() {
        return {
            courseList: []
        }
    },
    methods: {
        async getCourseList() {
            await api({
                url: '/course/list',
                method: 'get',
            }).then(res => {
                this.courseList = res.data;
                console.log(this.courseList);
            }).catch(err => {
                console.log(err);
            })
        }
    },
    mounted() {
        this.getCourseList();
    },
}
</script>

<template>
    <div class="headContainer">
        <div class="headText">探索学习路径</div>
        <div class="headGraph">学习路径</div>
    </div>
    <div class="mainContainer">
        <h2 style="margin-left: 10px;font-weight: 500;">最新课程</h2>
        <div class="columnContainer">
            <el-card class="boxCard" v-for="course in courseList" :key="course.Course_Id" @click="$router.push('/study/details')">
                <el-row>
                    <el-col :span="6">
                        暂无图片
                    </el-col>
                    <el-col :span="18">
                        <div class="cardTitle">{{ course.Course_title }}</div>
                        <div class="cardText">{{ course.Course_Introduction }}</div>
                        <div class="cardFooter">共 {{ course.Course_Chapters }} 章</div>
                    </el-col>
                </el-row>
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

    /* display: flex;
    align-items: center;
    flex-wrap: wrap; */
}
.columnContainer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}
.boxCard{
    width: 30%;
    height: 110px;

    margin: 10px;
    border-radius: 6px;
    /* overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; */

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
    font-weight: bold;
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
}
.cardFooter {
    position: relative;
    
    font-size: 12px;
    height: 25%;
}
.boxCard :deep(.el-card__body) {
    padding: 0px;
}
</style>