<script>
import Register from '../components/Auth/RegisterComponent.vue';
import MenuPlainComponent from '../components/MenuPlainComponent.vue';
import PageFooterComponent from '../components/PageFooterComponent.vue';

export default {
  name: 'RegisterView',
  components: {
    Register,
    PageFooterComponent,
    MenuPlainComponent
  },
};
</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header style="display: flex; justify-content: center; align-items: center; border-bottom: solid 1px #e6e6e6; padding-bottom: 1px;">
        <MenuPlainComponent />
      </el-header>
      <el-main class="homeMainContainer">
        <Register />
      </el-main>
      <el-footer class="page-footer">
        <PageFooterComponent />
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
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
</style>
