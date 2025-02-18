<script>
import { RouterView } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from "../api";
import PageFooterComponent from "../components/PageFooterComponent.vue";

export default {
  name: "HomeView",
  components: { 
    MenuComponent,
    PageFooterComponent
  },

  data() {
    return {
      store: useStore(),
      router: useRouter(),
    };
  },

  created() {
    api({
      url: "/user/user_index",
      method: "get",
    }).catch((error) => {
      ElMessage.error('登录失效，请重新登录')
      this.router.push('/login')
    }).then((res) => {
        if (res.data.code == 200) {
          this.store.dispatch('setUser', res.data)
        }
      }
    )
  }
};
</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header>
        <MenuComponent />
      </el-header>
      <el-main class="homeMainContainer">
        <RouterView />
        <!-- <TestComponent /> -->
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

.footer {
  font-size: 15px;

  display: flex;
  padding: 10px;
  background-color: #f5f5f5;

  margin: 0;

  width: 100%;
  
  color: #bababa;
}

.homeMainContainer{
  padding-left: 20px;
  min-height: 100vh;
  /* background-color: rgba(129, 51, 33, 0.898); */
  background-color: rgb(255, 255, 255);
  
}
</style>

<style>
.el-header {
  padding: 0;
}

.page-footer {
  display: flex;
  /* justify-content: center; */
  align-items: center;
  flex-direction: column;

  padding: 10px;
  background-color: #252525;

  /* margin: 0 a; */

  width: 100%;
  min-height: 400px;
  
  color: #ffffff;
}
</style>
