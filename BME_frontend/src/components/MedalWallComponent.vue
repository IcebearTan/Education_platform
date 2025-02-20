<template>
  <div class="background">
    <div class="medal-wall">
      <h1 class="medal-title">勋章墙</h1>
      <div class="content">
        <div class="left-bar">
          <button class="category-button" :class="{active:currentCategory===''}" @click="currentCategory=''">全部</button>
          <button class="category-button" :class="{active:currentCategory==='软件组'}" @click="currentCategory='软件组'">软件组</button>
          <button class="category-button" :class="{active:currentCategory==='硬件组'}" @click="currentCategory='硬件组'">硬件组</button>
          <button class="category-button" :class="{active:currentCategory==='先进制造组'}" @click="currentCategory='先进制造组'">先进制造组</button>
        </div>
        <div class="medal-grid">
          <div class="medal" v-for="medal in filteredMedals" :key="medal.id">
            <img src="/image.png" :alt="medal.name" class="medal-icon" />
            <div class="medal-info">
              <h3>{{ medal.name }}</h3>
              <p>{{ medal.date }}</p>
            </div>
          </div>
        </div>  
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedalWall',
  data() {
    return {
      currentCategory: '',
      medals: [
        {
          id: 1,
          name: '软件组勋章名字',
          date: '获得日期：2025.1.1',
          icon: 'public\image.png', //图片存在public里面
          category: '软件组',
        },
        {
          id: 2,
          name: '勋章2',
          date: '获得日期：2025.1.1',
          icon: '/medal.png', 
          category: '软件组',
        },
        {
          id: 3,
          name: '勋章3',
          date: '获得日期：2025.1.1',
          icon: '/medal.png', 
          category: '软件组',
        },
        {
          id: 4,
          name: '勋章4',
          date: '获得日期：2025.1.1',
          icon: '/medal.png',
          category: '软件组',
        },
        {
          id: 5,
          name: '勋章',
          date: '获得日期：2025.1.1',
          icon: '/medal.png',
          category: '软件组',
        },
        {
          id: 6,
          name: '硬件组勋章名字',
          date: '获得日期：2025.1.1',
          icon: '/medal2.png',
          category: '硬件组',
        },
        {
          id: 7,
          name: '勋章',
          date: '获得日期：2025.1.1',
          icon: '/medal2.png',
          category: '硬件组',
        },
        {
          id: 8,
          name: '勋章',
          date: '获得日期：2025.1.1',
          icon:'/medal2.png',
          category: '硬件组',
        },
        {
          id: 9,
          name: '勋章',
          date: '获得日期：2025.1.1',
          icon: '/medal2.png',
          category: '硬件组',
        },
        {
          id: 10,
          name: '先进制造组勋章名字',
          date: '获得日期：2025.1.1',
          icon: '/medal3.png',
          category: '先进制造组',
        },
        {
          id: 11,
          name: '勋章',
          date: '获得日期：2025.1.1',
          icon: '/medal3.png',
          category: '先进制造组',
        },
      ],
    };
  },
  computed:{
    filteredMedals(){
      if(this.currentCategory===''){
        return this.medals;
      }else{
        return this.medals.filter(medal=>medal.category===this.currentCategory);
      }
    },
  },
};
</script>

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
  background: linear-gradient(to bottom, #cfe9ff,#fff);
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
  border-radius: 8px;
  padding: 15px;
  width:90%;
  text-align: center;
  background: #fff;
  /* box-shadow: 0px 0px 8px rgba(203, 213, 224, 0.838); */
  height: 200px;
}

.medal-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 10px;
  border-radius: 8px;
}

.medal-info h3 {
  font-size: 16px;
  margin: 5px 0;
  color: #333;
}

.medal-info p {
  font-size: 14px;
  color: #666;
}
</style>



