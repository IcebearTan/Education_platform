<script>
import UserCenterComponent from "../components/UserCenterComponent.vue";
import AdminindexComponent from "../components/AdminindexComponent.vue";

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
        MenuComponent
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

<template>
    <div class="common-layout">
        <el-container>
            <el-header>
                <MenuComponent/>
            </el-header>
            <el-main style="min-height: 100vh;">
                <el-row>
                    <el-col :span="3"></el-col>
                    <el-col :span="18">
                        <UserCenterComponent />
                    </el-col>
                    <el-col :span="3"></el-col>
                </el-row>
            </el-main>
            <el-footer class="footer">备案编号：1145141919810 没有版权和免责声明 千万别申诉版权 出版物许可证也没有 ©2024-2024深圳中大BME草台班子无限公司
                服务冷线：4008-123-123 客服邮箱：thisIsAfakeEmail@bme.com
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