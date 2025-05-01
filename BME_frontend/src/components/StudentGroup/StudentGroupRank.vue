<template>
  <div class="ranking-container">
    <!-- 前三名领奖台 -->
    <div class="podium-group">
      <div class="podium-item silver">
        <div class="avatar-frame">
          <img src="../assets/ice_bear_avatar.jpg" class="avatar" alt="亚军">
        </div>
        <!-- <div class="rank-badge">2</div> -->
        <div class="user-info">
          <h3>李四</h3>
          <p>#2</p>
        </div>
      </div>

      <div class="podium-item gold">
        <!-- <div class="crown">🏆</div> -->
        <div class="avatar-frame">
          <img src="../assets/ice_bear_avatar.jpg" class="avatar" alt="冠军">
        </div>
        <div class="user-info">
          <h3>张三</h3>
          <p>#1</p>
        </div>
      </div>

      <div class="podium-item bronze">
        <div class="avatar-frame">
          <img src="../assets/ice_bear_avatar.jpg" class="avatar" alt="季军">
        </div>
        <!-- <div class="rank-badge">3</div> -->
        <div class="user-info">
          <h3>王五</h3>
          <p>#3</p>
        </div>
      </div>
    </div>

    <!-- 其余排名列表 -->
    <div class="ranking-list">
      <div class="list-item" v-for="n in 7" :key="n">
        <div class="list-rank">{{ n + 3 }}</div>
        <img src="../assets/ice_bear_avatar.jpg" class="list-avatar" alt="用户头像">
        <div class="list-info">
          <h4>用户 {{ n + 3 }}</h4>
          <div class="progress-track">
            <div class="progress-bar" :style="{ width: `${70 - n * 5}%` }"></div>
          </div>
        </div>
        <div class="list-score">第 {{ 1 }} 章</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { onUnmounted, ref } from 'vue';
import { onMounted } from 'vue';
import api from '../../api';

const group = ref(null);
const userAvatars = ref([]);

async function fetchGroupLearnProgress(group_id) {
  try {
    const response = await api.get(`/learningProgress/group?Group_Id=${group_id}`);
    console.log(response);

    // 获取接口返回的 result
    const result = response.data.data.result || [];

    // 遍历 group.value.students，将匹配的 result 合并到 student
    if (group.value && Array.isArray(group.value.students)) {
      group.value.students.forEach(student => {
        // 查找 result 中 user_id === Student_Id 的项
        const match = result.find(item => item.user_id === student.Student_Id);
        if (match) {
          // 合并 result 到 student
          Object.assign(student, match);
        }
      });
    }

    console.log('合并后students:', group.value.students);
  } catch (error) {
    console.error('获取学习进度失败:', error);
  }
}
onMounted(() => {

  const route = useRoute();
  
  if (route.query.group) {
    try {
      group.value = JSON.parse(decodeURIComponent(route.query.group));
      if (group.value) {
        console.log('Group:', group.value);
      }
    } catch (error) {
      console.error('解析group参数时出错:', error);
    }
  }

  // 从localStorage中获取用户头像列表
  userAvatars.value = localStorage.getItem('userAvatars');

  fetchGroupLearnProgress(group.value.group_id);
  // console.log('User Avatars:', userAvatars.value);
});

onUnmounted(() => {
  // 清除localStorage中的用户头像列表
  localStorage.removeItem('userAvatars');
});

</script>

<style scoped>
.ranking-container {
  height: 910px;
  /* max-width: 800px;
  margin: 2rem auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05); */
  overflow-y: auto;
  scrollbar-width: none;
}

/* 领奖台组样式 */
.podium-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #fefcff 0%, #ffffff 100%);
}

.podium-item {
  position: relative;
  text-align: center;
  transition: transform 0.2s ease;
}

.podium-item:hover {
  transform: translateY(-5px);
}

/* 不同名次样式 */
.gold {
  order: 2;
  margin-top: -30px;
}

.silver {
  order: 1;
}

.bronze {
  order: 3;
}

.avatar-frame {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  padding: 5px;
  margin: 0 auto 15px;
}

.gold .avatar-frame {
  background: linear-gradient(135deg, #ffd700 0%, #ffec8a 100%);
  box-shadow: 0 8px 16px rgba(255, 215, 0, 0.2);
}

.silver .avatar-frame {
  background: linear-gradient(135deg, #e5e5e5 0%, #f8f8f8 100%);
  box-shadow: 0 8px 16px rgba(192, 192, 192, 0.2);
}

.bronze .avatar-frame {
  background: linear-gradient(135deg, #cd7f32 0%, #e6b17e 100%);
  box-shadow: 0 8px 16px rgba(205, 127, 50, 0.2);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  /* border: 3px solid white; */
}

.crown {
  font-size: 2.5rem;
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.rank-badge {
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.user-info h3 {
  margin: 0 0 8px;
  font: 500 18px/1.2 'Roboto', sans-serif;
  color: #2d3436;
}

.user-info p {
  margin: 0;
  font: 500 14px/1 'Roboto', sans-serif;
  color: #636e72;
  background: rgba(99, 110, 114, 0.08);
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
}

/* 排名列表样式 */
.ranking-list {
  padding: 20px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: #ffffff;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.list-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.list-rank {
  width: 40px;
  text-align: center;
  font: 700 16px/1 'Roboto', sans-serif;
  color: #adb5bd;
}

.list-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin: 0 16px;
  object-fit: cover;
  border: 2px solid #f1f3f5;
}

.list-info {
  flex: 1;
}

.list-info h4 {
  margin: 0 0 6px;
  font: 500 15px/1.2 'Roboto', sans-serif;
  color: #2d3436;
}

.progress-track {
  height: 6px;
  background: #f1f3f5;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4df7b0 0%, #33f09b 100%);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.list-score {
  font: 500 14px/1 'Roboto', sans-serif;
  color: #495057;
  margin-left: 20px;
  min-width: 80px;
  text-align: right;
}
</style>