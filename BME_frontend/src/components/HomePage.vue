<script>
import { RouterLink } from 'vue-router';
import api from '../api';

export default {
  name: 'HomePage',
  data() {
    return {
      articles: [], // 存储文章数据
    };
  },
  created() {
    this.fetchArticles();
  },
  methods: {
    async fetchArticles() {
      api({
        url: '/article/list',
        method: 'get',
      }).then((response) => {
        console.log(response.data);
        this.articles = response.data;
      })
    },
    goToArticle(articleId) {
      this.$router.push({ path: '/article', query: { Article_Id: articleId } });
    }
  },
  computed: {
    reversedArticles() {
      return this.articles.slice().reverse();
    }
  }
};
</script>

<template style="background-color: brown;">
  <div style="display: flex; justify-content: center; align-items: center;">
    <img src="../assets/Logo_NewYear.png" alt="BME Logo" width="250px" class="largeLogo"/>
    <h1 class="largeTitle">卓越工程师训练营</h1>
  </div>
  <div style="display: flex; justify-content: center; align-items: center; color: whitesmoke; font-size: 20px;">中山大学生物医学工程医工融合科创协会在线教育平台</div>
  
  <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap;">
    <h1 class="secondTitle">最新资讯</h1>
    <div>
      <!-- <el-card class="box-card" @click="$router.push('/article')">
        <template #header>
          <div class="card-header">
            <span>震惊！中山大学BME卓越工程师训练营竟然...🔥</span>
          </div>
        </template>
        <p style="margin: 0;">这里应该有一些内容...</p>
        <template #footer>2024-09-29</template>
      </el-card> -->
      
      <el-card v-for="article in reversedArticles" :key="article.Article_Id" class="box-card" @click="goToArticle(article.Article_Id)">
        <template #header>
          <div class="card-header">
            <span>{{ article.Article_Title }}</span>
          </div>
        </template>
        <p style="margin: 0;">{{ article.Article_Introduction }}</p>
        <!-- <RouterLink :to="{ path: '/article', query: { Article_Id: article.Article_Id } }"></RouterLink> -->
        <template #footer>{{ article.Article_Time }}</template>
      </el-card>
      
    </div>
  </div>
</template>

<style scoped>

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
</style>
