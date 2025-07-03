<template>
  <div class="student-progress">
    <div>
        <div class="student-progress-title">学习进度</div>
        <div class="student-progress-content">上次学到：</div>
        <div class="student-progress-content">算法初步 - 《C程序设计》第二章</div>
    </div>
    <el-progress type="dashboard" color="#67C23A" :percentage="percentage">
        <template #default="{ percentage }">
            <div class="percentage-label">{{ 1 }} / {{ 17 }}</div>
            <div class="percentage-label">已完成</div>
        </template>
    </el-progress>
    
  </div>
</template>

<script setup>
import { defineComponent } from 'vue'
import { ref } from 'vue';

const percentage = ref(100/17)
</script>

<style scoped>
.student-progress{
    display: flex;
}
.student-progress-title{
    font-size: 20px;
    font-weight: bold;

    margin-bottom: 10px;
    color: #444;
}
.student-progress-content{
    font-size: 15px;
    color: #777;

    margin-bottom: 5px;
}
</style>
