<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'; // 引入 Vue API
import { useRouter } from "vue-router"; // RouterLink 已在模板中使用，但 router 实例可能需要
import UserCenterComponent from "../components/UserCenterComponent.vue";
// AdminindexComponent 似乎没有在模板中使用，如果不需要可以移除
// import AdminindexComponent from "../components/AdminindexComponent.vue";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import MenuComponent from "../components/MenuComponent.vue";
import MobileMenuComponent from "../components/MobileMenuComponent.vue"; // 引入移动端菜单
import api from '../api';
import { ElMessage } from 'element-plus'; // 确保 ElMessage 被导入
import { Menu as IconMenu, Rank, Fold, Expand } from '@element-plus/icons-vue'; // 引入图标

const router = useRouter(); // 初始化 useRouter

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
// --- 响应式 Header 逻辑结束 ---

// --- UserCenter 原有的逻辑 ---
const username = ref(''); // 将 data 中的 username 改为 ref
const loading = ref(false);

onMounted(() => {
    // 响应式 Header 的 onMounted 逻辑
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // 原有的 created 钩子逻辑
    api({
        url: "/user/user_index",
        method: "get",
    }).catch((error) => {
        ElMessage.error('登录失效，请重新登录');
        router.push('/login');
    }).then((res) => {
        if (res.data.code == 200) {
            username.value = res.data.User_Name;
        }
    });

    // 原有的 nextTick 逻辑
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 500);
});

onUnmounted(() => {
    // 响应式 Header 的 onUnmounted 逻辑
    window.removeEventListener('resize', checkScreenSize);
});
// --- UserCenter 原有逻辑结束 ---

</script>

<template>
    <div class="common-layout">
        <el-container>
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

            <el-main style="min-height: 100vh; background-color: #fff; width: 1200px; margin: auto;" v-loading="loading"
                element-loading-background="rgba(255, 255, 255, 1)" :delay="0" element-loading-text="loading...">
                <UserCenterComponent />
            </el-main>
            <el-footer class="page-footer">
                <PageFooterComponent />
            </el-footer>
        </el-container>
    </div>
</template>


<style scoped>
/* --- Header 样式 (与 HomeView/StudyView 保持一致) --- */
.header-container {
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: solid 1px #e6e6e6;
    padding: 0;
    height: 60px;
    position: relative;
}

.desktop-menu-container {
    display: flex;
    justify-content: center;
    width: 100%;
}

.mobile-header {
    display: none;
    width: 100%;
    height: 100%;
    padding: 0 15px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mobile-logo img {
    cursor: pointer;
}

.hamburger-icon {
    display: none;
    font-size: 24px;
    cursor: pointer;
    color: #606266;
}

@media (max-width: 768px) {
    .desktop-menu-container {
        display: none;
    }

    .mobile-header {
        display: flex;
    }

    .hamburger-icon {
        display: block;
    }

    .header-container {
        justify-content: space-between;
        padding: 0 15px;
    }
}

/* --- Header 样式结束 --- */

.common-layout {
    /* background-color: #f5f5f5 */
}

.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}

.avatar {
    width: 100px;
    height: 100px;
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
</style>
<style>
.example-showcase .el-loading-mask {
    z-index: 9;
    transition: none !important;
}
</style>
