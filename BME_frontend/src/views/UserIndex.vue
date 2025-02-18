<script>
import UserindexComponent from "../components/UserindexComponent.vue";
import AdminindexComponent from "../components/AdminindexComponent.vue";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import MenuComponent from "../components/MenuComponent.vue";
import api from '../api';
import { RouterLink } from "vue-router";

export default {
    name: 'UserIndex',
    components: {
        UserindexComponent,
        MenuComponent,
        PageFooterComponent
    },

    data() {
        return {
            username: '',
            user_email: '',
            uid: '',
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
                this.user_email = res.data.User_Email
                this.uid = res.data.User_Id
            }
        })
    }
    
};
</script>

<script setup>
import api from "../api";
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

const User_Avatar = ref('');

onMounted(() => {
    api({
      url: "/user/user_avatars", // 请求头像的URL
      method: "get",
    })
    .then((avatarRes) => {
        if (avatarRes.data.code === 200) {
            User_Avatar.value = `data:image/png;base64,${avatarRes.data.User_Avatar}`;  // 假设头像URL存储在res.data.avatarUrl中
        } else {
            ElMessage.error('获取头像失败');
        }  
    })
    .catch((error) => {
        if (error.response.status === 401) {
            ElMessage.error('登录失效，请重新登录');
            router.push('/login');  //这里还没做完
        } else {
            ElMessage.error('未知的错误');
        }
    })
})
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
                        <div style="position: relative; display: flex;">
                            <div>
                                <el-avatar @click="visible = !visible"
                                    shape="square"
                                    size="large"
                                    class="avatar"
                                    :src="User_Avatar" alt="image"
                                />
                            </div>

                            <div style="margin-left: 10px;">
                                <div style="font-size: larger; font-weight: bold; margin-bottom: 5px;">{{ username }}</div>
                                <div style="font-size: 15px; color: #666;">Email：{{ user_email }}</div>
                                <div style="position: absolute; bottom: 5px; font-size: 15px; color: #666;">#uid：{{ uid }}</div>
                            </div>
                        </div>
                        <UserindexComponent />
                    </el-col>
                    <el-col :span="3"></el-col>
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