<script>
import { RouterView } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";
import StudyComponent from '../components/StudyComponent.vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: "HomeView",
  components: { 
    MenuComponent
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
      // if (error.response.status == 422){
      ElMessage.error('登录失效，请重新登录')
      this.router.push('/login')
      // }

    }).then((res) => {
        // if (res.response.status == 422) {
        //   ElMessage.error('Oops, this is a error message.')
        // }

        if (res.data.code == 200) {
          console.log(res)
          this.store.dispatch('setUser', res.data)
        }
      }
    )
  }
};
</script>

<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

</script>



<template>
  <div>
    <el-container class="common-layout">
      <el-header>
        <MenuComponent />
      </el-header>
      <el-main style="padding: 0px; min-height: 100vh;">
        <RouterView />
      </el-main>
      <el-footer class="footer">备案编号：1145141919810 没有版权和免责声明 千万别申诉版权 出版物许可证也没有 ©2024-2024深圳中大BME草台班子无限公司
        服务冷线：4008-123-123 客服邮箱：thisIsAfakeEmail@bme.com
      </el-footer>
    </el-container>
  </div>
</template>

<style scope>
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
</style>
