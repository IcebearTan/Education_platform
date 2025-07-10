<script setup>
import { ref, reactive } from 'vue';
import api from '../../api';
import md5 from 'js-md5';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  code: ''
});

const registerFormRef = ref(null);
const router = useRouter();

// 验证码倒数模块
const getCode = ref('获取验证码');
const isGeting = ref(false);
const count = ref(60);
const disable = ref(false);
let timer = null;

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 15, message: '姓名长度需要在2-15个字符之间', trigger: 'blur' },
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
  password: [
    { required: true, message: '请输入用户密码', trigger: 'blur' },
    { min: 6, message: '用户密码长度需要至少8个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'submit' }
  ]
});

// 验证表单（用于获取验证码前的简单校验）
const validateForm = () => {
  if (!registerForm.username) {
    ElMessage.error('请填写用户名');
    return false;
  }
  if (!registerForm.password) {
    ElMessage.error('请填写密码');
    return false;
  }
  if (!registerForm.confirmPassword) {
    ElMessage.error('请再次输入密码');
    return false;
  }
  if (!registerForm.email) {
    ElMessage.error('请填写邮箱');
    return false;
  }
  return true;
};

// 提交验证码
const submitEmail = async () => {
  if (!validateForm()) return;
  try {
    const res = await api({
      url: '/auth/captcha/email',
      method: 'post',
      data: { User_Email: registerForm.email }
    });
    if (res.data.code === 200) {
      localStorage.setItem('token', res.data.token);
      ElMessage.success('验证码已发送到您的邮箱，请查收');
      // 按钮倒数
      if (timer) clearInterval(timer);
      count.value = 60;
      isGeting.value = true;
      disable.value = true;
      getCode.value = `${count.value}s后重发`;
      timer = setInterval(() => {
        count.value--;
        if (count.value < 1) {
          isGeting.value = false;
          disable.value = false;
          getCode.value = '获取验证码';
          clearInterval(timer);
        } else {
          getCode.value = `${count.value}s后重发`;
        }
      }, 1000);
    } else {
      ElMessage.error(res.data.msg || '验证码发送失败');
    }
  } catch (err) {
    ElMessage.error('验证码发送失败');
  }
};

// 提交注册表单
const submitForm = async () => {
  if (!registerFormRef.value) return;
  registerFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请检查表单填写');
      return;
    }
    const User_Password = md5(registerForm.password);
    try {
      const res = await api({
        url: '/auth/register',
        method: 'post',
        data: {
          User_Name: registerForm.username,
          User_Password,
          User_Email: registerForm.email,
          User_Captcha: registerForm.code
        }
      });
      if (res.data.code === 200) {
        localStorage.setItem('token', res.data.token);
        ElMessage.success('注册成功');
        setTimeout(() => {
          router.push('/login');
        }, 500);
      } else {
        ElMessage.error(res.data.msg || '注册失败');
      }
    } catch (err) {
      ElMessage.error('注册失败');
    }
  });
};
</script>

<template>
    <div class="login-container">
        <el-container>
            <el-header>
                <img style="width: 50px; position: relative; top: 15px;" src="../../assets/Logo_NewYear.png" />
                <span style="font-size: 25px; margin-bottom: 20px; font-weight: bold;">注册账号</span>
            </el-header>
            <el-main>
                <el-form ref="registerFormRef" style="max-width: 600px" :model="registerForm" status-icon :rules="rules"
                    label-width="auto" class="demo-ruleForm">
                    <el-form-item prop="username">
                        <el-input v-model="registerForm.username" type="text" autocomplete="off" placeholder="输入真实姓名" class="input"/>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model="registerForm.password" type="password" autocomplete="off" placeholder="输入密码" class="input" show-password/>
                    </el-form-item>
                    <el-form-item prop="confirmPassword">
                        <el-input v-model="registerForm.confirmPassword" type="password" autocomplete="off" placeholder="再次输入密码" class="input" show-password/>
                    </el-form-item>
                    <el-form-item prop="email">
                        <el-input v-model="registerForm.email" type="email" autocomplete="off" placeholder="输入邮箱作为账号标识" class="input"/>
                    </el-form-item>
                    <el-form-item prop="code">
                        <div style="display: flex;">
                            <el-input v-model="registerForm.code" type="text" autocomplete="off" placeholder="验证码" class="input"/>
                            <!-- <el-button type="primary" @click="submitEmail(registerForm.email)">
                                获取邮箱验证码
                            </el-button> -->
                            <el-button type="plain" :disabled="disable" :class="{ codeGeting: isGeting }"
                                @click="submitEmail" class="confirm-button">{{ getCode }}</el-button>
                        </div>

                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm(registerForm)" class="submit-button">
                            注册
                        </el-button>
                    </el-form-item>
                </el-form>

                <el-link href="/login" type="primary">已有账户，前去登录</el-link>
            </el-main>
            <el-footer class="footer">
                注册和登录什么也代表不了
            </el-footer>
        </el-container>
    </div>
</template>

<style scoped>
.login-container {
    width: 350px;
    height: 550px;
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

.confirm-button {
    width: 120px;
    height: 40px;

    margin-left: 5px;

    border-radius: 4px;
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
