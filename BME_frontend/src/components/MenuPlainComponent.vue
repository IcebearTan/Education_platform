<script>
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
const router = useRouter()

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
    
})

const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.()
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