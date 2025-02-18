<script>
import UserCenterComponent from "../components/UserCenterComponent.vue";
import AdminindexComponent from "../components/AdminindexComponent.vue";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import MenuComponent from "../components/MenuComponent.vue";
import api from '../api';
import { RouterLink } from "vue-router";

export default {
    // data() {
    //     return {
    //         activeIndex: "/"
    //     }
    // },

    // methods: {
    //   handleSelect(key, keyPath) {
    //     console.log(key, keyPath);
    //   }
    // },

    // created() {
    //     this.activeIndex = this.$route.path
    // },

    name: 'UserIndex',
    components: {
        UserCenterComponent,
        MenuComponent,
        PageFooterComponent
    },

    data() {
        return {
            username: ''
        }
    },

    created() {
        api({
            url: "/user/user_index",
            method: "get",
        }).catch((error) => {
            // if (error.response.status == 422){
            ElMessage.error('登录失效，请重新登录')
            router.push('/login')
            // }

        }).then((res) => {
            // if (res.response.status == 422) {
            //   ElMessage.error('Oops, this is a error message.')
            // }

            if (res.data.code == 200) {
                console.log(res)
                this.username = res.data.User_Name
            }
        }
        )
    }
    
};
</script>
<script setup>
import { nextTick, ref } from 'vue'

const loading = ref(false)

nextTick(() => {
    loading.value = true
    setTimeout(() => {
        loading.value = false
    }, 500)
})

</script>

<template>
    <div class="common-layout">
        <el-container 
        v-loading="loading" 
        element-loading-background="rgba(255, 255, 255, 1)" 
        :delay="0" 
        element-loading-text="loading...">
            <el-header>
                <MenuComponent/>
            </el-header>
            <el-main style="min-height: 100vh; background-color: #fff;" >
                <el-row>
                    <el-col :span="4"></el-col>
                    <el-col :span="16">
                        <UserCenterComponent />
                    </el-col>
                    <el-col :span="4"></el-col>
                </el-row>
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

.avatar {
    width: 100px;
    height: 100px;
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
<style>
.example-showcase .el-loading-mask {
  z-index: 9;
  transition: none !important;
  
}
</style>