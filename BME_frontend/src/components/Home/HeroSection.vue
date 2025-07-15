<template>
  <div class="hero-section">
    <!-- 公告跑马灯 -->
    <div class="marquee-container">
      <div class="marquee-content">
        <span>{{ announcementText }}</span>
      </div>
    </div>
    
    <!-- Logo 和标题区域 -->
    <div class="hero-main">
      <div class="logo-title-container">
        <div class="logo-img-wrapper">
          <img 
            src="../../assets/Logo_NewYear.png" 
            :alt="logoAlt" 
            class="hero-logo" 
            @click="onLogoClick"
          />
        </div>
        <h1 class="hero-title">{{ title }}</h1>
      </div>
      <p class="hero-description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props 定义
const props = defineProps({
  title: {
    type: String,
    default: '卓越工程师训练营'
  },
  description: {
    type: String,
    default: '中山大学生物医学工程医工融合科创协会在线教育平台'
  },
  logoSrc: {
    type: String,
    default: '../../assets/Logo_NewYear.png'
  },
  logoAlt: {
    type: String,
    default: 'BME Logo'
  },
  announcementText: {
    type: String,
    default: '！！由于线上打卡制作完成，请大家把自己的昵称改成真实姓名！！ 如在使用网站时发现问题，可以将问题发送至"caozhx8@mail2.sysu.edu.cn"或"wujj258@mail2.sysu.edu.cn"'
  }
})

// Events 定义
const emit = defineEmits(['logoClick'])

const onLogoClick = () => {
  emit('logoClick')
}
</script>

<style scoped>
.hero-section {
  width: 100%;
  background: linear-gradient(135deg, #fefcff 0%, #f8fafc 100%);
  padding-bottom: 40px;
}

/* 公告跑马灯 */
.marquee-container {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  background: linear-gradient(90deg, #f0f0f0 0%, #e8e8e8 100%);
  color: #444;
  font-size: 14px;
  padding: 12px 0;
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.1);
}

.marquee-content {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 20s linear infinite;
  font-weight: 500;
}

@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}

/* Hero 主体区域 */
.hero-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.logo-img-wrapper {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 8px 32px rgba(244, 203, 138, 0.3);
  border: 4px solid rgba(244, 203, 138, 0.2);
}

.hero-logo {
  width: 140%;
  height: 140%;
  object-fit: cover;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  /* 居中显示 */
  display: block;
  margin: 0 auto;
}

.hero-logo:hover {
  transform: rotate(360deg) scale(1.05);
  box-shadow: 0 12px 48px rgba(244, 203, 138, 0.4);
}

.hero-title {
  font-size: clamp(32px, 8vw, 80px);
  font-weight: 700;
  color: #f4cb8a;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  letter-spacing: -0.02em;
  margin: 0;
  text-align: center;
  background: linear-gradient(135deg, #f4cb8a 0%, #e6b87a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: clamp(16px, 2.5vw, 20px);
  color: #666;
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-main {
    padding: 40px 15px 15px;
  }
  .logo-title-container {
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }
  .logo-img-wrapper {
    width: 120px;
    height: 120px;
  }
  .hero-logo {
    width: 130%;
    height: 130%;
  }
  .marquee-container {
    font-size: 12px;
    padding: 8px 0;
  }
}

@media (max-width: 480px) {
  .logo-img-wrapper {
    width: 100px;
    height: 100px;
  }
  .hero-logo {
    width: 140%;
    height: 140%;
  }
  .logo-title-container {
    gap: 15px;
    margin-bottom: 15px;
  }
}
</style>
