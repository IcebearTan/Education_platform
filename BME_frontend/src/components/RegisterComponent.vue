<script>
import { ref, reactive } from 'vue';
import api from '../api';
import md5 from 'js-md5';
import { ElMessage } from 'element-plus';

export default {
  setup() {
    // 注册表单数据
    const registerForm = reactive({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      code: ""
    });

    const registerFormRef = ref(null);

    // 验证码倒数模块
    const getCode = ref('获取验证码');
    const isGeting = ref(false);
    const count = ref(60);
    const disable = ref(false);

    // 表单验证规则
    const rules = reactive({
      username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 4, max: 15, message: "用户名长度需要在4-15个字符之间", trigger: "blur" },
        {
          validator: (rule, value, callback) => {
            if ('\u4000' <= value && value <= '\u9fa5') {
              callback(new Error('用户名不能包含中文'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ],
      password: [
        { required: true, message: "请输入用户密码", trigger: "blur" },
        { min: 6, message: "用户密码长度需要至少8个字符", trigger: "blur" },
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
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] },
      ],
      code: [
        { required: true, message: "请输入验证码", trigger: "submit" }
      ]
    });

    // 验证表单
    const validateForm = () => {
      if (!registerForm.username) {
        alert('请填写用户名');
        return false;
      }
      if (!registerForm.password) {
        alert('请填写密码');
        return false;
      }
      if (!registerForm.confirmPassword) {
        alert('请再次输入密码');
        return false;
      }
      if (!registerForm.email) {
        alert('请填写邮箱');
        return false;
      }
      return true;
    };

    // 提交验证码
    const submitEmail = async () => {
      if (!validateForm()) {
        return;
      }

      // 向后端请求验证码发送
      api({
        url: "/auth/captcha/email",
        method: "post",
        data: {
          User_Email: registerForm.email,
        },
      }).then((res) => {
        if (res.data.code == 200) {
          console.log(res.data.token, 'token');
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

    // 提交注册表单
    const submitForm = async () => {
      if (!validateForm()) {
        return;
      }

      const User_Password = md5(registerForm.password);

      // 向后端发送注册信息
      api({
        url: "/auth/register",
        method: "post",
        data: {
          User_Name: registerForm.username,
          User_Password: User_Password,
          User_Email: registerForm.email,
          User_Captcha: registerForm.code,
        },
      }).then((res) => {
        if (res.data.code == 200) {
          console.log(res.data.token, 'token');
          localStorage.setItem("token", res.data.token);
          ElMessage({
            message: '注册成功',
            type: 'success'
          });
          this.$router.push('/login');
        } else {
          ElMessage({
            message: '注册失败',
            type: 'error'
          });
        }
      }).catch((err) => {
        ElMessage({
          message: '注册失败',
          type: 'error'
        });
      });
    };

    return {
      registerForm,
      getCode,
      isGeting,
      count,
      disable,
      rules,
      validateForm,
      submitEmail,
      submitForm,
      registerFormRef
    };
  }
};
</script>

<template>
    <div class="login-container">
        <el-container>
            <el-header>
                <img style="width: 50px; position: relative; top: 15px;" src="../assets/Logo_NewYear.png" />
                <span style="font-size: 25px; margin-bottom: 20px; font-weight: bold;">注册账号</span>
            </el-header>
            <el-main>
                <el-form ref="registerFormRef" style="max-width: 600px" :model="registerForm" status-icon :rules="rules"
                    label-width="auto" class="demo-ruleForm">
                    <el-form-item prop="username">
                        <el-input v-model="registerForm.username" type="text" autocomplete="off" placeholder="输入用户名" class="input"/>
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
