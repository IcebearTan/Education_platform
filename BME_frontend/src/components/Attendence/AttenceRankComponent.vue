<template>
  <div class="rank-container">
    <div class="title">出勤月榜</div>
    <div class="student-container">
        <div class="single-student-container" v-for="(user, index) in userRanks" :key="index">
            <div :class="{'index': true, 'index-gold': index === 0, 'index-silver': index === 1, 'index-bronze': index === 2}">{{ index + 1 }}</div>
            <div class="block">
                <el-avatar :size="40" :src="userAvatars[index]" />
            </div>
            <div class="username">{{ user.user_name }}</div>
            <div class="progress">
                <div class="label">{{ user.total_hours }} h</div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent } from 'vue'
import { reactive, ref, onMounted } from 'vue';
import api from '../../api';

const users = reactive([
    {
        index: 1,
        username: 'Icebear',
        progress: 16,
    },
    {
        index: 2,
        username: 'Icebear2',
        progress: 15,
    },
    {
        index: 3,
        username: 'Icebear3',
        progress: 14,
    },
    {
        index: 4,
        username: 'Icebear4',
        progress: 13,
    },
    {
        index: 5,
        username: 'Icebear5',
        progress: 12,
    },
    {
        index: 6,
        username: 'Icebear6',
        progress: 11,
    },
    {
        index: 7,
        username: 'Icebear7',
        progress: 10,
    },
    {
        index: 8,
        username: 'Icebear8',
        progress: 9,
    }
])

const userRanks = ref([])
const userIds = ref([])
const userAvatars = ref([]) // 用于存储用户头像

const fetchUsersRank = async () => {
    try {
        const response = await api({
            url: '/records_top10',
            method: 'get'
        })
        userRanks.value = response.data
        userIds.value = response.data.map(user => user.user_id)
        await fetchUserAvatars();
    } catch (error) {
        console.log(error)
    }
}
const fetchUserAvatars = async (id) => {
    userAvatars.value = []; // 初始化头像数组
    for (const userId of userIds.value) {
        try {
            const response = await api({
                url: '/user/user_avatars_id',
                method: 'get',
                params: { // 使用 params 传递单个 ID
                    User_Id: userId
                }
            });
            // 假设 API 返回一个包含头像 URL 的对象
            if (response.data.User_Avatar) {
                userAvatars.value.push(`data:image/png;base64,${response.data.User_Avatar}`); // 将头像 URL 添加到数组中
            } else {
                userAvatars.value.push('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'); // 默认头像
            }
        } catch (error) {
            console.log(`Error fetching avatar for user ${userId}:`, error);
            userAvatars.value.push('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'); // 出错时使用默认头像或 null
        }
    }
}


onMounted(() => {
    fetchUsersRank();
})
</script>

<style scoped>
.rank-container{
    background-color: #ffffff;
    /*order-radius: 12px;*/
    padding: 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 800px;
    margin: 0;
    margin-right: 60px;
}
.title{
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 15px;
  border-bottom: solid 3px #333;

  width: fit-content;
}
.single-student-container{
    display: flex;
    align-items: center;
    /* justify-content: space-between; */

    width: 100%;
    margin-right: 60px;
    margin-top: 20px;
}
.block{
    display: flex;
    align-items: center;
    width: 40px;

    margin-left: 20px;
}
.block-instructor{
    display: flex;
    align-items: center;
    width: 50px;

    /* margin-bottom: 20px; */
}
.instructor-container{
    margin-bottom: 20px;

    display: flex;
    align-items: center;
}
.instructor-name{
    font-size: 18px;
    margin-left: 20px;

    color: #333;
}
.instructor-label{
    font-size: 20px;
    font-weight: bold;

    color: #FFD700;
    text-shadow: 0 0 3px #FFD700;

    margin-left: auto;
}
.index{
    font-size: 20px;
    font-weight: bold;
}
.index-gold{
    font-size: 20px;
    font-weight: bold;

    color: #FFD700;
    text-shadow: 0 0 5px #FFD700;
}
.index-silver{
    font-size: 20px;
    font-weight: bold;

    color: #C0C0C0;
    text-shadow: 0 0 5px #C0C0C0;
}
.index-bronze{
    font-size: 20px;
    font-weight: bold;

    color: #CD7F32;
    text-shadow: 0 0 5px #CD7F32;
}
.username{
    font-size: 18px;
    margin-left: 20px;

    color: #333;
}
.progress{
    margin-left: auto;
    width : 100px;
    display: flex;
    align-items: center;
}
.label{
    font-size: 15px;
    margin-right: 10px;

    color: #999;
}
</style>