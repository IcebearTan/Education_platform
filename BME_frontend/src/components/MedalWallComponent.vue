<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';

const currentCategory = ref('');

const medalClass = (getTime) => {
  if (getTime) {
    return 'medal-icon';
  } else {
    return 'medal-icon-unclaimed';
  }
};

const filteredMedals = computed(() => {
  let filtered = currentCategory.value === '' ? medals.value : medals.value.filter(medal => medal.Medal_Tag === currentCategory.value);

  // 排序：已获得的勋章排在前面，未获得的排在后面
  return filtered.sort((a, b) => {
    if (a.Get_Time && !b.Get_Time) {
      return -1;  // a 在前
    } else if (!a.Get_Time && b.Get_Time) {
      return 1;   // b 在前
    }
    return 0;  // 如果都获得或者都未获得，顺序不变
  });
});

const medals = ref([])

const fetchMedals = async () => {
  try {
    const res = await api.get('/medal/user_medal_show');
    console.log(res);
    if (res.data.code === 200) {
      medals.value = res.data.Medal;
    }
    console.log(medals.value);
  } catch (error) {
    console.error('Error fetching medals:', error);
  }
}

const isGetMedal = (getTime) => {
  console.log(getTime);
  if (getTime) {
    return true;
  } else {
    return false;
  }
}

onMounted(() => {
  fetchMedals()
})
</script>

<template>
  <div class="background">
    <div class="medal-wall">
      <h1 class="medal-title">勋章墙</h1>
      <div class="content">
        <div class="left-bar">
          <button class="category-button" :class="{active:currentCategory===''}" @click="currentCategory=''">全部</button>
          <button class="category-button" :class="{active:currentCategory==='硬件组'}" @click="currentCategory='硬件组'">硬件组</button>
          <button class="category-button" :class="{active:currentCategory==='软件组'}" @click="currentCategory='软件组'">软件组</button>
          <button class="category-button" :class="{active:currentCategory==='先进制造组'}" @click="currentCategory='先进制造组'">先进制造组</button>
          <button class="category-button" :class="{active:currentCategory==='特殊勋章'}" @click="currentCategory='特殊勋章'">特殊勋章</button>
        </div>
        <div class="medal-grid">
          <div class="medal" v-for="medal in filteredMedals" :key="medal.id" v-if="filteredMedals.length > 0">
            <img :src="`/medals/${medal.Medal_Name}.png`" :alt="medal.name" :class="medalClass(medal.Get_Time)" />
            <div class="medal-info">
              <h3>{{ medal.Medal_Name_CN }}</h3>
              <p v-if="isGetMedal(medal.Get_Time)">获得时间：{{ medal.Get_Time }}</p>
              <p v-else>尚未获得</p>
            </div>
          </div>
          <div v-else>
            <p>还没有勋章哦~</p>
          </div>
        </div>  
      </div>
    </div>
  </div>
</template>

<style>
html,
body,#app, .app-main {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
.background {
  width: 100%;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #e8f4ff,#fff);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 0;

  border-radius: 20px;
}

.medal-wall{
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 10px;
  box-shadow: 4px 4px 4px 4px rgba(46, 73, 103, 0.1);
}

.medal-title{
  position: absolute;
  height: 13%;
  top: 0;
  padding: 20px;
  box-sizing: border-box;
  width: 98%;
  margin: 0;
  text-align: center;
  font-size: 40px;
  border-bottom: 1.5px solid rgb(231, 231, 231);
}

.content{
  display: flex;
  position: absolute;
  flex: 1;
  width: 100%;
  bottom: 0;
  height: 87%; 
  overflow-y: auto;
  box-sizing: border-box;
  /* padding: 20px; */
  /* box-sizing: border-box; */
}

.content::-webkit-scrollbar {
  display: none;
}

.left-bar{
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 15%; 
  position: relative;
}

.left-bar::after {
  content: ''; /* 伪元素必须有 content 属性 */
  position: absolute;
  top: 10px; /* 边框的顶部位置 */
  right: 0; /* 边框在盒子的右侧 */
  width: 1.5px; /* 边框宽度 */
  height: calc(100% - 20px); /* 边框高度比盒子短 20px */
  background-color: rgb(231, 231, 231); /* 边框颜色 */
}

.category-button{
  padding: 10px 20px;
  border: none;
  border-radius: 0%;
  background-color: #fff;
  cursor: pointer;
  transition: 0.3s;

  font-size: 18px;
  color: #444;
}

.category-button:hover{
  background: #f0f0f0;
}

.category-button.active {
  background-color: #89c8ff;
  color: #fff;
  border: none;
  outline: none;
}

.category-button:focus {
  outline: none;
}

.medal-grid {
  flex:1;
  gap: 20px;
  row-gap: 80px;
  /* margin-top: 100px; */
  overflow-y: auto;
  padding: 20px;
  height: 650px;
  width: 95%;
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  grid-row: 300px;
  grid-column: 100px;
}

.medal-grid::-webkit-scrollbar {
  display: none;
}

.medal {
  border-radius: 20px;
  padding: 15px;
  width:90%;
  text-align: center;
  background: #fff;
  box-shadow: 0px 0px 8px rgba(203, 213, 224, 0.838);
  height: 200px;

  transition: 0.3s;
  cursor: pointer;

  overflow: hidden;
  object-position: center;
}
.medal:hover {
  transform: translateY(-10px);
}

.medal-icon {
  width: 145px;
  height: 145px;
  /* margin-bottom: 10px; */
  border-radius: 50%;

  position: relative;
  /* top: -20px; */
  /* left: 3px; */

  /* opacity: 0.1;
  filter: grayscale(60%); */
  
  box-shadow: 0px 0px 20px #bbb, 0px 0px 20px #bbb inset;

  object-fit: cover;
  
}
.medal-icon-unclaimed {
  width: 145px;
  height: 145px;
  border-radius: 50%;

  position: relative;

  opacity: 0.1;
  filter: grayscale(60%);
}

.medal-icon-old {
  width: 120px;
  height: 120px;
  margin-bottom: 10px;
  border-radius: 8px;
}

.medal-info {
  position: relative;
  /* top: -35px; */
}

.medal-info h3 {
  font-size: 16px;
  margin: 5px 0;
  color: #555;
}

.medal-info p {
  font-size: 14px;
  color: #999;

  margin-top: 10px;
}
</style>

//以下为配置表
{
  "Medal_Name": "STM32",
  "Medal_Name_CN": "STM32",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "GD32",
  "Medal_Name_CN": "GD32",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "MicroTech",
  "Medal_Name_CN": "微机原理",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "uCOS3Dev",
  "Medal_Name_CN": "μC/OS-Ⅲ原理与应用开发",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "AD",
  "Medal_Name_CN": "Altium Designer",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "JLC-EDA",
  "Medal_Name_CN": "立创EDA",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "Multisim",
  "Medal_Name_CN": "Multisim",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "MATLAB",
  "Medal_Name_CN": "MATLAB",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "WeldTech",
  "Medal_Name_CN": "焊接",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "TempModule",
  "Medal_Name_CN": "体温",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "ECGModule",
  "Medal_Name_CN": "心电",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "SpO2Module",
  "Medal_Name_CN": "血氧",
  "Medal_Tag": "硬件组"
},
{
  "Medal_Name": "VTK",
  "Medal_Name_CN": "VTK手术机器人",
  "Medal_Tag": "软件组"
},
{
  "Medal_Name": "CLang",
  "Medal_Name_CN": "C语言程序设计",
  "Medal_Tag": "软件组"
},
{
  "Medal_Name": "Cpp",
  "Medal_Name_CN": "C++程序设计",
  "Medal_Tag": "软件组"
},
{
  "Medal_Name": "QT",
  "Medal_Name_CN": "Qt程序设计",
  "Medal_Tag": "软件组"
},
{
  "Medal_Name": "EliteBlue",
  "Medal_Name_CN": "骨干-蓝",
  "Medal_Tag": "特殊勋章"
},
{
  "Medal_Name": "EliteYellow",
  "Medal_Name_CN": "骨干-黄",
  "Medal_Tag": "特殊勋章"
},
{
  "Medal_Name": "PioneerX",
  "Medal_Name_CN": "开拓先锋",
  "Medal_Tag": "特殊勋章"
}

medals: [
        {
          id: 1,
          name: 'STM32',
          date: '获得日期：2025.1.1',
          icon: '/medals/STM32.png', //图片存在public里面
          category: '硬件组',
        },
        {
          id: 2,
          name: 'GD32',
          date: '获得日期：2025.1.1',
          icon: '/medals/GD32.png', 
          category: '硬件组',
        },
        {
          id: 3,
          name: '微机原理',
          date: '获得日期：2025.1.1',
          icon: '/medals/MicroTech.png', 
          category: '硬件组',
        },
        {
          id: 4,
          name: 'μC/OS-Ⅲ原理与应用开发',
          date: '获得日期：2025.1.1',
          icon: '/medals/uCOS3Dev.png',
          category: '硬件组',
        },
        {
          id: 5,
          name: 'Altium Designer',
          date: '获得日期：2025.1.1',
          icon: '/medals/AD.png',
          category: '硬件组',
        },
        {
          id: 6,
          name: '立创EDA',
          date: '获得日期：2025.1.1',
          icon: '/medals/JLC-EDA.png',
          category: '硬件组',
        },
        {
          id: 7,
          name: 'Multisim',
          date: '获得日期：2025.1.1',
          icon: '/medals/Multisim.png',
          category: '硬件组',
        },
        {
          id: 8,
          name: 'MATLAB',
          date: '获得日期：2025.1.1',
          icon:'/medals/MATLAB.png',
          category: '硬件组',
        },
        {
          id: 9,
          name: '焊接',
          date: '获得日期：2025.1.1',
          icon: '/medals/WeldTech.png',
          category: '硬件组',
        },
        {
          id: 10,
          name: '体温',
          date: '获得日期：2025.1.1',
          icon: '/medals/TempModule.png',
          category: '硬件组',
        },
        {
          id: 11,
          name: '心电',
          date: '获得日期：2025.1.1',
          icon: '/medals/ECGModule.png',
          category: '硬件组',
        },
        {
          id: 12,
          name: '血氧',
          date: '获得日期：2025.1.1',
          icon: '/medals/SpO2Module.png',
          category: '硬件组',
        },
        {
          id: 13,
          name: 'VTK手术机器人',
          date: '获得日期：2025.1.1',
          icon: '/medals/VTK.png',
          category: '软件组',
        },
        {
          id: 14,
          name: 'C语言程序设计',
          date: '获得日期：2025.1.1',
          icon: '/medals/CLang.png',
          category: '软件组',
        },
        {
          id: 15,
          name: 'C++程序设计',
          date: '获得日期：2025.1.1',
          icon: '/medals/Cpp.png',
          category: '软件组',
        },
        {
          id: 16,
          name: 'Qt程序设计',
          date: '获得日期：2025.1.1',
          icon: '/medals/QT.png',
          category: '软件组',
        },
        {
          id: 17,
          name: '骨干-蓝',
          date: '获得日期：2025.1.1',
          icon: '/medals/EliteBlue.png',
          category: '特殊勋章',
        },
        {
          id: 18,
          name: '骨干-黄',
          date: '获得日期：2025.1.1',
          icon: '/medals/EliteYellow.png',
          category: '特殊勋章',
        },
        {
          id: 19,
          name: '开拓先锋',
          date: '获得日期：2025.1.1',
          icon: '/medals/PioneerX.png',
          category: '特殊勋章',
        },
      ],
