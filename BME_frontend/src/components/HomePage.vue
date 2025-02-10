<script>
import { RouterLink } from 'vue-router';
import api from '../api';

export default {
  name: 'HomePage',
  data() {
    return {
      articles: [], // 存储课程数据
    };
  },
  created() {
    this.fetchCourses();
  },
  methods: {
    async fetchCourses() {
      // 模拟API请求，替换为实际API
      api({
        url: '/article/list',
        method: 'get',
      }).then((response) => {
        console.log(response.data);
        this.articles = response.data;
      })
    },
  },
};
</script>

<template>
  <div style="display: flex; justify-content: center; align-items: center;">
    <img src="../assets/Vue.svg" alt="BME Logo" width="100px"/>
    <h1 style="display: inline-block; font-size: 80px;">卓越工程师训练营</h1>
    
    
  </div>
  <div style="display: flex; justify-content: center; align-items: center; color: grey;">中山大学生物医学工程医工融合科创协会在线教育平台</div>
  
  <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap;">
    <h2 style="width: 100%; text-align: center; margin-bottom: 20px;">最新资讯</h2>
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
      
      <el-card v-for="article in articles" :key="article.Article_Id" class="box-card">
        <RouterLink :to="{ path: '/article', query: { Article_Id: article.Article_Id } }">
          <template #header>
            <div class="card-header">
              <span>{{ article.Article_Title }}</span>
            </div>
          </template>
          <p style="margin: 0;">{{ article.Article_Introduction }}</p>
          <template #footer>{{ article.Article_Time }}</template>
        </RouterLink>
      </el-card>
      
    </div>
  </div>
</template>

<style scoped>

.box-card:hover {
  transform: translateY(-3px);
  box-shadow: #cbcbcb 0px 0px 10px;
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
