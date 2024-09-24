<!-- 使用vue3语法 -->
<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref } from 'vue'

const User_Medal = ref()
const User_Email = ref()
const User_Name = ref()
const User_Stage = ref()


// 将获取到的用户数据打印到控制台
onMounted(() => {
  api({
    url: "/user/user_index",
    method: "get",
  }).then((res) => {
    if (res.data.code == 200) {
      console.log(res)
      User_Email.value = res.data.User_Email
      User_Medal.value = res.data.User_Medal
      User_Name.value = res.data.User_Name
      User_Stage.value = res.data.User_Stage

    }
  })
})
</script>

<template>
  <h1>USERPAGE</h1>
</template>

<style scoped></style>
