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