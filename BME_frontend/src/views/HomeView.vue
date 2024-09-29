<script>
import { RouterView } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";

export default {
  name: "HomeView",
  components: { 
    MenuComponent
  }
};
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header style="padding-rignt: 20px;">
        <MenuComponent />
      </el-header>
      <el-main style="padding-left: 20px;">
        <RouterView />
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}
</style>
