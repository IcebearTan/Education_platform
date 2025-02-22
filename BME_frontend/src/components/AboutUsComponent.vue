<script>
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default {
  name: 'AboutUsComponent',
  mounted() {
    // 注册ScrollTrigger插件
    gsap.registerPlugin(ScrollTrigger);

    // 为每个部分添加动画
    this.animateSection(this.$refs.story, 'left');
    this.animateSection(this.$refs.mission, 'right');
    this.animateSection(this.$refs.frontendTeam, 'left'); // 前端团队
    this.animateSection(this.$refs.backendTeam, 'right'); // 后端团队
  },
  methods: {
    // 动画效果
    animateSection(section, direction) {
      const image = section.querySelector('.image-container');
      const text = section.querySelector('.text-container');

      if (image) {
        gsap.from(image, {
          x: direction === 'left' ? -100 : 100,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      }

      if (text) {
        gsap.from(text, {
          x: direction === 'left' ? 100 : -100,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      }
    },
  },
};
</script>

<template>
  <div class="app">
    <!-- 头部 -->
    <header>
      <h1>关于开发者团队</h1>
    </header>

    <!-- 内容部分 -->
    <main>
      <section id="story" ref="story" class="about-section">
        <div class="image-container">
          <img src="../assets/Logo_plain.png" alt="我们的故事" />
        </div>
        <div class="text-container">
          <h2>我们的故事</h2>
          <p>BME在线教育平台开发团队成立于2024年，从零开始，由一而万。</p>
        </div>
      </section>

      <section id="mission" ref="mission" class="about-section">
        <div class="text-container">
          <h2>我们的使命</h2>
          <p>我们的致力于开发出中山大学生物医学工程卓越工程师训练营一体化在线教育平台，并期望进一步推广使用。</p>
        </div>
        <div class="image-container">
          <img src="../assets/back_groud.jpg" alt="我们的使命" />
        </div>
      </section>

      <!-- 前端团队 -->
      <section id="frontendTeam" ref="frontendTeam" class="about-section">
        
        <div class="text-container">
          <h2>前端团队</h2>
          <h3>前端技术栈为vue3</h3>
          <div class="image-container">
            <!-- <img src="https://via.placeholder.com/600x400" alt="成员一" /> -->
          </div>
          <h3>san-shui</h3>
          <div class="image-container">
            <!-- <img src="https://via.placeholder.com/600x400" alt="成员二" /> -->
          </div>
          <h3>yinginging</h3>
          <div class="image-container">
            <!-- <img src="https://via.placeholder.com/600x400" alt="成员三" /> -->
          </div>
          <h3>成员三</h3>
        </div>

        <div class="image-container">
          <img src="../assets/ice_bear_avatar.jpg" alt="ice bear" />
          <div style="text-align: center;">组长 —— Ice bear</div>
        </div>
      </section>

      <!-- 后端团队 -->
      <section id="backendTeam" ref="backendTeam" class="about-section">
        
        <div class="text-container">
          <h2>后端团队</h2>
          <h3>后端技术栈为flask+mysql</h3>
        </div>

        <div class="image-container">
          <img src="../assets/Jerry_Scintilla_avatar.jpg" alt="Jerry Scintilla" />
          <div style="text-align: center;">组长 —— Jerry Scintilla</div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: white;
  color: #333;
  line-height: 1.6;
}

header {
  background-color: white;
  color: black;
  padding: 20px 0;
  text-align: center;
}

header h1 {
  margin: 0;
  font-size: 2.5rem;
}

nav {
  display: flex;
  justify-content: center;
  background-color: #e5feb8;
  padding: 10px 0;
}

nav a {
  color: black;
  text-decoration: none;
  margin: 0 15px;
  font-size: 1.1rem;
}

nav a:hover {
  text-decoration: underline;
}

main {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.about-section {
  display: flex;
  align-items: center;
  margin-bottom: 80px;
}

.about-section ,
.about-section .text-container {
  flex: 1;
  margin-right: 20px;
}

.image-container {
  flex: 0.7;
}

.about-section img {
  max-width: 100%;
  border-radius: 10px;
}

.about-section h2 {
  font-size: 2rem;
  margin-bottom: 10px;
}

footer {
  background-color: #004c3f;
  color: white;
  text-align: center;
  padding: 20px 0;
  margin-top: 40px;
}

footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .about-section {
    flex-direction: column;
  }

  .about-section .image-container,
  .about-section .text-container {
    margin-bottom: 20px;
  }
}
</style>

{
  "Group_Name": "string",
  "Student_Ids": [
    {
      "student_id":"10"
    }
  ]
}