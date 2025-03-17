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
            }).then((res) => {
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




            // alert('登录成功');
        }
    }
};
</script>

<template>
    <div>
        <el-container>
            <el-header>
                <h1>登录</h1>
            </el-header>
            <el-main>
                <el-form ref="loginForm" style="max-width: 600px" :model="loginForm" status-icon :rules="rules"
                    label-width="auto" class="demo-ruleForm">

                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="loginForm.email" type="email" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="loginForm.password" type="password" autocomplete="off" show-password />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm(loginForm)">
                            登录
                        </el-button>
                    </el-form-item>
                </el-form>

                <!-- <el-link href="/register" type="primary">没有账户，前去注册</el-link> -->
            </el-main>
        </el-container>
    </div>
</template>

<style scoped></style>
