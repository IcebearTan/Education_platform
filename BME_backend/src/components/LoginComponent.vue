<script>
import { useStore } from 'vuex';
import api from '../api';
import md5 from 'js-md5'

export default {

    data() {
        return {
            loginForm: {
                password: "",
                email: "",
            },
            rules: {
                password: [
                    { required: true, message: "请输入用户密码", trigger: "blur" },
                    { min: 6, message: "用户密码长度需要至少8个字符", trigger: "blur" },
                ],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] },
                ],
            },
            store: useStore(),
        }
    },

    methods: {

        validateForm() {
            if (!this.loginForm.email) {
                alert('请填写邮箱');
                return false;
            }

            if (!this.loginForm.password) {
                alert('请填写密码');
                return false;
            }
            return true;
        },

        async submitForm() {
            if (!this.validateForm()) {
                return;
            }

            const User_Password = md5(this.loginForm.password)

            // 向后端请求用户信息
            api({
                url: "/auth/admin_login",
                method: "post",
                data: {
                    User_Email: this.loginForm.email,
                    User_Password: User_Password
                },
            })
            .then((res) => {
                if (res.data.code == 200) {
                    console.log(res)
                    // 将数据存入浏览器
                    localStorage.setItem("token", res.data.token)
                    this.store.commit('setUser', res.data)
                    this.$message({
                        message: '登录成功',
                        type: 'success'
                    });
                    this.$router.push('/')
                }
                if (res.data.code == 400) {
                    console.log(res)
                    console.log(User_Password)
                    this.$message.error('密码错误或邮箱不存在');
                }
            })
            .catch((error) => {
                console.error('请求出错:', error);
                this.$message.error('登录请求失败，请稍后重试');
            });

            // alert('登录成功');
        }
    }
};
</script>

<template>
    <div class="login-bg-center">
        <div class="login-container">
            <el-container>
                <el-header>
                    <img style="width: 50px; position: relative; top: 15px;" src="../assets/Logo_NewYear.png" />
                    <span style="font-size: 25px; margin-bottom: 20px; font-weight: bold;">管理员登录</span>
                </el-header>
                <el-main>
                    <el-form ref="loginForm" style="max-width: 600px;" :model="loginForm" status-icon :rules="rules"
                        label-width="auto" class="demo-ruleForm" @keyup.enter.native="submitForm(loginForm)">

                        <el-form-item prop="email" style="margin-top: 40px;">
                            <el-input v-model="loginForm.email" type="email" autocomplete="off" placeholder="输入邮箱"
                                class="input" />
                        </el-form-item>
                        <el-form-item prop="password" style="margin-top: 20px;">
                            <el-input v-model="loginForm.password" type="password" autocomplete="off" show-password
                                placeholder="输入密码" class="input" />
                        </el-form-item>
                        
                        <el-form-item>
                            <el-button type="primary" @click="submitForm(loginForm)" class="submit-button">
                                登录
                            </el-button>
                        </el-form-item>
                    </el-form>

                    <!-- <div style="display: flex; justify-content: space-between;">
                        <el-link href="/register" type="primary">没有账户，前去注册</el-link>
                        <el-link href="/find_password" type="primary">忘记密码</el-link>
                    </div> -->
                
                </el-main>
                <el-footer class="footer gray-footer">
                    登录代表着您是大佬，拥有更多的权限
                </el-footer>
            </el-container>
        </div>
    </div>
</template>

<style scoped>

.login-bg-center {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f6fa;
}

.login-container {
    width: 350px;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 20px;
    box-shadow: 0 6px 15px 0px rgb(209, 209, 209);
    background: #fff;
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
    color: #8e8a8a;
    margin-top: 10px;
}

.gray-footer {
    background: #f0f0f0;
    width: 100%;
    min-height: 50px;
    box-sizing: border-box;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
</style>
