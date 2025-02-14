<script>
import { RouterView } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";
import api from '../api';

export default {
  name: "HomeView",
  components: { 
    MenuComponent
  },
  async mounted() {
    console.log(this.$route.query.Article_Id);
    await this.getArticle();
  },
  data() {
    return {
      article: {}
    }
  },
  methods: {
    async getArticle() {
      try {
        const response = await api({
          method: 'get',
          url: `/article`,
          params: {
            Article_Id: this.$route.query.Article_Id
          }
        })
        console.log(response.data);
        this.article = response.data
      } catch (error) {
        console.error(error);
      }
    }
  },
  
  
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
            <div class="common-layout">
              <el-container>
                <el-header>
                  <h1>
                    <!-- 震惊！中山大学BME卓越工程师训练营竟然是一个卓越工程师训练营 -->
                  </h1>
                </el-header>
                <el-main>
                  <div class="content" v-html="this.article">
                  </div>
                </el-main>
                <el-footer>Footer</el-footer>
              </el-container>
            </div>
          </el-col>
          <el-col :span="4" class="right-col">广告招租</el-col>
        </el-row>
      </el-main>
      <el-footer class="footer">备案编号：1145141919810 没有版权和免责声明 千万别申诉版权 出版物许可证也没有 ©2024-2024深圳中大BME草台班子无限公司
        服务冷线：4008-123-123 客服邮箱：thisIsAfakeEmail@bme.com
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
  padding: 10px;
}
</style>




