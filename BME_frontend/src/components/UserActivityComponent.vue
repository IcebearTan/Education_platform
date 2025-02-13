<!-- 使用vue3语法 -->
<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';

onMounted(() => {
  
})

</script>

<template>
  <div class="ActivityContainer">
    <div class="ActivityCard">
      <div class="ActivityHeader">
        
      </div>
      <div class="ActivityBody">
        Null
      </div>
    </div>
  </div>
</template>

<style scoped>
.ActivityContainer{
  width: 100%;
  /* height: 300px; */
  /* background-color: #fff; */
  /* border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-right: 10px; */
}
.ActivityCard{
  /* width: 100%; */
  height: 250px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  margin-right: 10px;
}
.ActivityHeader{
  height: 40px;
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
  /* padding: 0 10px; */
  font-size: 16px;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #eee;
}
.ActivityBody{
  height: 260px;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 100px;
  font-weight: bolder;
}
</style>
