<template>
  <div class="login-page" :style="{
      backgroundImage: backgroundImages.length > 0 && backgroundImages[currentBackgroundIndex]
        ? `url(${backgroundImages[currentBackgroundIndex]})`
        : ''
    }">
    <!-- 只保留这一个提示语，fixed定位 -->
    <transition name="fade-tip-anim">
      <div v-if="isFaded" class="fade-tip" :class="{ 'fade-tip-anim': isFaded }">
        页面已进入休眠，动动鼠标或按任意键即可唤醒
      </div>
    </transition>
    <div class="main" :class="{ 'main-fade': isFaded }"
      @mousemove="onUserAction"
      @keydown="onUserAction"
      @mousedown="onUserAction"
      @touchstart="onUserAction"
    >
    <!-- 注册部分 -->
     <!-- <img src="../assets/back_groud.jpg" alt=""> -->
    <div class="container a-container" id="a-container">
      <form class="form" id="a-form" method="" action="" @submit.prevent="submitRegisterForm">
        <h2 class="form_title title">创建新账户</h2>
        <div class="form__icons">
          <!-- <i class="fa-brands fa-qq form__icon"></i> -->
          <!-- <i class="fa-brands fa-alipay form__icon"></i> -->
          <!-- <i class="fa-brands fa-weixin form__icon"></i> -->
        </div>
        <span class="form__span">或者使用电子邮箱注册</span>
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" class="form" @submit.prevent="submitRegisterForm">
        <el-form-item prop="username">
          <el-input class="form__input" v-model="registerForm.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input class="form__input" v-model="registerForm.email" placeholder="电子邮箱" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input class="form__input" v-model="registerForm.password" type="password" placeholder="密码" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input class="form__input" v-model="registerForm.confirmPassword" type="password" placeholder="再次输入密码" show-password />
        </el-form-item>
        <el-form-item prop="code" class="code-form-item">
  <div class="code-input-group">
    <el-input
      class="form__input code-input"
      v-model="registerForm.code"
      placeholder="验证码"
    />
    <button
      type="button"
      class="form__button button code-btn"
      :disabled="disable"
      @click="submitEmail"
    >{{ getCode }}</button>
  </div>
</el-form-item>
      </el-form>
        <button class="form__button button submit" @click=" submitRegisterForm">注册</button>
        <!-- <el-link href="/register" class="form__button button submit">没有账户，前去注册</el-link> -->
      </form>
    </div>

    <!-- 登录部分 -->
    <div class="container b-container" id="b-container">
      <form class="form" id="b-form" method="" action="" @submit.prevent="submitLoginForm">
        <h2 class="form_title title">登录网站</h2>
        <div class="form__icons">
          <!-- <i class="fa-brands fa-qq form__icon"></i> -->
          <!-- <i class="fa-brands fa-alipay form__icon"></i> -->
          <!-- <i class="fa-brands fa-weixin form__icon"></i> -->
        </div>
        <span class="form__span">或者使用您注册的电子邮箱账户</span>
        <!-- <input class="form__input" type="text" placeholder="电子邮箱" v-model="loginForm.email" />
        <input class="form__input" type="password" placeholder="密码" v-model="loginForm.password" /> -->
        <el-form :model="loginForm" :rules="rules">
  <el-form-item prop="email">
    <el-input v-model="loginForm.email" class="form__input" type="email" autocomplete="off" placeholder="输入邮箱" />
  </el-form-item>
  <el-form-item prop="password">
    <el-input v-model="loginForm.password" class="form__input" type="password" autocomplete="off" show-password placeholder="输入密码" />
  </el-form-item>
</el-form>
        <a class="form__link" href="/find_password">忘记密码？</a>
        <button class="form__button button submit" @click="submitLoginForm">登录</button>
      </form>
    </div>

    <!-- 切换部分 -->
    <div class="switch" id="switch-cnt">
      <div class="switch__circle"></div>
      <div class="switch__circle switch__circle--t"></div>
      <div class="switch__container" id="switch-c1">
        <h2 class="switch__title title">欢迎您回来 !</h2>
        <p class="switch__description description">
          要与我们保持联系，请使用您的个人信息登录
        </p>
        <button class="switch__button button switch-btn" @click="changeForm">登录</button>
      </div>

      <div class="switch__container is-hidden" id="switch-c2">
        <h2 class="switch__title title">您好！新朋友!</h2>
        <p class="switch__description description">
          输入您的个人信息，开始我们的旅程
        </p>
        <button class="switch__button button switch-btn" @click="changeForm">注册</button>
      </div>
    </div>
  </div>
</div><!-- <img src="../assets/back_groud.jpg" alt=""> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import api from '../api';
import md5 from 'js-md5';
import defaultPicture from '../assets/background_default.jpg';
import { ElMessage } from 'element-plus';

const store = useStore();
const router = useRouter();
let backGroundIndex=ref(1);

const loginForm = ref({
  email: '',
  password: ''
});

// 注册表单数据，融合新字段
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  code: ''
});

// 验证码倒数模块
const getCode = ref('获取验证码');
const isGeting = ref(false);
const count = ref(60);
const disable = ref(false);

// 模仿 el-form 的 rules 机制

const registerFormRef = ref(null);

// 注册表单校验规则（模仿登录表单方式）
const registerRules = {
  username: [
    { required: true, message: "请输入真实姓名", trigger: "blur" },
    { min: 2, max: 15, message: "姓名长度需要在2-15个字符之间", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!/^[\u4e00-\u9fa5]+$/.test(value)) {
          callback(new Error('用户名必须为中文'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] }
  ],
  password: [
    { required: true, message: "请输入用户密码", trigger: "blur" },
    { min: 6, message: "用户密码长度需要至少6个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== registerForm.value.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" }
  ]
};

const rules = {
                password: [
                    { required: true, message: "请输入用户密码", trigger: "blur" },
                    { min: 6, message: "用户密码长度需要至少8个字符", trigger: "blur" },
                ],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] },
                ],
                // 新增规则
                username: [
                  { required: true, message: "请输入真实姓名", trigger: "blur" },
                  { min: 2, max: 15, message: "姓名长度需要在2-15个字符之间", trigger: "blur" },
                  {
                    validator: (rule, value, callback) => {
                      const isChinese = /^[\u4e00-\u9fa5]+$/.test(value);
                      if (!isChinese) {
                        callback(new Error('用户名必须为中文'));
                      } else {
                        callback();
                      }
                    },
                    trigger: 'blur',
                  },
                ],
                confirmPassword: [
                  { required: true, message: '请再次输入密码', trigger: 'blur' },
                  {
                    validator: (rule, value, callback) => {
                      if (value === '') {
                        callback(new Error('请再次输入密码'));
                      } else if (value !== registerForm.value.password) {
                        callback(new Error('两次输入密码不一致!'));
                      } else {
                        callback();
                      }
                    },
                    trigger: 'blur',
                  },
                ],
                code: [
                  { required: true, message: "请输入验证码", trigger: "submit" }
                ]
            }

// 动态数组存储背景图片路径
const backgroundImages = ref([
defaultPicture
]);
const currentBackgroundIndex = ref(0);

// 背景图片切换逻辑
function startBackgroundRotation() {
  setInterval(() => {
    if (backgroundImages.value.length > 0) {
      const nextIndex = (currentBackgroundIndex.value + 1) % backgroundImages.value.length;
      const currentImage = document.querySelector('.login-page');
      currentImage.classList.add('is-rxl'); // 从右向左滑出
      setTimeout(() => {
        currentImage.style.backgroundImage = `url(${backgroundImages.value[nextIndex]})`;
        currentImage.classList.remove('is-rxl');
        currentImage.classList.add('is-rl'); // 从右向左滑入
        setTimeout(() => {
          currentImage.classList.remove('is-rl');
        }, 1500);
        currentBackgroundIndex.value = nextIndex;
      }, 1500);
    }
  }, 5000);
}


// 表单校验
function validateLoginForm() {
  if (!loginForm.value.email) {
    alert('请填写邮箱');
    return false;
  }
  if (!loginForm.value.password) {
    alert('请填写密码');
    return false;
  }
  return true;
}

// 表单校验（融合新逻辑）
function validateRegisterForm() {
  if (!registerForm.value.username) {
    alert('请填写用户名');
    return false;
  }
  if (!registerForm.value.email) {
    alert('请填写邮箱');
    return false;
  }
  if (!registerForm.value.password) {
    alert('请填写密码');
    return false;
  }
  if (!registerForm.value.confirmPassword) {
    alert('请再次输入密码');
    return false;
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    alert('两次输入密码不一致!');
    return false;
  }
  if (!registerForm.value.code) {
    alert('请填写验证码');
    return false;
  }
  return true;
}

// 获取验证码
const submitEmail = async () => {
  if (!registerForm.value.email) {
    alert('请填写邮箱');
    return;
  }
  // 向后端请求验证码发送
  api({
    url: "/auth/captcha/email",
    method: "post",
    data: {
      User_Email: registerForm.value.email,
    },
  }).then((res) => {
    if (res.data.code == 200) {
      localStorage.setItem("token", res.data.token);
    }
  });

  // 按钮倒数
  const countDown = setInterval(() => {
    if (count.value < 1) {
      isGeting.value = false;
      disable.value = false;
      getCode.value = '获取验证码';
      count.value = 61;
      clearInterval(countDown);
    } else {
      isGeting.value = true;
      disable.value = true;
      getCode.value = `${count.value--}s后重发`;
    }
  }, 1000);

  // 提示消息
  ElMessage({
    message: '验证码已发送到您的邮箱，请查收',
    type: 'success'
  });
};

// 登录
async function submitLoginForm() {
  if (!validateLoginForm()) {
    return;
  }

  const User_Password = md5(loginForm.value.password);

  // 向后端请求用户信息
  let res = null;

  try {
    res = await api({
      url: "/auth/login",
      method: "post",
      data: {
        User_Email: loginForm.value.email,
        User_Password: User_Password
      },
    });
  } catch (error) {
    if (error.response && (error.response.status == 400 || error.response.status == 402)) {
      console.error(error);
      this.$message.error('密码错误或邮箱不存在');
    }
    return;
  }

  console.log(res);

  if (res.data.code == 200) {
    // console.log(res);
    // 将数据存入浏览器
    localStorage.setItem("token", res.data.token);
    store.commit('setUser', res.data);
    await fetchAvatar();

    router.push('/');
    console.log('登录成功');

    this.$message({
      message: '登录成功',
      type: 'success'
    });
  } else if (res.data.code == 402) {
    this.$message({
      message: '密码错误或邮箱不存在',
      type: 'error'
    });
    return;
  }
}

// 注册
async function submitRegisterForm() {
  if (!validateRegisterForm()) return;

  const User_Password = md5(registerForm.value.password);
  api({
    url: '/auth/register',
    method: 'post',
    data: {
      User_Name: registerForm.value.username,
      User_Email: registerForm.value.email,
      User_Password: User_Password,
      User_Captcha: registerForm.value.code
    }
  }).then((res) => {
    if (res.data.code === 200) {
      alert('注册成功，请登录');
      registerForm.value = { username: '', email: '', password: '', confirmPassword: '', code: '' };
    } else {
      alert('注册失败，请重试');
    }
  });
}
async function fetchAvatar() {
            await api({
                url: "/user/user_avatars",
                method: "get",
            }).then((res) => {
                if (res.data.code == 200) {
                    store.commit('setAvatar', res.data.User_Avatar)
                    console.log(store.state.avatar)
                }
            })
        }

function changeForm() {
  const switchCtn = document.querySelector("#switch-cnt");
  const switchC1 = document.querySelector("#switch-c1");
  const switchC2 = document.querySelector("#switch-c2");
  const switchCircle = document.querySelectorAll(".switch__circle");
  const aContainer = document.querySelector("#a-container");
  const bContainer = document.querySelector("#b-container");

  switchCtn.classList.add("is-gx");
  setTimeout(function () {
    switchCtn.classList.remove("is-gx");
  }, 1500);

  switchCtn.classList.toggle("is-txr");
  switchCircle[0].classList.toggle("is-txr");
  switchCircle[1].classList.toggle("is-txr");

  switchC1.classList.toggle("is-hidden");
  switchC2.classList.toggle("is-hidden");
  aContainer.classList.toggle("is-txl");
  bContainer.classList.toggle("is-txl");
  bContainer.classList.toggle("is-z200");
}

// 切换动画逻辑
function mainF() {
  const switchCtn = document.querySelector("#switch-cnt");
  const switchC1 = document.querySelector("#switch-c1");
  const switchC2 = document.querySelector("#switch-c2");
  const switchCircle = document.querySelectorAll(".switch__circle");
  const aContainer = document.querySelector("#a-container");
  const bContainer = document.querySelector("#b-container");
  const allButtons = document.querySelectorAll(".submit");

  const getButtons = (e) => e.preventDefault();

  const changeForm = (e) => {
    switchCtn.classList.add("is-gx");
    setTimeout(function () {
      switchCtn.classList.remove("is-gx");
    }, 1500);

    switchCtn.classList.toggle("is-txr");
    switchCircle[0].classList.toggle("is-txr");
    aContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-z200");
  };

  for (let i = 0; i < allButtons.length; i++)
    allButtons[i].addEventListener("click", getButtons);
}

const timerId = ref(null);
const isFetching = ref(false);

// 带双重保护的请求函数
async function fetchBackground() {
  try {
    if (!isFetching.value) return;
    
    const response = await api.get(`/homeCover/search?Cover_Id=${backGroundIndex.value}`);
    console.log(response.data);

    if (response.data.code === 200) {
      backgroundImages.value.push('data:image/png;base64,' + response.data.covers.cover);
      backGroundIndex.value++;
    } else {
      stopFetchSchedule();
      console.log('已获取所有背景图片');
    }
  } catch (error) {
    stopFetchSchedule();
    console.error('Error fetching background images:', error);
  }
}

// 安全递归函数
const fetchAndSchedule = async () => {
  if (isFetching.value) { // 再次检查状态
    timerId.value = setTimeout(fetchAndSchedule, 6400);
  }

  await fetchBackground();
  
  if (!isFetching.value) return;
};

// 启动函数
function startAutoFetch() {
  isFetching.value = true;
  fetchAndSchedule();
}

// 安全停止函数
function stopFetchSchedule() {
  isFetching.value = false;
  
  if (timerId.value) {
    clearTimeout(timerId.value);
    timerId.value = null;
    console.log('已停止自动获取背景图片');
  }
}

// 休眠机制相关
const isFaded = ref(false);
let fadeTimer = null;
const FADE_DELAY = 5000; // 20秒

function startFadeTimer() {
  clearFadeTimer();
  fadeTimer = setTimeout(() => {
    isFaded.value = true;
  }, FADE_DELAY);
}

function clearFadeTimer() {
  if (fadeTimer) {
    clearTimeout(fadeTimer);
    fadeTimer = null;
  }
}

function onUserAction() {
  if (isFaded.value) {
    isFaded.value = false;
  }
  startFadeTimer();
}

onMounted(() => {
  mainF();
  startBackgroundRotation();
  startAutoFetch();
  window.addEventListener('mousemove', onUserAction);
  window.addEventListener('keydown', onUserAction);
  window.addEventListener('mousedown', onUserAction);
  window.addEventListener('touchstart', onUserAction);
  startFadeTimer();
});

onUnmounted(() => {
  stopFetchSchedule();
  clearFadeTimer();
  window.removeEventListener('mousemove', onUserAction);
  window.removeEventListener('keydown', onUserAction);
  window.removeEventListener('mousedown', onUserAction);
  window.removeEventListener('touchstart', onUserAction);
});

</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-size: contain; /* 等比缩放完整显示 */
  background-repeat: no-repeat; /* 不重复 */
  background-position: center;
  background-color: #fff; /* 可自定义底色，防止留白为黑 */
  animation: fadeIn 1s ease-in-out;
}

@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 16px;
  background-color: #ecf0f3;
  color: #a0a5a8;
}

.main {
  position: relative;
  width: 1000px;
  min-width: 1000px;
  min-height: 600px;
  height: 600px;
  padding: 25px;
  background: rgb(255, 255, 255, 0); /* 设置半透明背景 */
  border-radius: 12px; /* 圆角 */
  box-shadow: none; /* 移除发光阴影 */
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  width: 600px;
  height: 100%;
  padding: 25px;
  background: rgba(255, 255, 255, 0.5);
  transition: 1.25s;
  backdrop-filter: blur(10px);
  border-radius: 12px; /* 添加圆角 */
}

.form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.form__icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.form__icon {
  object-fit: contain;
  font-size: 30px;
  margin: 0 5px;
  opacity: 0.5;
  transition: 0.15s;
}

.form__icon:hover {
  opacity: 1;
  transition: 0.15s;
  color: #4b70e2;
  cursor: pointer;
}

.form__input {
  width: 350px;
  height: 40px;
  margin: 4px 0;
  padding-left: 25px;
  font-size: 13px;
  letter-spacing: 0.15px;
  border: none;
  outline: none;
  font-family: "Montserrat", sans-serif;
  background-color: #ecf0f3;
  transition: 0.25s ease;
  border-radius: 8px; /* 圆角 */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.form__input:focus {
  box-shadow: inset 4px 4px 4px #d1d9e6, inset -4px -4px 4px #f9f9f9;
}

.form__span {
  margin-top: 5px;
  margin-bottom: 22px;
}

.form__link {
  color: #a0a5a8;
  font-size: 15px;
  margin-top: 25px;
  text-decoration: none; /* 移除下划线 */
  line-height: 2;
}

.title {
  font-size: 34px;
  font-weight: 700;
  line-height: 3;
  color: #181818;
}

.description {
  font-size: 14px;
  letter-spacing: 0.25px;
  text-align: center;
  line-height: 1.6;
}

.button {
  width: 180px;
  height: 50px;
  border-radius: 25px; /* 圆角 */
  margin-top: 50px;
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 1.15px;
  background-color: #4b70e2;
  color: #f9f9f9;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.2); /* 阴影 */
  border: none;
  outline: none;
}

.a-container {
  z-index: 100;
  left: calc(100% - 600px);
  backdrop-filter: blur(10px);
}

.b-container {
  left: calc(100% - 600px);
  z-index: 0;
  backdrop-filter: blur(15px); 
}

.switch {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 400px;
  padding: 50px;
  z-index: 200;
  transition: 1.25s;
  background: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  border-radius: 12px; /* 圆角 */
  box-shadow: 6px 6px 15px rgba(0, 0, 0, 0.15); /* 阴影 */
  backdrop-filter: blur(15px); 
}
.switch__circle {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background-color: #ecf0f3;
  box-shadow: inset 8px 8px 12px #d1d9e6, inset -8px -8px 12px #f9f9f9;
  bottom: -60%;
  left: -60%;
  transition: 1.25s;
}
.switch__circle--t {
  top: -30%;
  left: 60%;
  width: 300px;
  height: 300px;
}
.switch__container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  width: 400px;
  padding: 50px 55px;
  transition: 1.25s;
}
.switch__button {
  cursor: pointer;
}
.switch__button:hover {
  box-shadow: 6px 6px 10px #d1d9e6, -6px -6px 10px #f9f9f9;
  transform: scale(0.985);
  transition: 0.25s;
}
.switch__button:active,
.switch__button:focus {
  box-shadow: 2px 2px 6px #d1d9e6, -2px -2px 6px #f9f9f9;
  transform: scale(0.97);
  transition: 0.25s;
}

.is-txr {
  left: calc(100% - 400px);
  transition: 1.25s;
  transform-origin: left;
}

.is-txl {
  left: 0;
  transition: 1.25s;
  transform-origin: right;
}

.is-z200 {
  z-index: 200;
  transition: 1.25s;
}

.is-hidden {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  transition: 1.25s;
}

.is-gx {
  animation: is-gx 1.25s;
}

.is-rxl {
  left: 100%;
  transition: 1.25s;
  transform-origin: right;
}

.is-rl {
  left: 0;
  transition: 1.25s;
  transform-origin: left;
}

@keyframes is-gx {
  0%,
  10%,
  100% {
    width: 400px;
  }
  30%,
  50% {
    width: 500px;
  }
}

@keyframes slideRight {
  from {
    left: 100%;
  }
  to {
    left: 0;
  }
}

@keyframes slideLeft {
  from {
    left: 0;
  }
  to {
    left: 100%;
  }
}
/* 让 el-input 内部背景色与外部一致 */
:deep(.el-input__wrapper) {
  background-color: #ecf0f3 !important;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  border-radius: 8px;
}

/* 校验提示文本样式和位置优化 */
:deep(.el-form-item__error) {
  color: #ff4d4f;
  font-size: 16px;
  margin-top: 2px;
  margin-bottom: 10px;
  position: static;
  text-align: left;
  padding-left: 8px;
}

.code-form-item {
  margin-top: 2px !important;
  margin-bottom: 2px !important; /* 更小的下间距 */
  padding-top: 0;
  padding-bottom: 0;
}

.code-input-group {
  display: flex;
  align-items: center;
  width: 100%; /* 占满父容器 */
  gap: 8px;
}

.code-input {
  width: 232px !important; /* 232 + 110 + 8 = 350 */
  height: 40px;
  flex-shrink: 0;
  margin-right: 0;
}

.code-btn {
  width: 110px;
  height: 40px;
  font-size: 14px;
  padding: 0 !important;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
}

/* 注册按钮上下距离加大 */
.submit {
  margin-top: 20px !important;
  margin-bottom: 44px !important;
  padding-top: 5px;
  padding-bottom: 5px;
}

.main-fade {
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0; /* 完全透明 */
  pointer-events: none;
  filter: blur(2px);
  position: relative;
}

.fade-tip {
  position: fixed; /* 用fixed，不依赖任何父元素 */
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.95);
  color: #ff5252;
  font-size: 18px;
  font-weight: bold;
  padding: 8px 28px;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  transition:
    opacity 2.2s cubic-bezier(0.4, 0, 0.2, 1),
    color 1.2s cubic-bezier(0.4, 0, 0.2, 1),
    background 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

/* 动画部分保持不变 */
.fade-tip-anim {
  opacity: 0.82;
  color: #888;
  background: rgba(255,255,255,0.85);
  transition:
    opacity 2.2s cubic-bezier(0.4, 0, 0.2, 1),
    color 1.2s cubic-bezier(0.4, 0, 0.2, 1),
    background 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-tip-anim-enter-active, .fade-tip-anim-leave-active {
  transition: opacity 2.2s, color 1.2s, background 1.2s;
}
.fade-tip-anim-enter-from, .fade-tip-anim-leave-to {
  opacity: 0;
  color: #ff5252;
  background: rgba(255,255,255,1);
}
.fade-tip-anim-enter-to, .fade-tip-anim-leave-from {
  opacity: 0.82;
  color: #888;
  background: rgba(255,255,255,0.85);
}

</style>