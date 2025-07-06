<template>
  <div class="student-progress">
    <div>
        <div class="student-progress-title">个人进度</div>
        <div class="student-progress-content">上次学到：</div>
        <div class="student-progress-content">算法初步 - C语言程序设计第二章</div>
    </div>
    <div style="margin-left: auto;">
        <el-progress 
        type="dashboard" 
        color="#3AC263" 
        :percentage="displayPercentage">
            <template #default="{ percentage }">
                <div class="percentage-label">{{ props.userProgress }} / {{ 16 }}</div>
                <div class="percentage-label">已完成</div>
            </template>
        </el-progress>
    </div>
    
    
  </div>
</template>

<script setup>
import { defineComponent, onMounted, defineProps } from 'vue'
import { ref } from 'vue';

const props = defineProps({
  userProgress: {
    type: [Number, String], // 根据你的实际类型选择
    default: 0
  }
})

const percentage = ref(props.userProgress * 100 / 16)
const displayPercentage = ref(0);
let animating = false;

function animateToTarget(target) {
  if (animating) return;
  animating = true;
  function step() {
    if (displayPercentage.value < target) {
      displayPercentage.value += Math.max((target - displayPercentage.value) / 10, 0.1);
      if (displayPercentage.value > target) displayPercentage.value = target;
      requestAnimationFrame(step);
    } else {
      displayPercentage.value = target;
      animating = false;
    }
  }
  step();
}

onMounted(() => {
  animateToTarget(percentage.value);
});
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
    width: 150px;
    margin-bottom: 5px;

    display: -webkit-box;
    -webkit-line-clamp: 2;      /* 限制为2行 */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
