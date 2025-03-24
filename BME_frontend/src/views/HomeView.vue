<script setup>
import { RouterView, useRouter } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import api from "../api";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import { onMounted, ref } from 'vue';

const store = useStore();
const router = useRouter();

const AItext = ref('AI助手');

const handleMouseOver = () => {
  // 鼠标悬停时的处理逻辑
  AItext.value = '(^_^)';
};

const handleMouseLeave = () => {
  // 鼠标移出时的处理逻辑
  AItext.value = 'AI助手';
};

onMounted(() => {
  // 组件挂载后的逻辑，例如获取数据
});
</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header style="display: flex; justify-content: center; align-items: center; border-bottom: solid 1px #e6e6e6; padding-bottom: 1px;">
        <MenuComponent />
      </el-header>
      <el-main class="homeMainContainer">
        <RouterView />
      </el-main>
      <el-footer class="page-footer">
        <PageFooterComponent />
      </el-footer>
    </el-container>
  </div>
  <div class="AI-assistant-avatar" 
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave">{{ AItext }}</div>
</template>

<style scoped>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}

.AI-assistant-avatar {
  position: fixed;
  bottom: 60px;
  right: 60px;
  width: 75px;
  height: 75px;
  border-radius: 50%;
  /* 使用更明亮的渐变色 */
  background: linear-gradient(135deg, #734AE2, #D66BFF, #FFD86B);
  background-size: 400% 400%; /* 增加背景尺寸以实现流动效果 */
  box-shadow: 0 0 20px rgba(115, 74, 226, 0.6), 0 0 40px rgba(214, 107, 255, 0.4);
  animation: gradient-move 6s infinite, pulse 3s infinite; /* 调整动画速度 */
  cursor: pointer;
  transition: box-shadow 0.3s ease, background-size 0.3s ease, transform 0.2s ease; /* 添加过渡效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.AI-assistant-avatar:hover {
  transform: scale(1.1); /* 悬停时放大 */
  box-shadow: 0 0 30px rgba(115, 74, 226, 0.8), 0 0 60px rgba(214, 107, 255, 0.6); /* 悬停时阴影增强 */
  animation: gradient-move-faster 3s infinite, pulse 1.5s infinite; /* 悬停时动画加速 */
}

@keyframes gradient-move {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gradient-move-faster {
  0% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 50%;
  }
  50% {
    background-position: 0% 50%;
  }
  75% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 20px rgba(115, 74, 226, 0.6), 0 0 40px rgba(214, 107, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(115, 74, 226, 0.8), 0 0 60px rgba(214, 107, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 20px rgba(115, 74, 226, 0.6), 0 0 40px rgba(214, 107, 255, 0.4);
  }
}

.common-layout{
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content:space-between;

}

.footer {
  font-size: 15px;

  display: flex;
  padding: 10px;
  background-color: #f5f5f5;

  margin: 0;

  width: 100%;
  
  color: #bababa;
}

.homeMainContainer{
  /* padding-left: 20px; */
  min-height: 100vh;
  min-width: 1200px;
  /* background-color: rgba(129, 51, 33, 0.898); */
  background-color: rgb(255, 255, 255);
  
}
</style>

<style>
.el-header {
  padding: 0;
}

.page-footer {
  display: flex;
  /* justify-content: center; */
  align-items: center;
  flex-direction: column;

  padding: 10px;
  background-color: #252525;

  /* margin: 0 a; */

  width: 100%;
  min-height: 400px;
  
  color: #ffffff;
}
</style>
