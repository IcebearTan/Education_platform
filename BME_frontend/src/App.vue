<script>
export default {
  name: 'App'
};



</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<!-- 这个 style 块没有 scoped 属性，用于全局样式 -->
<style>
@media (max-width: 768px) {

  /*小屏幕时候强制禁止横向翻动*/
  html,
  body {
    width: 100%;
    min-width: 0;
    overflow-x: hidden !important;
    padding-left: 0;
    padding-right: 0;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
  }

  #app {
    width: 100%;
    min-width: 0;
    overflow-x: hidden !important;
    box-sizing: border-box;
    padding-left: 0;
    padding-right: 0;
    margin-left: 0;
    margin-right: 0;
  }

  /*--- Header 横向滚动样式 --- */

  /* --- 横向滚动样式结束 ---


  /* 隐藏页脚 */
  .page-footer {
    display: none !important;
  }

  /* 可能需要调整主内容区域的上边距，因为页头隐藏了 */
  .homeMainContainer {
    padding-top: 10px;
    /* 示例值，根据需要调整 */
    min-height: calc(100vh - 10px);
    /* 重新计算最小高度 */
  }
}
</style>

<style scoped></style>
