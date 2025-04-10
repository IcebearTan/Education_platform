<template>
    <el-dialog
      v-model="dialogVisible"
      title="✨ 更新公告 ✨"
      width="50%"
      :close-on-click-modal="false"
      :show-close="false"
      class="announcement-dialog"
    >
      <div class="announcement-content">
        <h3>亲爱的同学们：</h3>
        <p>此网站于4月10日晚12点完成更新，以下是本次更新内容：</p>
        <ul>
          <li>🌟 线上打卡的最大签退时间延长至 <strong>6小时</strong>，要记得好好签退哦！</li>
          <li>🔧 修改了签到系统的部分逻辑，现在重新登录会同步签到中的时间。</li>
          <li>🎉 新增了网站的更新公告，会在每次网站更新后的第一次登录时显示。</li>
        </ul>
        <p>如有任何问题，请联系以下邮箱：</p>
        <p>
          📧 <a href="mailto:caozhx8@mail2.sysu.edu.cn">caozhx8@mail2.sysu.edu.cn</a> 或
          <a href="mailto:wujj258@mail2.sysu.edu.cn">wujj258@mail2.sysu.edu.cn</a>
        </p>
      </div>
      <template #footer>
        <el-button type="primary" @click="closeDialog" class="confirm-button">我知道了</el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const dialogVisible = ref(false);
  
  // 当前公告的唯一标识
  const currentAnnouncementId = '20250410';
  
  // 检查是否需要显示公告
  const checkAndShowAnnouncement = () => {
    const storedAnnouncementId = localStorage.getItem('announcementId');
    const lastCheckedDate = localStorage.getItem('lastCheckedDate');
    const token = localStorage.getItem('token'); // 检查是否登录
    if (
      storedAnnouncementId !== currentAnnouncementId &&
      String(lastCheckedDate) <= currentAnnouncementId &&
      token
    ) {
      dialogVisible.value = true;
      localStorage.setItem('announcementId', currentAnnouncementId);
    }
  };
  
  // 关闭公告并记录已查看
  const closeDialog = () => {
    dialogVisible.value = false;
  };
  
  // 在组件挂载时检查公告
  onMounted(() => {
    checkAndShowAnnouncement();
  });
  </script>
  
  <style scoped>
  .announcement-dialog {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    background-color: #ffffff; /* 柔和的背景色 */
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
    border: 5px solid transparent;
    background-clip: padding-box;
    position: relative;
  }
  
  .announcement-content {
    text-align: left;
    color: #333;
    padding: 20px;
    border-radius: 10px;
    background-color: #ffff; /* 使用纯色背景替代渐变色 */
  }
  
  h3 {
    margin-bottom: 15px;
    color: #ff6f61; /* 突出的标题颜色 */
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