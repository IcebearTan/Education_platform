<template>
  <div style="width: 900px;">
    <div class="links-container">
        <div class="links">
            <div class="title">
                训练营平台
            </div>
            <div class="subtitle">
                LeaningBooks
            </div>
            <div class="subtitle">
                考核报名
            </div>
            <div class="subtitle">
                资源库
            </div>
            <div class="subtitle">
                讨论社区
            </div>
        </div>
        <div class="links">
            <div class="title">
                训练营平台
            </div>
            <div class="subtitle">
                LeaningBooks
            </div>
            <div class="subtitle">
                考核报名
            </div>
            <div class="subtitle">
                资源库
            </div>
            <div class="subtitle">
                讨论社区
            </div>
        </div>
        <div class="links">
            <div class="title">
                训练营平台
            </div>
            <div class="subtitle">
                LeaningBooks
            </div>
            <div class="subtitle">
                考核报名
            </div>
            <div class="subtitle">
                资源库
            </div>
            <div class="subtitle">
                讨论社区
            </div>
        </div>
        <div class="links">
            <div class="title">
                开发团队
            </div>
            <div class="subtitle" @click="$router.push('/about')">
                关于我们
            </div>
            <div class="subtitle">
                加入我们
            </div>
        </div>
    </div>
    <hr class="custom-hr"></hr>
    <div style="font-size: 15px; color: #fff; margin-bottom: 10px;">©2024-2025 中山大学医工融创训练营</div>
    <div style="font-size: 13px; color: #999; margin-bottom: 10px; display: flex; flex-wrap: wrap;">
        <div style="margin-right: 10px;">备案编号：1145141919810</div>
        <div> 没有版权和免责声明</div>
        <div>服务冷线：4008-123-123</div>
        <div>客服邮箱：thisIsAfakeEmail@bme.com</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({

    setup(props, context) {

        
        return {
        
        }
    },
})
</script>

<style scoped>
.title{
    color: white;
    font-size: 15px;
    font-weight: normal;

    margin-bottom: 20px;
}
.subtitle{
    color: #9f9f9f;
    font-size: 15px;
    font-weight: normal;

    margin-bottom: 15px;

    cursor: pointer;
}
.subtitle:hover{
    text-decoration: underline;
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
</style>
