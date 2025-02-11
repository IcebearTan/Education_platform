<script>
import Login from '../components/LoginComponent.vue';

export default {
  name: 'LoginView',
  components: {
    Login
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
        <Login />
      </el-main>
      <el-footer class="footer">备案编号：1145141919810 没有版权和免责声明 千万别申诉版权 出版物许可证也没有 ©2024-2024深圳中大BME草台班子无限公司
        服务冷线：4008-123-123 客服邮箱：thisIsAfakeEmail@bme.com
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
