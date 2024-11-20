<script>

import { useStore } from 'vuex'

export default {
    data() {
        return {
            activeIndex: "/",
            visible: false,
        }
    },

    methods: {
        handleSelect(key, keyPath) {
            console.log(key, keyPath);
        }
    },

    created() {
        this.activeIndex = this.$route.path
    },

};


</script>

<script setup>
import { ref, unref } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'
import { useRouter } from 'vue-router'

const buttonRef = ref()
const popoverRef = ref()
const store = useStore()
const router = useRouter()


const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
}

const logOut = () => {
    store.dispatch('logout')

    localStorage.removeItem('token')
    router.push('/login')
}
</script>

<template>
    <!-- <div class="common-layout">
        <el-container>
            <el-header> -->
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false"
        @select="handleSelect" router>
        <el-menu-item index="/">
            <img style="width: 50px" src="../assets/vue.svg" />
        </el-menu-item>

        
        <el-menu-item index="/study">
            学习
        </el-menu-item>
        <el-menu-item index="/exam">
            考核
        </el-menu-item>
        <el-menu-item index="/order">
            接单
        </el-menu-item>
        <el-menu-item index="/discuss">
            讨论
        </el-menu-item>
        <el-menu-item v-if="$store.state.isLogin" index="/login">登录/注册</el-menu-item>
        <el-menu-item v-else>
            <div class="user-avatar">
                <el-popover
                    :showArrow=false
                    trigger="click"
                    width="300px"
                    height="500px"
                    popper-class="popover"
                >
                    <div>
                        <div style="display: flex; align-items: center; cursor: pointer;" @click="$router.push('/user')">
                            <el-avatar @click="visible = !visible"
                                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                                :size="50"
                            />
                            <div style="position: relative; top: 0; font-size: 25px; margin-left: 10px">{{ $store.state.user.User_Name }}</div>
                        </div>
                        <ul style="list-style: none; padding: 0; margin-bottom: 0;" role="none">
                            <li class="popli" role="none" @click="$router.push('/user')">
                                <el-icon>
                                    <user />
                                </el-icon>
                                <span style="margin-left: 10px;" >个人中心</span>
                                
                            </li>
                            <li class="popli" role="none" @click="logOut()">
                                <el-icon>
                                    <Close />
                                </el-icon>
                                <span style="margin-left: 10px;" >退出·</span>
                            </li>
                        </ul>
                    </div>
                    
                    <template #reference>
                        <el-avatar @click="visible = !visible"
                            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                        />
                    </template>
                </el-popover>
                
            </div>
        </el-menu-item>
    </el-menu>
    <!-- </el-header>
        </el-container>
    </div> -->
</template>


<style scoped>
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


</style>

<style>
.popover{
    padding: 20px !important;
    border-radius: 10px !important;
}
</style>