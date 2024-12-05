<script>
import api from '../api';
import md5 from 'js-md5'

export default {

    data() {
        return {
            registerForm: {
                username: "",
                password: "",
                confirmPassword: "",
                email: "",
                code: ""
            },

            // 验证码倒数模块
            getCode: '获取验证码',
            isGeting: false,
            count: 60,
            disable: false,


            rules: {
                username: [
                    { required: true, message: "请输入用户名", trigger: "blur" },
                    { min: 3, max: 15, message: "用户名长度需要在3-15个字符之间", trigger: "blur" },
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
                            } else if (value !== this.registerForm.password) {
                                callback(new Error('两次输入密码不一致!'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'blur'
                    }
                ],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] },
                ],
                code: [
                    { required: true, message: "请输入验证码", trigger: "submit" }
                ]
            }
        }
    },

    methods: {
        validateForm() {
            if (!this.registerForm.username) {
                alert('请填写用户名');
                return false;
            }

            if (!this.registerForm.password) {
                alert('请填写密码');
                return false;
            }

            if (!this.registerForm.confirmPassword) {
                alert('请再次输入密码');
                return false;
            }

            if (!this.registerForm.email) {
                alert('请填写邮箱');
                return false;
            }

            return true;
        },

        async submitEmail() {
            if (!this.validateForm()) {
                return;
            }

            // 向后端请求验证码发送
            api({
                url: "/auth/captcha/email",
                method: "post",
                data: {
                    User_Email: this.registerForm.email,
                },
            }).then((res) => {
                if (res.data.code == 200) {
                    console.log(res.data.token, 'token')
                    // 将数据存入浏览器
                    localStorage.setItem("token", res.data.token)
                }
            })

            // 按钮倒数
            var countDown = setInterval(() => {
                if (this.count < 1) {
                    this.isGeting = false
                    this.disable = false
                    this.getCode = '获取验证码'
                    this.count = 61
                    clearInterval(countDown)
                } else {
                    this.isGeting = true
                    this.disable = true
                    this.getCode = this.count-- + 's后重发'
                }
            }, 1000)


            this.$message({
                message: '验证码已发送到您的邮箱，请查收',
                type: 'success'
            });
        },

        async submitForm() {

            if (!this.validateForm()) {
                return;
            }

            const User_Password = md5(this.registerForm.password)

            // 向后端发送注册信息，暂时打印至控制台
            api({
                url: "/auth/register",
                method: "post",
                data: {
                    User_Name: this.registerForm.username,
                    User_Password: User_Password,
                    User_Email: this.registerForm.email,
                    User_Captcha: this.registerForm.code,
                },
            }).then((res) => {
                if (res.data.code == 200) {
                    console.log(res.data.token, 'token')
                    // 将数据存入浏览器
                    localStorage.setItem("token", res.data.token)

                    this.$router.push('/login')
                    
                    this.$message({
                        message: '注册成功',
                        type: 'success'
                    });
                }
                else {
                    this.$message({
                        message: res.data.message,
                        type: 'error'
                    })
                }
            })

            

            


        }
    }
};
</script>

<template>
    <div>
        <el-container>
            <el-header>
                <h1>注册账号</h1>
            </el-header>
            <el-main>
                <el-form ref="registerForm" style="max-width: 600px" :model="registerForm" status-icon :rules="rules"
                    label-width="auto" class="demo-ruleForm">
                    <el-form-item label="账号" prop="username">
                        <el-input v-model="registerForm.username" type="text" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="registerForm.password" type="password" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                        <el-input v-model="registerForm.confirmPassword" type="password" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="registerForm.email" type="email" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="验证码" prop="code">
                        <div style="display: flex;">
                            <el-input v-model="registerForm.code" type="text" autocomplete="off" />
                            <!-- <el-button type="primary" @click="submitEmail(registerForm.email)">
                                获取邮箱验证码
                            </el-button> -->
                            <el-button type="primary" :disabled="disable" :class="{ codeGeting: isGeting }"
                                @click="submitEmail" style="margin-left: 10px;">{{ getCode }}</el-button>
                        </div>

                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm(registerForm)">
                            注册
                        </el-button>
                    </el-form-item>
                </el-form>

                <el-link href="/login" type="primary">已有账户，前去登录</el-link>
            </el-main>
        </el-container>
    </div>
</template>

<style scoped></style>
