<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router"; // 用来获取当前路由
import MenuComponent from "../components/MenuComponent.vue";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import ArticleDetailComponent from "../components/ArticleDetailComponent.vue";

import api from '../api';

export default {
  name: "HomeView",
  components: {
    MenuComponent,
    PageFooterComponent,
    ArticleDetailComponent
  },
  setup() {
    const route = useRoute(); // 获取当前路由
    // const article = ref(''); // 使用 ref 创建响应式数据

    const Article_Id = ref(route.query.Article_Id); // 获取查询参数中的 id

    // // 获取文章
    // const getArticle = async () => {
    //   try {
    //     const response = await api({
    //       method: 'get',
    //       url: '/article',
    //       params: {
    //         Article_Id: route.query.Article_Id // 从路由查询参数获取Article_Id
    //       }
    //     });
    //     console.log(response.data);
    //     article.value = JSON.parse(response.data.html_content); // 更新响应式数据
    //     // console.log(article.value.html_content);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };

    // // onMounted生命周期钩子
    onMounted(async () => {
      console.log(route.query.Article_Id); // 打印查询参数
      // await getArticle(); // 获取文章数据
    });

    // 返回响应式的变量
    return {
      // article,
      Article_Id
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
        <el-row style="display: flex; justify-content: center;">
          <el-col :span="4" class="left-col">训练营学员滞销！帮帮我们！</el-col>
          <el-col :span="14" class="main-col">
            <div class="article-container">
              <ArticleDetailComponent :id="Article_Id"/>
            </div>
          </el-col>
          <el-col :span="4" class="right-col">训练营学员滞销！帮帮我们！</el-col>
        </el-row>
      </el-main>
      <el-footer class="page-footer">
        <PageFooterComponent/>
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
  min-height: 1000px;

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
  background-image: url("../assets/LuMengXuan.jpg");
  background-size: cover;
  /* display: flex; */
  /* justify-content: center; */

  text-align: center;
  padding: 10px;

  height: 400px;

  font-size: 60px;
  font-weight: 900;
  color: #ff0000;
  /* color: #bb00ff; */

  animation: jumpAnimation 0.5s infinite;

}

.right-col {
  background-image: url("../assets/ChenMinJie.jpg");
  background-size: cover;

  text-align: center;
  padding: 10px;

  height: 400px;

  font-size: 60px;
  font-weight: 900;
  color: #ff0000;


  animation: jumpAnimation 0.5s infinite;

}

.main-col {
  /* text-align: center; */
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

@keyframes jumpAnimation {
  0% {
    /* color: #bb00ff; 初始字体颜色 */
    color: #ff0000;
    opacity: 1;
  }
  50% {
    /* color: #ffff00; 字体变为红色 */
    color: #001aff;
    opacity: 0;
  }
  100% {
    /* color: #bb00ff; 字体恢复原颜色 */
    color: #ff0000;
    opacity: 1;
  }
}
</style>




