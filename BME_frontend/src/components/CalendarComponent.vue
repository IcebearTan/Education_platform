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
  <div class="calendarContainer">
    <div class="calendarCard">
      <div class="calendarHeader">
        <div>出勤日历</div>
        <div>
          <span style="margin-right: 10px;">累计出勤： 0 天</span>
          <span>最高连续： 0 天</span>
        </div>
      </div>
      <div class="calendarBody">
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
        <div class="calendars"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendarContainer{
  width: 100%;
  /* height: 300px; */
  /* background-color: #fff; */
  /* border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-right: 10px; */
  /* margin-top: 10px; */
  margin-bottom: 10px;
}
.calendarCard{
  /* width: 100%; */
  height: 250px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  margin-right: 10px;
}
.calendarHeader{
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
.calendarBody{
  height: 260px;
  display: flex;
  justify-content: space-evenly;
}
.calendars{
  width: 160px;
  height: 150px;

  border-radius: 5px;
  background-color: #6666665b;

  margin: 1px;
  margin-top: 20px;
}
</style>
