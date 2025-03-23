<template>
  <div class="rank-container">
    <div class="title">出勤热榜</div>
    <div class="student-container">
        <div class="single-student-container" v-for="(user, index) in users" :key="index">
            <div :class="{'index': true, 'index-gold': index === 0, 'index-silver': index === 1, 'index-bronze': index === 2}">{{ index + 1 }}</div>
            <div class="block">
                <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <div class="username">{{ user.username }}</div>
            <div class="progress">
                <div class="label">114次</div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent } from 'vue'
import { reactive } from 'vue';

const users = reactive([
    {
        index: 1,
        username: 'Icebear',
        progress: 16,
    },
    {
        index: 2,
        username: 'Icebear2',
        progress: 15,
    },
    {
        index: 3,
        username: 'Icebear3',
        progress: 14,
    },
    {
        index: 4,
        username: 'Icebear4',
        progress: 13,
    },
    {
        index: 5,
        username: 'Icebear5',
        progress: 12,
    },
    {
        index: 6,
        username: 'Icebear6',
        progress: 11,
    },
    {
        index: 7,
        username: 'Icebear7',
        progress: 10,
    },
    {
        index: 8,
        username: 'Icebear8',
        progress: 9,
    }
])

</script>

<style scoped>
.rank-container{
    margin-left: auto;
    width: 275px;
}
.title{
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 15px;
  border-bottom: solid 3px #333;

  width: fit-content;
}
.single-student-container{
    display: flex;
    align-items: center;
    /* justify-content: space-between; */

    width: 100%;

    margin-top: 20px;
}
.block{
    display: flex;
    align-items: center;
    width: 40px;

    margin-left: 20px;
}
.block-instructor{
    display: flex;
    align-items: center;
    width: 50px;

    /* margin-bottom: 20px; */
}
.instructor-container{
    margin-bottom: 20px;

    display: flex;
    align-items: center;
}
.instructor-name{
    font-size: 18px;
    margin-left: 20px;

    color: #333;
}
.instructor-label{
    font-size: 20px;
    font-weight: bold;

    color: #FFD700;
    text-shadow: 0 0 3px #FFD700;

    margin-left: auto;
}
.index{
    font-size: 20px;
    font-weight: bold;
}
.index-gold{
    font-size: 20px;
    font-weight: bold;

    color: #FFD700;
    text-shadow: 0 0 5px #FFD700;
}
.index-silver{
    font-size: 20px;
    font-weight: bold;

    color: #C0C0C0;
    text-shadow: 0 0 5px #C0C0C0;
}
.index-bronze{
    font-size: 20px;
    font-weight: bold;

    color: #CD7F32;
    text-shadow: 0 0 5px #CD7F32;
}
.username{
    font-size: 18px;
    margin-left: 20px;

    color: #333;
}
.progress{
    margin-left: auto;

    display: flex;
    align-items: center;
}
.label{
    font-size: 15px;
    margin-right: 10px;

    color: #999;
}
</style>
