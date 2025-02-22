<template>
  <div style="width: 1000px;">
    <div class="links-container">
        <div class="links">
            <router-link class="title" :to="{ path: '/'}" target="_blank">
                AMEII 教育平台
            </router-link>
            <router-link class="subtitle" :to="{ path: '/study'}" target="_blank">
                LeaningBooks
            </router-link>
            <div class="subtitle_disabled">
                考核报名
            </div>
            <div class="subtitle_disabled">
                资源库
            </div>
            <div class="subtitle_disabled">
                讨论社区
            </div>
        </div>
        <div class="links">
            <div class="title_disabled">
                医工融合科创协会
            </div>
            <a class="subtitle" href="https://bme.sysu.edu.cn" target="_blank">中山大学生物医学工程</a>
            <a class="subtitle" href="https://www.sysu.edu.cn" target="_blank">中山大学</a>
            <!-- <div class="subtitle_disabled">
                资源库
            </div>
            <div class="subtitle_disabled">
                讨论社区
            </div> -->
        </div>
        <div class="links">
            <div class="title_disabled">
                训练营平台
            </div>
            <div class="subtitle_disabled">
                LeaningBooks
            </div>
            <div class="subtitle_disabled">
                考核报名
            </div>
            <div class="subtitle_disabled">
                资源库
            </div>
            <div class="subtitle_disabled">
                讨论社区
            </div>
        </div>
        <div class="links">
            <router-link class="title" :to="{ path: '/about'}" target="_blank">
                关于我们
            </router-link>
            <div class="subtitle_disabled">
                加入我们
            </div>
            <div class="subtitle_disabled">
                支持我们
            </div>
        </div>
        <div style="position: relative;" v-show="isVisible ">
            <div style="position: absolute; width: 50px; top: 10px; left: -15px;">公众号</div>
            <img src="/wechatQRcode.png" alt="wechatQRcode" class="QRcode" >
        </div>
        <img src="/wechat_1.png" alt="wechat" class="foot-icon"
        @mouseover="isVisible = true"
        @mouseleave="isVisible = false"
        >
    </div>
    <hr class="custom-hr"></hr>
    <div style="font-size: 15px; color: #fff; margin-bottom: 10px;">©2024-2025 中山大学医工融创训练营</div>
    <div style="font-size: 13px; color: #999; margin-bottom: 10px; display: flex; flex-wrap: wrap;">
        <div style="margin-right: 10px;">备案编号：1145141919810</div>
        <div style="margin-right: 10px;">没有版权和免责声明</div>
        <div style="margin-right: 10px;">服务冷线：4008-123-123</div>
        <div style="margin-right: 10px;">客服邮箱：thisIsAfakeEmail@bme.com</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({

    setup(props, context) {
        const isVisible = ref(false);
        
        return {
            isVisible,
        }
    },
})
</script>

<style scoped>
.title{
    color: #fff;
    font-size: 15px;
    font-weight: normal;
    text-decoration: none;

    margin-bottom: 20px;
    display: inline-block;

    transition: 0.2s;
    width: fit-content;

    cursor: pointer;
}
.title_disabled{
    color: #fff;
    font-size: 15px;
    font-weight: normal;
    text-decoration: none;

    margin-bottom: 20px;
    display: block;

    transition: 0.2s;
    width: fit-content;
}
.title:hover{
    color: #9f9f9f;
}
.title:active{
    color: #fff;
}
.subtitle{
    color: #9f9f9f;
    font-size: 15px;
    font-weight: normal;
    width: fit-content;

    margin-bottom: 15px;
    display: block;
    text-decoration: none;

    cursor: pointer;
    transition: 0.2s;
}
.subtitle_disabled{
    color: #9f9f9f;
    font-size: 15px;
    font-weight: normal;
    width: fit-content;

    margin-bottom: 15px;

    transition: 0.2s;
}
.subtitle:hover{
    color: #dadada;
}
.subtitle:active{
    color: #9f9f9f;
}
.links-container{
    display: flex;
    justify-content: flex-start;

    width: 100%;

    margin-top: 20px;
}
.links{
    flex: 1;
}
.custom-hr {
  border: none; /* 移除默认的边框 */
  height: 1px; /* 设置水平线的高度 */
  background-color: #4b4b4b; /* 设置颜色 */
  width: 100%; /* 设置宽度 */
  margin: 20px auto; /* 设置上下间距并居中 */
}
.foot-icon{
    width: 25px;
    height: 25px;

    margin-top: auto;
    /* opacity: 0.5; */
    filter: grayscale(100%);

    cursor: pointer;
}
.foot-icon:hover{
    filter: grayscale(0%);
}
.QRcode{
    width: 100px;
    height: 100px;

    border-radius: 10px;

    position: absolute;
    top: 40px;
    right: -60px;
}
</style>
