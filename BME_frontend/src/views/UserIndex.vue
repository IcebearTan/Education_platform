<script>
import UserindexComponent from "../components/UserindexComponent.vue";
import MenuComponent from "../components/MenuComponent.vue";

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
        UserindexComponent,
        MenuComponent
    },
    
};


</script>

<template>
    <div class="common-layout">
        <el-container>
            <el-header>
                <!-- <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false"
                    @select="handleSelect" router>
                    <el-menu-item index="/">
                        <img style="width: 50px" src="../assets/vue.svg" />
                    </el-menu-item>

                    <el-sub-menu index="2">
                        <template #title>文章学习</template>
                        <el-menu-item index="2-1">分流前</el-menu-item>
                        <el-sub-menu index="2-4">
                            <template #title>分流后</template>
                            <el-menu-item index="2-4-1">硬件组</el-menu-item>
                            <el-menu-item index="2-4-2">软件组</el-menu-item>
                            <el-menu-item index="2-4-3">先进制造组</el-menu-item>
                        </el-sub-menu>
                    </el-sub-menu>
                    <el-sub-menu index="3" :popper-offset="8">
                        <template #title>学习进度考核</template>
                        <el-menu-item index="3-1">分流前</el-menu-item>
                        <el-sub-menu index="3-4" :popper-offset="20">
                            <template #title>分流后</template>
                            <el-menu-item index="3-4-1">硬件组</el-menu-item>
                            <el-menu-item index="3-4-2">软件组</el-menu-item>
                            <el-menu-item index="3-4-3">先进制造组</el-menu-item>
                        </el-sub-menu>
                    </el-sub-menu>
                    <el-menu-item index="/login">登录/注册</el-menu-item>
                    <el-menu-item index="/user">个人中心</el-menu-item>
                </el-menu> -->
                <MenuComponent/>
            </el-header>
            <el-main>
                <UserindexComponent />
            </el-main>
            <el-footer>知行合一</el-footer>
        </el-container>
    </div>
</template>


<style scoped>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}
</style>