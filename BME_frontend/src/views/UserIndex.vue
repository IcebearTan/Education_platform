<script>
import UserIndexComponent from "../components/User/UserIndexComponent.vue";
import AdminindexComponent from "../components/AdminindexComponent.vue";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import MenuComponent from "../components/MenuComponent.vue";
import api from '../api';
import { RouterLink } from "vue-router";

export default {
    name: 'UserIndex',
    components: {
        UserIndexComponent,
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
        })
        .then((res) => {
            if (res.data.code == 200) {
                this.username = res.data.User_Name
                this.user_email = res.data.User_Email
                this.uid = res.data.User_Id
            }
        })
        .catch((error) => {
            // 只做本地跳转，不再弹窗，401 交给全局拦截器
            if (error.response && error.response.status === 401) {
                this.$router.push('/login')
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
import { useStore } from "vuex";

const store = useStore();

const router = useRouter();

const User_Avatar = ref('');

const setUserAvatar = () => {
    if (store.state.avatar) {
        User_Avatar.value = `${store.state.avatar}`
    } else {
        User_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }
}

onMounted(() => {
    setUserAvatar();
})
</script>

<template>
    <div class="common-layout">
        <el-container>
            <el-header
                style="display: flex; justify-content: center; align-items: center; border-bottom: solid 1px #e6e6e6; padding-bottom: 1px;">
                <MenuComponent />
            </el-header>
            <el-main style="min-height: 100vh; background-color: #f5f7fa; width: 100%;">
                <div style="width: 1305px; margin: auto; overflow: hidden; padding: 5px;">
                    <div style="position: relative; display: flex; margin-top: 15px; margin-bottom: 15px; ">
                        <div style="margin-right: 10px;">
                            <el-avatar @click="visible = !visible" shape="square" size="large" class="avatar"
                                :src="User_Avatar" alt="image" />
                        </div>

                        <div style="margin-left: 10px;">
                            <div style="font-size: larger; font-weight: bold; margin-bottom: 5px;">{{ username }}</div>
                            <div style="font-size: 15px; color: #666;">Email：{{ user_email }}</div>
                            <div style="position: absolute; bottom: 5px; font-size: 15px; color: #666;">#uid：{{ uid }}</div>
                        </div>
                    </div>
                    <div>
                        <UserIndexComponent />
                    </div>
                </div>
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

    border-radius: 15px;
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