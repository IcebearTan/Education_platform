<script setup>
import { RouterView, useRouter } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import api from "../api";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import FeedbackBubble from "../components/Home/FeedbackBubble.vue";

import MobileMenuComponent from "../components/MobileMenuComponent.vue";//添加这个竖屏版本的菜单
import { Menu as Expand } from '@element-plus/icons-vue'; // 确保导入了 Rank
import { ref, onMounted, onUnmounted } from 'vue';//这行新的导入记得不要重复导入

const store = useStore();
const router = useRouter();

////////新增竖屏检测和组件初始化以及非竖屏销毁//////////////////////////////////////////////////
const isMobile = ref(window.innerWidth <= 768); // 初始检测
const isMobileMenuOpen = ref(false); // 控制移动菜单的显示

// 更新屏幕尺寸状态
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    isMobileMenuOpen.value = false; // 切换到桌面时关闭移动菜单
  }
};
// 更新屏幕尺寸状态
onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});

// 切换移动菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
//////////////////////////////////////////////////////////////////////////////////////////////////

</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header class="header-container">
        <!-- 桌面菜单 -->
        <div v-if="!isMobile" class="desktop-menu-container">
          <MenuComponent />
        </div>
        <!-- 移动端汉堡图标 -->
        <div v-else class="mobile-header">
          <!-- Logo (保持在左侧) -->
          <div class="mobile-logo">
            <img style="width: 40px; height: auto;" src="../assets/Logo_NewYear.png" @click="router.push('/')" />
          </div>
          <!-- 汉堡按钮 (放在右侧) -->
          <el-icon class="hamburger-icon" @click="toggleMobileMenu">
            <Expand />
          </el-icon>
        </div>
      </el-header>
      <!-- 移动端菜单 (条件渲染) -->
      <MobileMenuComponent v-if="isMobile && isMobileMenuOpen" @close="toggleMobileMenu" />

      <el-main class="homeMainContainer">
        <RouterView />
      </el-main>
      <el-footer class="page-footer">
        <PageFooterComponent />
      </el-footer>
    </el-container>
  </div>

  <!-- 反馈气泡组件 -->
  <FeedbackBubble />
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: center;
  /* 桌面居中 */
  align-items: center;
  border-bottom: solid 1px #e6e6e6;
  padding: 0;
  /* 移除默认内边距 */
  height: 60px;
  /* 固定高度 */
  position: relative;
  /* 为了汉堡图标定位 */
}

.desktop-menu-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.mobile-header {
  display: none;
  /* 默认隐藏 */
  width: 100%;
  height: 100%;
  padding: 0 15px;
  /* 左右内边距 */
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  /* Logo 左，图标右 */
  align-items: center;
}

.mobile-logo img {
  cursor: pointer;
}

.hamburger-icon {
  display: none;
  /* 默认隐藏 */
  font-size: 24px;
  /* 图标大小 */
  cursor: pointer;
  color: #606266;
  /* 图标颜色 */
}

/* 媒体查询：当屏幕宽度小于等于 768px 时 */
@media (max-width: 768px) {
  .desktop-menu-container {
    display: none;
    /* 隐藏桌面菜单 */
  }

  .mobile-header {
    display: flex;
    /* 显示移动端头部 */
  }

  .hamburger-icon {
    display: block;
    /* 显示汉堡图标 */
  }

  .header-container {
    justify-content: space-between;
    /* 移动端两端对齐 */
    padding: 0 15px;
    /* 移动端内边距 */
  }
}

.common-layout {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

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

.homeMainContainer {
  /* padding-left: 20px; */
  min-height: 100vh;
  min-width: 0px;
  padding: 0;
  /* 宽度自适应 */
  /* background-color: rgba(129, 51, 33, 0.898); */
  background-color: rgb(255, 255, 255);

  box-sizing: border-box;
  /*padding 不会撑大容器宽度*/

}
</style>

<style>
.el-header {
  padding: 0 !important;
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
