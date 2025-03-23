<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

import AttenceRankComponent from './AttenceRankComponent.vue';
import DailyAttendence from './DailyAttendence.vue';

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

// 在组件挂载时调用获取文章的方法
onMounted(() => {
  fetchArticles();
});
</script>

<template style="background-color: brown;">
  <div style="display: flex; justify-content: center; align-items: center;">
    <img src="../assets/Logo_NewYear.png" alt="BME Logo" width="250px" class="largeLogo"/>
    <h1 class="largeTitle">卓越工程师训练营</h1>
  </div>
  <div style="display: flex; justify-content: center; align-items: center; color: #666; font-size: 20px;">中山大学生物医学工程医工融合科创协会在线教育平台</div>
  
  <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap;">
    <h1 class="secondTitle">最新资讯</h1>
    <div class="content-container">
      <div style="width: 20%; margin-left: 20px;"><AttenceRankComponent /></div>
      <div style="display: flex; flex-direction: column; align-items: center;width: 80%;">
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
        </el-card>
      </div>
      <div style="width: 20%;margin-right: 20px;">
        <DailyAttendence />
      </div>
      
    </div>
    </div>
    
</template>

<style scoped>
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
  width: 100%;
  text-align: center;
  margin: 30px;
  font-size: 30px;

  color: rgb(244, 203, 138);
}

.largeLogo{
  cursor: pointer;
  transition: transform 1s ease-in-out;

  border-radius: 50%;
}
.largeLogo:hover {
  transform: rotate(360deg);
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
