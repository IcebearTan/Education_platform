<script>
import FindPasswordComponent from '../components/FindPasswordComponent.vue';
import PageFooterComponent from '../components/PageFooterComponent.vue';

export default {
  name: 'FindPasswordView',
  components: {
    FindPasswordComponent,
    PageFooterComponent
  },
};
</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header>
        <!-- <MenuComponent /> -->
      </el-header>
      <el-main class="homeMainContainer">
        <FindPasswordComponent />
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
