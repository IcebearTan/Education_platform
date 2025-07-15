<template>
    <el-dialog
      v-model="dialogVisible"
      title="✨ 更新公告 ✨"
      width="50%"
      :close-on-click-modal="false"
      :show-close="false"
      :lock-scroll="false"
      :modal="true"
      :append-to-body="true"
      class="announcement-dialog"
    >
      <div class="announcement-content">
        <h3>亲爱的同学们：</h3>
        <p>此网站于{{ updateDate }}完成重大更新，以下是本次更新内容：</p>
        <ul>
          <li v-for="(feature, index) in updateFeatures" :key="index" v-html="feature"></li>
        </ul>
        <div v-if="importantNotice" class="important-notice">
          <p><strong>📢 重要提醒：</strong></p>
          <p>{{ importantNotice }}</p>
        </div>
        <p>如有任何问题，请联系以下邮箱：</p>
        <p>
          📧 <a href="mailto:caozhx8@mail2.sysu.edu.cn">caozhx8@mail2.sysu.edu.cn</a> 或
          <a href="mailto:wujj258@mail2.sysu.edu.cn">wujj258@mail2.sysu.edu.cn</a>
        </p>
      </div>
      <template #footer>
        <div class="footer-content">
          <div class="checkbox-container">
            <el-checkbox v-model="dontShowAgain" label="以后不再显示更新公告" />
          </div>
          <div class="button-container">
            <el-button @click="closeDialog" class="cancel-button">取消</el-button>
            <el-button type="primary" @click="confirmClose" class="confirm-button">我知道了</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { getVersionInfo } from '../config/version.js';
  
  const dialogVisible = ref(false);
  const dontShowAgain = ref(false);
  
  // 获取版本信息
  const versionInfo = getVersionInfo();
  
  // 当前公告的唯一标识 - 使用配置文件中的标识
  const currentAnnouncementId = versionInfo.announcementId;
  
  // 动态获取更新内容
  const updateFeatures = computed(() => versionInfo.changelog.features || []);
  const updateDate = computed(() => versionInfo.updateDate);
  const importantNotice = computed(() => versionInfo.changelog.importantNotice);
  
  // 检查是否需要显示公告
  const checkAndShowAnnouncement = () => {
    const storedAnnouncementId = localStorage.getItem('announcementId');
    const disableAnnouncement = localStorage.getItem('disableAnnouncement');
    const token = localStorage.getItem('token'); // 检查是否登录
    
    // 如果用户选择了不再显示，则不显示公告
    if (disableAnnouncement === 'true') {
      return;
    }
    
    if (
      storedAnnouncementId !== currentAnnouncementId &&
      token
    ) {
      dialogVisible.value = true;
    }
  };
  
  // 确认关闭公告
  const confirmClose = () => {
    if (dontShowAgain.value) {
      localStorage.setItem('disableAnnouncement', 'true');
    }
    localStorage.setItem('announcementId', currentAnnouncementId);
    dialogVisible.value = false;
  };
  
  // 取消关闭公告
  const closeDialog = () => {
    dialogVisible.value = false;
    // 不保存任何设置，下次登录时还会显示
  };
  
  // 在组件挂载时检查公告
  onMounted(() => {
    checkAndShowAnnouncement();
  });
  </script>
  
  <style>
  /* 全局样式 - 隐藏遮罩层滚动条 */
  .el-overlay {
    overflow: hidden !important;
  }
  
  .el-overlay-dialog {
    overflow: hidden !important;
  }
  
  /* 防止背景滚动 */
  body.el-popup-parent--hidden {
    overflow: hidden !important;
  }
  </style>
  
  <style scoped>
  .announcement-dialog {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border: 5px solid transparent;
    background-clip: padding-box;
    position: relative;
  }
  
  /* 确保对话框本身没有滚动条 */
  .announcement-dialog :deep(.el-dialog) {
    overflow: hidden;
  }
  
  .announcement-dialog :deep(.el-dialog__body) {
    overflow: visible;
    padding: 0;
  }
  
  .announcement-content {
    text-align: left;
    color: #333;
    padding: 20px;
    border-radius: 10px;
    background-color: #ffff;
  }
  
  h3 {
    margin-bottom: 15px;
    color: #ff6f61;
    font-weight: bold;
  }
  
  ul {
    margin: 15px 0;
    padding-left: 20px;
    color: #555;
  }
  
  ul li {
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  .important-notice {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
    color: #856404;
  }
  
  .important-notice p {
    margin: 5px 0;
  }
  
  .important-notice strong {
    color: #d63031;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px 0;
  }
  
  .checkbox-container {
    flex: 1;
    text-align: left;
  }
  
  .button-container {
    display: flex;
    gap: 10px;
  }
  
  .cancel-button {
    background-color: #6c757d;
    color: white;
    border: none;
  }
  
  .cancel-button:hover {
    background-color: #5a6268;
  }
  
  a {
    color: #409eff;
    text-decoration: none;
    font-weight: bold;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  .confirm-button {
    background-color: #ff6f61;
    color: white;
    border: none;
    font-weight: bold;
  }
  
  .confirm-button:hover {
    background-color: #ff856e;
  }
  </style>