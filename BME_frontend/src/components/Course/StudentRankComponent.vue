<template>
  <div>
    <!-- <div class="title">导师</div> -->
    <div class="instructor-container">
        <div class="block-instructor">
            <el-avatar :size="50" :src="teacher.avatar" />
        </div>
        <div class="instructor-name">{{ teacher.name }}</div>
        <div class="instructor-label">{{ teacher.label }}</div>
    </div>
    <div class="title">小组排名</div>
    <div class="student-container">
        <div class="single-student-container" v-for="(user, index) in users" :key="index">
            <div :class="{'index': true, 'index-gold': index === 0, 'index-silver': index === 1, 'index-bronze': index === 2}">{{ index + 1 }}</div>
            <div class="block">
                <el-avatar :size="40" :src="userAvatars[user.user_id] || defaultAvatarUrl" />
            </div>
            <div class="username">{{ user.username }}</div>
            <div class="progress">
                <div class="label">{{ user.chapter_num }} / {{ props.chapters }}</div>
                <div style="width: 20px; display: flex; align-items: center;">
                    <el-progress type="circle" :percentage="user.displayProgress * 100 / props.chapters" :width="20" :show-text="false" stroke-width="3"/>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, defineProps, ref, computed, watch } from 'vue';
import api from '../../api';

const props = defineProps({
    courseId: {
        type: String,
        required: true
    },
    chapters: {
        type: Number,
        default: 0 // 默认章节数
    }
})

const courseId = props.courseId;
const progressList = ref([]);
const teacher = ref({
    id: '',
    name: '',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    label: '导师'
});

const getProgressList = async () => {
    try {
        const res = await api({
            url: `/learningProgress/group_through_courseid`,
            method: 'get',
            params: {
                Course_Id: courseId
            }
        });

        progressList.value = res.data.data;
        teacher.value.name = res.data.data.teacher_name || 'Jie Luo';
        teacher.value.id = res.data.data.teacher_id || '';
        getTeacherAvatar(res.data.teacher_id);
    } catch (err) {
        console.error(err);
        return [];
    }
}

const getTeacherAvatar = async (teacherId) => {
    try {
        const res = await api({
            url: `/user/user_avatars_id`,
            method: 'get',
            params: {
                User_Id: teacher.value.id
            }
        });

        if (res.data.code === 200) {
            teacher.value.avatar = 'data:image/jpeg;base64,' + res.data.User_Avatar;
        }
    } catch (err) {
        console.error(err);
    }
}

// 处理排序和提取
const sortedUsers = computed(() => {
    if (!progressList.value.result) return [];
    return progressList.value.result.map(item => ({
        user_id: item.user_id,
        username: item.username,
        chapter_num: item.records[0]?.chapter_num ?? 0
        }))
        .sort((a, b) => b.chapter_num - a.chapter_num); // 按章节数降序
});

const users = ref([]);
// 监听 sortedUsers 变化，生成 users 并初始化动画
watch(sortedUsers, (newList) => {
  users.value = newList.map(user => ({
    ...user,
    displayProgress: 0
  }));
  users.value.forEach(user => animateUserProgress(user));
}, { immediate: true });

const userAvatars = ref({}); // { [user_id]: avatarUrl }
const defaultAvatarUrl = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

const getUserAvatar = async (userId) => {
    try {
        const res = await api({
            url: `/user/user_avatars_id`,
            method: 'get',
            params: {
                User_Id: userId
            }
        });

        if (res.data.code === 200) {
            userAvatars.value[userId] = 'data:image/jpeg;base64,' + res.data.User_Avatar;
        } else {
            userAvatars.value[userId] = defaultAvatarUrl; // 使用默认头像
        }
    } catch (err) {
        console.error(err);
        userAvatars.value[userId] = defaultAvatarUrl; // 使用默认头像
    }
};

watch(sortedUsers, (users) => {
  users.forEach(user => {
    getUserAvatar(user.user_id);
  });
}, { immediate: true });

const animationSpeed = 15; // 数字越小动画越快，可根据需要调整

function animateUserProgress(user) {
    const target = user.chapter_num;
    function step() {
        if (user.displayProgress < target) {
            user.displayProgress += Math.max((target - user.displayProgress) / animationSpeed, 0.2);
            if (user.displayProgress > target) user.displayProgress = target;
            requestAnimationFrame(step);
        } else {
            user.displayProgress = target;
        }
    }
    step();
}

onMounted(() => {
    getProgressList();

    // 给每个 users 增加 displayProgress 字段
    users.value.forEach(user => {
        user.displayProgress = 0;
        animateUserProgress(user);
    });
});

</script>

<style scoped>
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

    display: flex;
    align-items: center;
}
.label{
    font-size: 15px;
    margin-right: 10px;

    color: #999;
}
</style>
