<script>
import Login from '../components/LoginComponent.vue';
import PageFooterComponent from '../components/PageFooterComponent.vue';
import MenuPlainComponent from '../components/MenuPlainComponent.vue';

export default {
  name: 'LoginView',
  components: {
    Login,
    PageFooterComponent,
    MenuPlainComponent
  },
};
</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header>
        <MenuPlainComponent />
      </el-header>
      <el-main class="homeMainContainer">
        <Login />
      </el-main>
      <el-footer class="page-footer">
        <PageFooterComponent />
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout{
  height: 100%;
}

.footer {
  position: absolute;
  bottom: 0;
}

.homeMainContainer {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loginContainer {
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  margin: 20px;
}
</style>
