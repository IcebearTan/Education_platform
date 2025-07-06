<script setup>// <--- 注意这里是 setup
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";
import MobileMenuComponent from "../components/MobileMenuComponent.vue";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import ArticleDetailComponent from "../components/Article/ArticleDetailComponent.vue";
import { Expand } from '@element-plus/icons-vue'; // 只导入 Expand，因为模板中只用了它

// api 的导入如果 ArticleView 本身不直接调用，可以考虑移除
// import api from '../api';

const route = useRoute();
const router = useRouter();
const Article_Id = ref(route.query.Article_Id);

// --- 响应式 Header 逻辑 ---
const isMobile = ref(window.innerWidth <= 768);
const isMobileMenuOpen = ref(false);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    isMobileMenuOpen.value = false;
  }
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

onMounted(() => {
  console.log("Article ID from route query (ArticleView):", Article_Id.value);
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
// --- 响应式 Header 逻辑结束 ---
</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header class="header-container">
        <!-- 桌面菜单 -->
        <div v-if="!isMobile" class="desktop-menu-container">
          <MenuComponent />
        </div>
        <!-- 移动端头部 -->
        <div v-else class="mobile-header">
          <div class="mobile-logo">
            <img style="width: 40px; height: auto;" src="../assets/Logo_NewYear.png" @click="router.push('/')"
              alt="Logo" />
          </div>
          <el-icon class="hamburger-icon" @click="toggleMobileMenu">
            <Expand />
          </el-icon>
        </div>
      </el-header>

      <!-- 移动端菜单 -->
      <MobileMenuComponent v-if="isMobile && isMobileMenuOpen" @close="toggleMobileMenu" />

      <el-main class="article-main-container">
        <ArticleDetailComponent :id="Article_Id" />
      </el-main>
      <el-footer class="page-footer">
        <PageFooterComponent />
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
/* ... 你的样式保持不变 ... */
/* --- 开始：从 HomeView/StudyView 复制的 Header 相关样式 --- */
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
  /* 深灰色图标颜色 */
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

/* --- 结束：复制的 Header 相关样式 --- */


.common-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.article-main-container {
  padding: 0;
  min-height: calc(100vh - 60px);
  background: #f8f9fa;
}

.footer {
  display: flex;
  padding: 10px;
  background-color: #f5f5f5;
  margin: 0;
  width: 100%;
  color: #bababa;
}

/* 注释掉 ArticleView 原有的、可能与新 Header 冲突或不再需要的样式 */
/*
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}
.left-col, .right-col, .main-col, .article-footer, .article-header, @keyframes jumpAnimation {
  // ...
}
*/
</style>

<style>
/* 全局样式 */
.el-header {
  padding: 0 !important;
}

.page-footer {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 10px;
  background-color: #252525;
  width: 100%;
  min-height: 400px;
  color: #ffffff;
}
</style>
