<script>

export default {
    data() {
        return {
            activeIndex: "/"
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

<template>
    <!-- <div class="common-layout">
        <el-container>
            <el-header> -->
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false"
        @select="handleSelect" router>
        <el-menu-item index="/">
            <img style="width: 50px" src="../assets/vue.svg" />
        </el-menu-item>

        <el-menu-item index="2">
            学习
        </el-menu-item>
        <el-menu-item index="3">
            考核
        </el-menu-item>
        <el-menu-item index="/login">登录/注册</el-menu-item>
        <el-menu-item index="/user">个人中心</el-menu-item>
    </el-menu>
    <!-- </el-header>
        </el-container>
    </div> -->
</template>


<style scoped>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}
</style>