<!-- 使用vue3语法 -->
<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';

import AvatarUploadComponent from './AvatarUploadComponent.vue';

onMounted(() => {
  
})

</script>

<template>
  <div class="userInfoContainer">
    <div class="UserInfoCard">
      <div class="avatarContainer">
        <AvatarUploadComponent />
      </div>
      <div class="infoContainer"></div>
    </div>
  </div>
</template>

<style scoped>
.userInfoContainer{
  width: 100%;

  margin-top: 10px;
  margin-left: 10px;
}
.UserInfoCard{
  /* width: 100%; */
  height: 250px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  margin-right: 10px;
}
.avatarContainer{
  width: 100%;
}
</style>
