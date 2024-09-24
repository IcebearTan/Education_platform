<script>
import CommonHeader from "@/components/CommonHeader.vue";

export default {
  name: "HomeView",
  components: { CommonHeader }
};
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <CommonHeader />
      </el-header>
      <el-main>Main</el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>

<style scoped></style>
