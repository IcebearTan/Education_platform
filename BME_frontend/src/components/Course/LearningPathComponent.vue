<template>
  <div class="container"> 
    <div style="height: 100%; width: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div class="title">探索学习路径</div>
      <div class="subtitle">成为卓越工程师</div>
    </div>
    

    <div class="path">
      <div class="path-title" style="margin-top:-8px;">
        <h2 class="text line-tit" style="top: 1px;">
          <div class="dot-text-hardware"></div>
          硬件组路线
          <div class="dot-left"></div>
          <div class="dot-right"></div> 
        </h2>
        <a style="margin-top:23px"></a>
        <h2 class="text line-tit" style="top: 3px;">
          <div class="dot-text-software"></div>
          软件组路线
          <div class="dot-left"></div>
          <div class="dot-right"></div>  
        </h2>
      </div>
      <div class="path-1">
        <a class="text line-1" >
          C语言程序设计
          <div class="dot-left"></div>
          <div class="dot-right"></div> 
        </a>
        <a style="margin-top:40px"></a>
        <a class="text line-1">
          C语言程序设计
          <div class="dot-left"></div>
          <div class="dot-right"></div> 
        </a>
      </div>
      <div class="path-2" >
        <a class="text line-2">

          AD 
          <div class="dot-left"></div>
          <div class="dot-right"></div> 
        </a>
        <a style="margin-top:40px"></a>
        <a class="text line-2">
          Qt
          <div class="dot-left"></div>
          <div class="dot-right"></div>
        </a>
      </div>
      <div class="path-2-1" style="margin-top:-50px">
        <a class="text line-2-1">
          原理图pcb焊接
          <div class="dot-left"></div>
          <div class="dot-right"></div> 
        </a>
      </div>
      <div class="path-3" >
        <a class="text line-3">
          STM32
          <div class="dot-left"></div>
          <div class="dot-right"></div>
        </a>
        <a style="margin-top:40px"></a>
        <a class="text line-5">
          项目组探索
          <div class="dot-left"></div>
          <div class="dot-right"></div>
        </a>
      </div>
      <div class="path-3-1" style="margin-top:-55px;">
        <a class="text line-3-1"> 
          现代医疗仪器(硬件)
          <div class="dot-left"></div>
          <div class="dot-right"></div>
        </a>
        <a style="margin-top:40px"></a>
        <a class="text line-3-2">
          matlab(软件)
          <div class="dot-left"></div>
          <div class="dot-right"></div>
        </a>
      </div>
      <div class="path-4">
        <a class="text line-4" style="top: 3px;">
          三参板
          <div class="dot-left" style="top: 11px;"></div>
          <div class="dot-right" style="top: 11px;"></div>
        </a>
        <a class="text line-5-1" style="top: px;">
          VTK手术机器人
          <div class="dot-left" style="top: 11px;"></div>
          <div class="dot-right" style="top: 11px;"></div>
        </a>
        <a class="text line-5-2">
          IVD
          <div class="dot-left" style="top: 11px;"></div>
          <div class="dot-right" style="top: 11px;"></div>
        </a>
        <a class="text line-5-3">
          安卓
          <div class="dot-left" style="top: 11px;"></div>
          <div class="dot-right" style="top: 11px;"></div>
        </a>
        <a class="text line-5-4">
          网页开发
          <div class="dot-left" style="top: 11px;"></div>
          <div class="dot-right" style="top: 11px;"></div>
        </a>
      </div>
      <div class="path-5">
        <a class="text line-6" style="top: -2px;">
          微机原理
          <div class="dot-left"></div>
          <div class="dot-right"></div>
        </a>
      </div>
      <div class="path-6">
        <a class="text" style="top: -3px;">
          准产品
          <div class="dot-left"></div>
          <div class="dot-right"></div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.container{
  display:flex;
  margin:0px auto;
  max-width:1174px;
  min-width: 390px;
  height:280px;
  position:relative;
  min-height: 280px;
  background-size: contain;
}
.title{
  display:flex;
  /* height:100%; */
  width: fit-content;
  margin-right: auto;
  margin-bottom: 5px;

  flex-direction: column;
  text-align: center;
  justify-content: center;

  font-size: 35px;
  font-weight: 500;
}
.subtitle{
  display:flex;
  /* height:100%; */
  /* min-width: 240px; */
  width: fit-content;
  flex-direction: column;
  text-align: center;
  justify-content: center;

  font-size: 20px;
  /* font-weight: lighter; */
  color: #555;

  margin-right: auto;
}
.path{
  display:flex;
  margin:0px;
  margin-top:-35px;
  pointer-events:auto;
  /* 使div内的元素可点击 */
  display: flex;
  gap: 24px;
}
.text{
  display:flex;
  align-items: center;
  justify-content: center;
  padding:6px 11px;
  border-width:1px;
  border-style:solid;
  border-image:initial;
  border-color: #aaa;
  border-radius: 5px;
  height: 28px;
  position: relative;
  color: #999;
  cursor: pointer;
  align-self: flex-start;
  font-size: 9px;
  font-weight: normal;
  background-color: #f5f5f5;
}
.dot-left{
  position:absolute;
  z-index:1;
  top:15px;
  width:8px;
  height:8px;
  border:1px solid rgb(239,239,239);
  border-radius:100%;
  background-color: #bbb;
  left:-4.5px;
}
.dot-right{
  position: absolute;
  z-index:1;
  top:15px;
  width:8px;
  height:8px;
  border:1px solid rgb(239,239,239);
  border-radius:100%;
  background-color: #bbb;;
  right:-4.5px;
}
.path-title,.path-1, .path-2, .path-3, .path-4, .path-5, .path-6,.path-2-1,.path-3-1{
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding-top: 96px;
  gap: 14px;
  margin-left: 10px;
}

.line-tit::after{
  content:"";
  position:absolute;
  top:20px;
  left:80px;
  width:40%;
  border-width: 1px 0 0 0;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
}
.line-1::after{
  content:"";
  position:absolute;
  top:18px;
  left:87px;
  width:40%;
  border-width: 1px 0 0 0;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
}
.line-2::after{
  content:"";
  position:absolute;
  top:18px;
  left:33px;
  width:470%;
  border-width: 1px 0 0 0;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
}
.line-3::after{
  content:"";
  position:absolute;
  top:18px;
  left:53px;
  width:366%;
  border-width: 1px 0 0 0;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
}
.line-4::after{
  content:"";
  position:absolute;
  top:15px;
  left:53px;
  width:130%;
  border-width: 1px 0 0 0;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
}
.line-6::after{
  content:"";
  position:absolute;
  top:18px;
  left:60px;
  width:60%;
  border-width: 1px 0 0 0;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
}
.line-2-1::before{
  content:"";
  position:absolute;
  top:18px;
  right:88px;
  width:20%;
  height:50px;
  border-width: 1px 0 0 1px;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
  border-top-left-radius: 10%;
}
.line-3-1::before{
  content:"";
  position:absolute;
  top:18px;
  right:105px;
  width:18%;
  height:55px;
  border-width: 1px 0 0 1px;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
  border-top-left-radius: 10%;
}
.line-3-2::before{
  content:"";
  position:absolute;
  bottom:20px;
  right:82px;
  width:22%;
  height:55px;
  border-width: 0 0 1px 1px;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
  border-bottom-left-radius: 10%;
}
.line-5::after{
  content:"";
  position:absolute;
  top:18px;
  left:73px;
  width:180%;
  border-width: 1px 0 0 0;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
}
.line-5-1::before{
  content:"";
  position:absolute;
  top:16px;
  right:88px;
  width:48%;
  height:65px;
  border-width: 1px 0 0 1px;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
  border-top-left-radius: 10%;
}
.line-5-2::before{
  content:"";
  position:absolute;
  top:16px;
  right:40px;
  width:41px;
  border-width: 1px 0 0 0;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
  /* border-radius: 10%; */
}
.line-5-4::before{
  content:"";
  position:absolute;
  bottom:14px;
  right:63px;
  width:68%;
  height:78px;
  border-width: 0 0 1px 1px;
  border-style:dashed;
  border-color:rgb(59, 3, 55);
  border-bottom-left-radius: 10%;
}
.line-5-3::before{
  content:"";
  position:absolute;
  bottom:14px;
  right:36px;
  width:48px;
  border-width: 1px 0 0 0;
  border-style: dashed;
  border-color:rgb(59, 3, 55);
  /* border-radius: 10%; */
}
.dot-text-software{
  width: 10px;
  height: 10px;
  background-image: linear-gradient(
    to bottom,
    #bcdaff 0%,    /* 顶部纯白 */
    #2761ff 100% /* 底部保持纯蓝色 */
  );
  border-radius: 50%;
  margin-right: 5px;
}
.dot-text-hardware{
  width: 10px;
  height: 10px;
  background-image: linear-gradient(
    to bottom,
    #ffc2af 0%,    /* 顶部纯白 */
    #ef582a 100% /* 底部保持纯蓝色 */
  );
  border-radius: 50%;
  margin-right: 5px;
}
</style>