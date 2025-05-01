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
          <li>🌟 修改了前台登陆样式，各位如果有时间可以去看看捏 </li>
          <li>🔧 完成了个人主页的<strong>我的小组</strong>板块</li>
          <li>✨ 新增了更新公告模块</li>
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
  const currentAnnouncementId = '2025-04-20';
  
  // 检查是否需要显示公告
  const checkAndShowAnnouncement = () => {
    const storedAnnouncementId = localStorage.getItem('announcementId');
    const token = localStorage.getItem('token'); // 检查是否登录
    if (!token) return; // 如果没有登录，则不显示公告
    const tokenCreateDate = getTokenCreateDate(token); // 获取token创建日期
    console.log(tokenCreateDate);
    
    const lastRegisteredDate = tokenCreateDate ? new Date(tokenCreateDate.replace(/-/g, '/')) : null;
    const currentAnnouncementDate = new Date(currentAnnouncementId.replace(/-/g, '/'));
    
    if (
      ((storedAnnouncementId !== currentAnnouncementId) &&
      (!lastRegisteredDate || lastRegisteredDate < currentAnnouncementDate)
    ) || !storedAnnouncementId) {
      dialogVisible.value = true;
      localStorage.setItem('announcementId', currentAnnouncementId);
    }
    
  };

  function getTokenCreateDate(token) {
  if (!token) return '';
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    if (!decoded.iat) return '';
    const date = new Date(decoded.iat * 1000);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch (e) {
    return '';
  }
}
  
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