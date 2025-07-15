<template>
    <div class="login-container">
        <el-container>
            <el-header>
                <img style="width: 50px; position: relative; top: 15px;" src="../../assets/Logo_NewYear.png" />
                <span style="font-size: 25px; margin-bottom: 20px; font-weight: bold;">登录</span>
            </el-header>
            <el-main>
                <el-form ref="loginFormRef" style="max-width: 600px;" :model="loginForm" status-icon :rules="rules"
                    label-width="auto" class="demo-ruleForm" @keyup.enter.native="submitForm()">

                    <el-form-item prop="email">
                        <el-input v-model="loginForm.email" type="email" autocomplete="off" placeholder="输入邮箱"
                            class="input" />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model="loginForm.password" type="password" autocomplete="off" show-password
                            placeholder="输入密码" class="input" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm()" class="submit-button">
                            登录
                        </el-button>
                    </el-form-item>
                </el-form>

                <div style="display: flex; justify-content: space-between;">
                    <el-link href="/register" type="primary">没有账户，前去注册</el-link>
                    <el-link href="/find_password" type="primary">忘记密码</el-link>
                </div>


            </el-main>
            <el-footer class="footer">
                注册和登录什么也代表不了
            </el-footer>
        </el-container>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import api from '../../api'
import md5 from 'js-md5'
import { ElMessage } from 'element-plus'

const store = useStore()
const router = useRouter()

const loginForm = ref({
  password: '',
  email: '',
})

const rules = {
  password: [
    { required: true, message: '请输入用户密码', trigger: 'blur' },
    { min: 6, message: '用户密码长度需要至少8个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
  ],
}

function validateForm() {
  if (!loginForm.value.email) {
    ElMessage.error('请填写邮箱')
    return false
  }
  if (!loginForm.value.password) {
    ElMessage.error('请填写密码')
    return false
  }
  return true
}

async function fetchAvatar() {
  try {
    const res = await api({
      url: '/user/user_avatars',
      method: 'get',
    })
    if (res.data.code === 200 && res.data.User_Avatar) {
      store.commit('setAvatar', 'data:image/png;base64,' + res.data.User_Avatar)
    } else {
      store.commit('setAvatar', 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
    }
  } catch (e) {
    store.commit('setAvatar', 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
  }
}

async function submitForm() {
  if (!validateForm()) return
  try {
    const User_Password = md5(loginForm.value.password)
    const res = await api({
      url: '/auth/login',
      method: 'post',
      data: {
        User_Email: loginForm.value.email,
        User_Password,
      },
    })
    if (res.data.code === 200) {
      localStorage.setItem('token', res.data.token)
      store.commit('setUser', res.data)
      await fetchAvatar()
      router.push('/')
      ElMessage.success('登录成功')
    }
  } catch (err) {
    
    if (err.status === 402) {
        // ElMessage.error('密码错误或邮箱不存在')
        ElMessage.error('密码错误或邮箱不存在')
    } else {
        ElMessage.error('网络错误或服务器异常')
    }
  }
}
</script>

<style scoped>
.login-container {
    width: 350px;
    height: 400px;
    display: flex;
    justify-content: center;
    margin: 20px;

    border-radius: 20px;
    box-shadow: 0 6px 15px 0px rgb(209, 209, 209);
}

.submit-button {
    width: 100%;
    height: 40px;

    border-radius: 10px;
}

.input {
    width: 100%;
    height: 40px;

    border-radius: 20px;
}

.footer {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #999999;

    margin-top: 10px;
}
</style>
