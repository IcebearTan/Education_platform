<script>
import { useStore } from 'vuex'
import { User } from '@element-plus/icons-vue'

export default {
    data() {
        return {
            activeIndex: "/",
            visible: false,
        }
    },

    methods: {
        handleSelect(key, keyPath) {
            // console.log(key, keyPath);
        }
    },

    created() {
        this.activeIndex = this.$route.path
    },

};
</script>

<script setup>
import { onMounted, ref, nextTick, onBeforeMount } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const buttonRef = ref()
const popoverRef = ref()
const store = useStore()
const router = useRouter()

const User_Avatar = ref('');

const token = localStorage.getItem('token')
const isLogin = ref(false)
const fetchUserInfo = async () => {
  try {
    const response = await api({
      url: "/user/user_index",
      method: "get",
    });
    if (response.data.code === 200) {
      User_Info.value = response.data;
    } else {
      // 只做本地清理，不弹窗不跳转
      localStorage.removeItem('token')
    }
  } catch (error) {
    // 只做本地清理，不弹窗不跳转
    localStorage.removeItem('token')
  }
}
const publicRoutes = ['/', '/home', '/article', '/register', '/login'];
const checkLogin = () => {
    api({
        url: "/user/user_index",
        method: "get",
    }).then((res) => {
        isLogin.value = true
        setUserAvatar()
    }).catch((error) => {
        isLogin.value = false
        store.dispatch('logout')
        localStorage.removeItem('token')
        // 不再弹窗和跳转，交给全局拦截器
    })
}

const fetchUserAvatar = async () => {
    api({
      url: "/user/user_avatars", // 请求头像的URL
      method: "get",
    })
    .then((avatarRes) => {
        if (avatarRes.data.code === 200) {
            User_Avatar.value = `data:image/png;base64,${avatarRes.data.User_Avatar}`;  // 头像URL存储在res.data.avatarUrl中
        } else {
            User_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
            // ElMessage.error('用户尚未上传头像'); // 不再弹窗
        }  
    })
    .catch((error) => {
        if (error.response && error.response.status === 400) {
            User_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
            // ElMessage.error('MenuComponent:用户尚未上传头像或未知的错误'); // 不再弹窗
        } else if (error.response && error.response.status === 401) {
            localStorage.removeItem('token')
            // 不再弹窗和跳转，交给全局拦截器
        }
    })
}

const setUserAvatar = () => {
    if (store.state.avatar) {
        User_Avatar.value = `${store.state.avatar}`
    } else {
        User_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }
    // User_Avatar.value = `data:image/png;base64,${store.state.avatar}`
}

const isExpanded = ref(false)

const isSearchInputExpand = () => {
    if (!isExpanded.value) {
        isExpanded.value = true
        searchInputClass.value ='search-input-expanded'
    } else {
        if (!searchInput.value) {
            isExpanded.value = false
            searchInputClass.value = 'search-input'
        }
    }
}

const searchInputClass = ref('search-input')
const searchInput = ref(null)

onMounted(() => {
    if (token) {
        checkLogin()
    } else {
        isLogin.value = false
        // 未登录时直接展示登录/注册
        User_Avatar.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }
})

const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
}

const logOut = () => {
    store.dispatch('logout')
    localStorage.removeItem('token')
    window.location.reload()
}

const handleUserInfo = () => {
    if (router.currentRoute.value.path != '/user-center/user-info') {
        setTimeout(() => {
            window.location.reload()
        }, 200)
        router.push('/user-center/user-info')
    }else {
        window.location.reload()
    }
}

const handleUserGroup = () => {
    if (router.currentRoute.value.path != '/user-center/my-groups') {
        setTimeout(() => {
            window.location.reload()
        }, 200)
        router.push('/user-center/my-groups')
    }else {
        window.location.reload()
    }
}
</script>

<template>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false"
        @select="handleSelect" router>
        <el-menu-item index="/" style="margin: 0;">
            <img style="width: 50px" src="../assets/Logo_NewYear.png" />
        </el-menu-item>
        <el-menu-item index="/study">
            学习
        </el-menu-item>
        <el-menu-item index="/exam" disabled>
            考核
        </el-menu-item>
        <el-menu-item index="/order" disabled>
            资源库
        </el-menu-item>
        <el-menu-item index="/discuss" style="margin-right: auto;" disabled>
            讨论
        </el-menu-item>
        <div style="display: flex; align-items: center;">
            <el-input
                 v-model="searchInput"
                placeholder="搜索"
                suffix-icon="Search"
                @focus="isSearchInputExpand()"
                @blur="isSearchInputExpand()"
                :class="searchInputClass"
            />
        </div>
        
        <el-menu-item v-if="isLogin" class="custom-menu-item">
            <div class="user-avatar" style="cursor: pointer;">
                <el-popover
                    :showArrow=false
                    trigger="click"
                    width="300px"
                    height="500px"
                    popper-class="popover"
                >
                    <div>
                        <div style="display: flex; align-items: center; cursor: pointer;" @click="$router.push('/user')">
                            <div style="width: 50px; height: 50px;">
                                <el-avatar @click="visible = !visible"
                                :src="User_Avatar" alt="image"
                                :size="50"
                                />
                            </div>
                            
                            <div style="display: flex; flex-wrap: wrap; margin-left: 10px;">
                                <div class="user-name">{{ $store.state.user.User_Name }}</div>
                                <div v-if="$store.state.user.User_Mode == 'admin'" class="user-type-instructor">导师</div>
                                <div v-else class="user-type-student">学生</div>
                            </div>
                        </div>
                        <ul style="list-style: none; padding: 0; margin-bottom: 0;" role="none">
                            <li class="popli" role="none" @click="handleUserInfo()">
                                <el-icon>
                                    <user />
                                </el-icon>
                                <span style="margin-left: 10px;" >账户设置</span>
                                
                            </li>
                            <li class="popli" role="none" @click="handleUserGroup()">
                                <el-icon>
                                    <DataLine />
                                </el-icon>
                                <span style="margin-left: 10px;" >我的小组</span>
                                
                            </li>
                            <li class="popli-exit" role="none" @click="logOut()">
                                <el-icon>
                                    <Close />
                                </el-icon>
                                <span style="margin-left: 10px;" >退出</span>
                            </li>
                        </ul>
                    </div>
                    
                    <template #reference>
                        <el-avatar @click="visible = !visible"
                            :src="User_Avatar" alt="image"
                        />
                    </template>
                </el-popover>
                
            </div>
        </el-menu-item>
        <el-menu-item v-else class="custom-menu-item">
            <a href="/login" class="custom-link">登录</a>
            <span style="margin-left: 10px; margin-right: 10px;">或</span>
            <a href="/register" class="custom-link">注册</a>
        </el-menu-item>
    </el-menu>
</template>


<style scoped>

.el-menu-demo{
    width: 1325px;
    border-bottom: solid 1px #e6e6e6;
}
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}

.user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
.user-name{
    position: relative;
    top: 0;
    font-size: 18px;
    margin-left: 0px;
    width: 100%;

    color: #000;
    font-weight: bold;
}
.popli{
    display: flex;
    align-items: center;

    font-size: 15px;
    font-weight: 500;
    padding: 8px;

    border-radius: 10px;
    transition: 0.5s;
}

.popli:hover{
    background-color: #f5f7fa;
    cursor: pointer;
}

.popli-exit{
    display: flex; 
    align-items: center;

    font-size: 15px;
    font-weight: 500;
    padding: 8px;

    border-radius: 10px;
    border: solid 1px #ffffff;

    transition: 0.5s;
}

.popli-exit:hover{
    background-color: #ffe9e9;
    border: solid 1px #ff8888;
    cursor: pointer;
}

.user-type-instructor{
    position: relative;
    top: 0;
    font-size: 15px;
    /* margin-left: 10px; */
    font-weight: bold;
    color: #DA6AFC;

    text-shadow: 0px 0px 5px #ecadff;
}

.user-type-student{
    position: relative;
    top: 0;
    font-size: 15px;
    /* margin-left: 10px; */
    font-weight: bold;
    color: #6AD5FC;

    text-shadow: 0px 0px 5px #a5e7ff;

}
.custom-menu-item {
  background-color: #ffffff !important;
  color: #777 !important;
  cursor: auto !important;
  
}
.custom-link{
    text-decoration: none;
    transition: 0.3s;
}
.custom-link:hover{
    color: #000 !important;
    text-shadow: 0 0 3px #e6e6e6;
}
:deep(.search-input .el-input__wrapper){
    border-radius: 20px;
    width: 100px;
    transition: all 0.2s ease-in-out;
}
:deep(.search-input-expanded .el-input__wrapper){
    border-radius: 20px;
    width: 200px;
    transition: all 0.2s ease-in-out;

}
</style>

<style>
.popover{
    padding: 20px !important;
    border-radius: 10px !important;
}
</style>