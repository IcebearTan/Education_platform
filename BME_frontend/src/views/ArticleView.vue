<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router"; // 用来获取当前路由
import MenuComponent from "../components/MenuComponent.vue";
import PageFooterComponent from "../components/PageFooterComponent.vue";

import api from '../api';

export default {
  name: "HomeView",
  components: {
    MenuComponent,
    PageFooterComponent
  },
  setup() {
    const route = useRoute(); // 获取当前路由
    const article = ref(''); // 使用 ref 创建响应式数据

    // 获取文章
    const getArticle = async () => {
      try {
        const response = await api({
          method: 'get',
          url: '/article',
          params: {
            Article_Id: route.query.Article_Id // 从路由查询参数获取Article_Id
          }
        });
        console.log(response.data);
        article.value = JSON.parse(response.data.html_content); // 更新响应式数据
        // console.log(article.value.html_content);
      } catch (error) {
        console.error(error);
      }
    };

    // onMounted生命周期钩子
    onMounted(async () => {
      console.log(route.query.Article_Id); // 打印查询参数
      await getArticle(); // 获取文章数据
    });

    // 返回响应式的变量
    return {
      article
    };
  }
};
</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header>
        <MenuComponent />
      </el-header>
      <el-main style="padding-left: 20px; min-height: 100vh;">
        <el-row>
          <el-col :span="4" class="left-col">广告招租</el-col>
          <el-col :span="16" class="main-col">
            <div class="article-container">
              <el-container>
                <el-header class="article-header">
                  <div style="display: flex; justify-content: left; align-items: center; font-size: 28px; font-weight: bold; margin-bottom: 10px;">
                    震惊！中山大学BME卓越工程师训练营竟然是一个卓越工程师训练营
                  </div>
                  <div class="article-footer">
                    <span class="publish-time">修改时间：2025-02-18</span>
                    <div class="article-stats">
                      <span class="like-count">点赞数 0</span>
                      <span class="view-count">阅读数 0</span>
                    </div>
                  </div>
                </el-header>
                <el-main>
                  <div class="content" v-html="article"></div>
                </el-main>
              </el-container>
            </div>
          </el-col>
          <el-col :span="4" class="right-col">广告招租</el-col>
        </el-row>
      </el-main>
      <el-footer class="page-footer">
        <PageFooterComponent />
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}


.common-layout{
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content:space-between;
}

.article-container{
  width: 100%;
  height: 1000px;

  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  

}

.footer {
  
  display: flex;
  padding: 10px;
  background-color: #f5f5f5;

  margin: 0;

  width: 100%;
  
  color: #bababa;
}

.left-col {
  background-color: #f5f5f5;
  text-align: center;
  padding: 10px;

  height: 400px;

  font-size: 100px;
  font-weight: 900;
}

.right-col {
  background-color: #f5f5f5;
  text-align: center;
  padding: 10px;

  height: 400px;

  font-size: 100px;
  font-weight: 900;
}

.main-col {
  text-align: center;
  padding-left: 20px;
  padding-right: 20px;
}

.article-footer {
  /* margin-left: 23px;
  margin-right: 30px; */
  /* padding-bottom: 10px; */
}

.article-header{
  margin-top: 20px;
  margin-left: 30px;
  margin-right: 30px;

  height: min-content;
}
</style>




