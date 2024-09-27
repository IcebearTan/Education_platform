<script>
import CommomHeader from "../components/CommonHeader.vue"
import MenuComponent from "../components/MenuComponent.vue";

export default {
  name: "HomeView",
  components: { 
    CommomHeader,
    MenuComponent
  }
};
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <MenuComponent />
      </el-header>
      <el-main>
        <CommomHeader />
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
