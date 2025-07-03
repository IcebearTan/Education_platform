<script>
import AboutUsComponent from "../components/AboutUsComponent.vue"

import MenuComponent from "../components/MenuComponent.vue";
import PageFooterComponent from "../components/PageFooterComponent.vue";
import api from '../api';
import { RouterLink } from "vue-router";

export default {
    name: 'AboutUsView',
    components: {
        AboutUsComponent,
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
};
</script>

<script setup>
import api from "../api";
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

const User_Avatar = ref('');


</script>

<template>
    <div class="common-layout">
        <el-container>
            <el-header>
                <MenuComponent />
            </el-header>
            <AboutUsComponent />
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
    background-color: #bababa;

    margin: 0;

    width: 100%;

    color: #bababa;
}
</style>