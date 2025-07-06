<template>
  <div class="student-progress">
    <div>
      <div class="student-progress-title">个人进度</div>
      <div class="student-progress-content">上次学到：</div>
      <div class="student-progress-content">
        <span v-if="props.userProgress.chapter_name">{{ props.userProgress.chapter_name }}</span>
        <span v-if="props.userProgress.section_name"> - {{ props.userProgress.section_name }}</span>
      </div>
    </div>
    <div style="margin-left: auto;">
      <el-progress 
        type="dashboard" 
        color="#3AC263" 
        :percentage="displayPercentage">
        <template #default>
          <div class="percentage-label">{{ props.userProgress.chapter_num }} / {{ props.userProgress.chapters }}</div>
          <div class="percentage-label">已完成</div>
        </template>
      </el-progress>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, onMounted, defineProps, watch } from 'vue'
import { ref } from 'vue';

const props = defineProps({
  userProgress: {
    type: Object,
    default: () => ({
      chapters: 0,
      // 章节数量，后端传递
      section_num: 0,
      section_name: '',
      chapter_num: 0,
      chapter_name: '',
      progress: 0
    })
  }
})

// 进度百分比
const percentage = ref(0)
const displayPercentage = ref(0)
let animationFrameId = null
const animationSpeed = 5 // 数字越大动画越慢，越小越快，可自行调整

function animateToTarget(target) {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  function step() {
    if (Math.abs(displayPercentage.value - target) > 0.1) {
      displayPercentage.value += (target - displayPercentage.value) / animationSpeed
      animationFrameId = requestAnimationFrame(step)
    } else {
      displayPercentage.value = target
      animationFrameId = null
    }
  }
  step()
}

function updateProgress() {
  // 兼容后端传字符串，统一使用 chapter_num 来计算进度
  const num = Number(props.userProgress.chapter_num) || 0
  const total = Number(props.userProgress.chapters) || 1 // 避免为0
  percentage.value = Math.min(num * 100 / total, 100)
  animateToTarget(percentage.value)
}

onMounted(() => {
  updateProgress()
})

// 监听props变化，动态更新进度
watch(() => props.userProgress.chapter_num, () => {
  updateProgress()
})
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
