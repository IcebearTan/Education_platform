<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

import AttenceRankComponent from './Attendence/AttenceRankComponent.vue';
import DailyAttendence from './Attendence/DailyAttendence.vue';
import updateAnnouncement from './updateAnnouncement.vue';

// 定义响应式数据
const articles = ref([]);

// 路由实例
const router = useRouter();

// 获取文章列表的方法
const fetchArticles = async () => {
  try {
    const response = await api({
      url: '/article/list',
      method: 'get',
    });
    articles.value = response.data;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  }
};

// 跳转到文章详情的方法
const goToArticle = (articleId) => {
  router.push({ path: '/article', query: { Article_Id: articleId } });
};

// 计算属性：倒序文章列表
const reversedArticles = computed(() => {
  return articles.value.slice().reverse();
});

const dialogVisible = ref(true);

// 在组件挂载时调用获取文章的方法
onMounted(() => {
  fetchArticles();
});
</script>

<template style="background-color: brown;">
    <updateAnnouncement />
  <div class="marquee-container">
    <div class="marquee-content">
      <span>！！由于线上打卡制作完成，请大家把自己的昵称改成真实姓名！！ 如在使用网站时发现问题，可以将问题发送至"caozhx8@mail2.sysu.edu.cn"或"wujj258@mail2.sysu.edu.cn"</span>
    </div>
  </div>
  <div style="display: flex; justify-content: center; align-items: center;">
    <img src="../assets/Logo_NewYear.png" alt="BME Logo"  class="largeLogo"/>
    <h1 class="largeTitle">卓越工程师训练营</h1>
  </div>
  <div style="width: 100%; text-align: center; font-size: 20px; color: #888; margin-top: 20px; margin-bottom: 20px;">
    中山大学生物医学工程医工融合科创协会在线教育平台
  </div>
  
  <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap;">
    
    <div class="content-container">
      <div style="width: 0%; margin-left: 20px;"></div>
      <div style="display: flex; flex-direction: column; align-items: center;width: 80%;">
        <!-- <h1 class="secondTitle">最新资讯</h1>
        <el-card v-for="article in reversedArticles" :key="article.Article_Id" @click="goToArticle(article.Article_Id)" class="article-card">
          <div slot="header" class="article-header">
            <h3 class="article-title">{{ article.Article_Title }}</h3>
          </div>
          <div class="article-body">
            <p class="article-summary">{{ article.Article_Introduction }}</p>
          </div>
          <div class="article-footer">
            <span class="publish-time">{{ article.Article_Time }}</span>
            <div class="article-stats">
              <span class="like-count"> 0</span>
              <span class="view-count"> 0</span>
            </div>
          </div>
        </el-card> 老版本-->
        <div class="news-list">
          <h1 class="news-title">最新资讯</h1>
          <div
            class="news-card"
            v-for="article in reversedArticles"
            :key="article.Article_Id"
            @click="goToArticle(article.Article_Id)"
          >
            <div class="news-card-content">
              <div class="news-card-header">
                <span class="news-card-title">{{ article.Article_Title }}</span>
                <span class="news-card-date">{{ article.Article_Time }}</span>
              </div>
              <div class="news-card-summary">{{ article.Article_Introduction }}</div>
              <div class="news-card-footer">
                <span class="news-card-action">查看详情</span>
                <span class="news-card-stats">
                  <span class="like-count">👍 0</span>
                  <span class="view-count">👀 0</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="width: 20%;margin-right: 20px; margin-top: 20px;">
        <div>
          
          <DailyAttendence /> 

        

        </div>
        <div style="margin-top: 20px;">
          <AttenceRankComponent />
        </div>
      </div>
      
    </div>
    </div>
</template>

<style scoped>
/* 全局标题字体设置 */
h1, h2 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.marquee-container {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box; /* 确保 padding/border 不会增加宽度 */

  background-color: #f0f0f0;
  color: #333;
  font-size: 16px;
  padding: 10px 0;
}

.marquee-content {
  display: inline-block;
  padding-left: 100%; /* Start the text off screen */
  animation: marquee 15s linear infinite; /* Adjust speed as needed */
}

@keyframes marquee {
  0% {
    transform: translateX(0%);
  }

  100% {
    transform: translateX(-100%);
  }
}

.content-container{
  width: 100%;
  display: flex;
}


.box-card:hover {
  transform: translateY(-3px);
  box-shadow: #cbcbcb 0px 0px 10px;
}

.largeTitle {
  display: inline-block;
  font-size: 100px;

  color: rgb(244, 203, 138);
}
.secondTitle {
  width: 880px;
  /* text-align: center; */
  margin: 30px;
  margin-left: 10px;
  margin-bottom: 20px;
  font-size: 30px;

  /* color: rgb(244, 203, 138); */
  color: #555;
}

.largeLogo{
  cursor: pointer;
  transition: transform 1s ease-in-out;

  border-radius: 50%;
  width: 250px; /* 设置容器的宽度为250px */
  height: auto; /* 保持高度自动，适应宽度 */
}
.largeLogo:hover {
  transform: rotate(360deg);
}

@media (max-width: 768px) {


  /* 调整整体布局，从三栏改垂直 */
   .content-container {
    flex-direction: column;
    align-items:center; /* 水平居中 */
    justify-content: flex-start;
    margin-top: 10px; /* 调整顶部间距 */
    width: 100%;
    min-width: 0; /* 确保没有最小宽度限制 */
    height: auto !important;
    box-sizing: border-box;
    padding-left: 1px; /* 添加少量内边距 */
    padding-right: 1px;
    overflow: hidden; /* 尝试隐藏此容器自身的溢出 */
  }

    /* 调整 Logo 和标题 */
  .largeLogo, .largeTitle, .homeMainContainer > div:first-child { /* 选择器可能需要根据实际HTML调整 */
    font-size: 0.8rem; /* 调整为适合小屏幕的大小，1.2rem可以根据需求调整 */
    width: 5rem; /* 设置容器的宽度为5rem */
    height: auto; /* 保持高度自动，适应宽度 */

  }

  /* 隐藏第二标题 "最新资讯" */
  .secondTitle {
    font-size: 0.8rem; /* 调整为适合小屏幕的大小 */
    width: 100%; /* 设置容器的宽度为5rem */
    height: auto; /* 保持高度自动，适应宽度 */
  }

  /* 隐藏文章卡片列表 */
  .article-card { /* 或者包裹这些卡片的容器 */
    font-size: 0.8rem; /* 调整为适合小屏幕的大小，1.2rem可以根据需求调整 */
    width: 8rem; /* 设置容器的宽度为5rem */
    height: auto; /* 保持高度自动，适应宽度 */
  }

   /* 确保 DailyAttendence 组件本身是可见的 */
   .content-container > div:last-child > div:first-child { 
    /* 包裹 DailyAttendence 的 div */
      display: block; /* 或者 flex 等，确保它不被隐藏 */
      margin: 0 auto; /* 居中 */
   }

  .calendar-container {
  position: relative;
  width: 100%;
  height: auto !important;
  min-height: 0 !important;
  padding: 10px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }


  /* 打卡组件容器 */
  .content-container > div:last-child {
    width: 100% !important; /* 宽度占满父容器 这个important要写 ，因为外部设置了宽屏模式下这一列只占20%*/
    max-width: 1200px; /* 可以设置一个最大宽度，让它在稍大窄屏上居中 */
    
    margin: 0 0 20px 0; /* 上下间距，左右自动居中 */
    margin-right: 20px; /* 移除右边距 */
    margin-left: 20px; /* 移除左边距 */
    order: -1; /* 移到顶部 */
    box-sizing: border-box;
  }

  .rank-container {
    width: 90%;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 auto; /* 水平居中 */
  }



}

</style>

<style>
.box-card {
  margin-bottom: 20px !important;
  width: 880px;
  border-radius: 10px !important;

  cursor: pointer;
}

.el-card :deep(.el-card__body) {
  padding: 10px !important;
}

.article-card {
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  margin: 15px;
  width: 880px;
  /* min-height: 100px; */

  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 3px 15px rgba(255, 255, 255, 0.509);
}

.article-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.article-body {
  padding: 10px 0;
}

.article-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.publish-time {
  font-style: italic;
}

.article-stats {
  display: flex;
  gap: 10px;
}

.like-count,
.view-count {
  display: flex;
  align-items: center;
}

.like-count::before {
  content: '👍';
  margin-right: 5px;
}

.view-count::before {
  content: '👀';
  margin-right: 5px;
}
</style>

<style scoped>
.news-title {
  width: 100%;
  text-align: left;
  font-size: 28px;
  font-weight: 700;
  color: #222;
  margin: 32px 0 18px 0;
  margin-left: 10px;
  letter-spacing: 1px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 880px;
}

.news-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  padding: 0;
  border: none;
  overflow: hidden;
  position: relative;
}

.news-card:hover {
  box-shadow: 0 8px 32px rgba(0,0,0,0.16);
  transform: translateY(-4px) scale(1.01);
}

.news-card-content {
  padding: 22px 26px 14px 26px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.news-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.news-card-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  flex: 1;
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-card-date {
  font-size: 13px;
  color: #aaa;
  font-weight: 400;
  min-width: 80px;
  text-align: right;
}

.news-card-summary {
  font-size: 15px;
  color: #555;
  margin-bottom: 6px;
  line-height: 1.7;
  min-height: 28px;
}

.news-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.news-card-action {
  color: #409eff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.news-card-action:hover {
  color: #1867c0;
  text-decoration: underline;
}

.news-card-stats {
  display: flex;
  gap: 14px;
  color: #bbb;
  font-size: 14px;
}

@media (max-width: 900px) {
  .news-list {
    max-width: 100%;
    padding: 0 4px;
  }
  .news-card-content {
    padding: 12px 6px 10px 6px;
  }
  .news-title {
    font-size: 18px;
    margin: 14px 0 8px 0;
  }
  .news-card-title {
    font-size: 15px;
  }
  .news-card-summary {
    font-size: 13px;
  }
  .news-card-action, .news-card-stats {
    font-size: 12px;
  }
}
</style>
