<script setup>
import { defineEmits } from 'vue';

// 定义可以触发的事件
const emit = defineEmits(['close']);

// 关闭菜单的方法
const closeMenu = () => {
  emit('close'); // 触发 close 事件
};
</script>

<template>
  <div class="mobile-menu-overlay" @click.self="closeMenu"> <!-- 点击遮罩层关闭 -->
    <div class="mobile-menu">
      <div class="mobile-menu-header">
        <span>导航</span>
        <el-icon class="close-icon" @click="closeMenu"><Close /></el-icon>
      </div>
      <ul class="mobile-menu-list">
        <li><router-link to="/study" @click="closeMenu">学习</router-link></li>
        <li><router-link to="/exam" @click="closeMenu" class="disabled-link">考核</router-link></li>
        <li><router-link to="/order" @click="closeMenu" class="disabled-link">资源库</router-link></li>
        <li><router-link to="/discuss" @click="closeMenu" class="disabled-link">讨论</router-link></li>
        <!-- 可以添加登录/注册/用户中心链接 -->
         <li><router-link to="/user-center/user-info" @click="closeMenu">个人中心</router-link></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  z-index: 999; /* 确保在顶层 */
  display: flex;
  justify-content: flex-end; /* 从右侧滑出 */
}

.mobile-menu {
  width: 250px; /* 菜单宽度 */
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 18px;
  font-weight: bold;
}

.close-icon {
  cursor: pointer;
  font-size: 20px;
}

.mobile-menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 如果内容过多则滚动 */
}

.mobile-menu-list li {
  border-bottom: 1px solid #f0f0f0;
}

.mobile-menu-list li a {
  display: block;
  padding: 15px 20px;
  text-decoration: none;
  color: #303133;
  transition: background-color 0.2s ease;
}

.mobile-menu-list li a:hover {
  background-color: #f5f7fa;
}

.disabled-link {
  color: #c0c4cc;
  pointer-events: none; /* 禁止点击 */
  cursor: not-allowed;
}
</style>