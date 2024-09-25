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
        <el-menu :default-active="this.$router.path" class="el-menu-demo" mode="horizontal" :ellipsis="false"
          @select="handleSelect" router>
          <el-menu-item index="/">
            <img style="width: 50px" src="../assets/vue.svg" />
          </el-menu-item>

          <el-sub-menu index="2">
            <template #title>Workspace</template>
            <el-menu-item index="2-1">item one</el-menu-item>
            <el-menu-item index="2-2">item two</el-menu-item>
            <el-menu-item index="2-3">item three</el-menu-item>
            <el-sub-menu index="2-4">
              <template #title>item four</template>
              <el-menu-item index="2-4-1">item one</el-menu-item>
              <el-menu-item index="2-4-2">item two</el-menu-item>
              <el-menu-item index="2-4-3">item three</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <el-sub-menu index="3" :popper-offset="8">
            <template #title>Override Popper Offset</template>
            <el-menu-item index="3-1">item one</el-menu-item>
            <el-menu-item index="3-2">item two</el-menu-item>
            <el-menu-item index="3-3">item three</el-menu-item>
            <el-sub-menu index="3-4" :popper-offset="20">
              <template #title>override child</template>
              <el-menu-item index="3-4-1">item one</el-menu-item>
              <el-menu-item index="3-4-2">item two</el-menu-item>
              <el-menu-item index="3-4-3">item three</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <el-menu-item index="/login">登录/注册</el-menu-item>
          <el-menu-item index="/user">个人中心</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <CommonHeader />
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
