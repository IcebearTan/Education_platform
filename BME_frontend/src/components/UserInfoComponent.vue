<!-- 使用vue3语法 -->
<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex';

import AvatarUploadComponent from './AvatarUploadComponent.vue';

const splitStringBySpace = (str) => {
  return str.split(' ');  // 使用空格作为分隔符来分割字符串
};

const joinArrayWithSpace = (arr) => {
  return arr.join(' ');  // 使用空格连接数组元素
};

onMounted(() => {
  setTimeout(() => {
    console.log(props.User_Info.User_Sex)
    form.username = props.User_Info.User_Name
    form.gender = props.User_Info.User_Sex
    form.institution = props.User_Info.Institute
    form.major = props.User_Info.Major
    form.introduction = props.User_Info.Introduction
    form.GithubId = props.User_Info.Github_Id
    form.tags = splitStringBySpace(props.User_Info.Skill_Tags)
  }, 200)

})

const props = defineProps({
  User_Info: {
    type: Object,
    required: true,
  }
})

const form = reactive({
  username: '',
  gender: '',
  institution: '',
  major: '',
  introduction: '',
  GithubId: '',
  tags: [],
})

const rules = {
  username: [
    { message: '请输入昵称', trigger: 'blur' },
    { min: 4, max: 15, message: '昵称长度需要在4-15个字符之间', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
          if ('\u4000' <= value && value <= '\u9fa5') {
              callback(new Error('用户名不能包含中文'));
          } else {
              callback();
          }
      },
      trigger: 'blur'
    },
  ]
}

const tagsCount = computed(() => {
  if (form.tags) {
    return form.tags.length
  }else {
    return 0
  }
})

const loading = ref(false)
nextTick(() => {
    loading.value = true
    setTimeout(() => {
        loading.value = false
    }, 500)
})

const onSubmit = () => {
  console.log(form)
  api({
    url: '/user/user/edit',
    method: 'post',
    data: {
      Github_Id: form.GithubId,
      Institute: form.institution,
      Introduction: form.introduction,
      Major: form.major,
      Sex: form.gender,
      Skill_Tags: joinArrayWithSpace(form.tags),
      User_Name: form.username
    }
  }).then(res => {
    console.log(res)
    if (res.data.code === 200) {
      ElMessage({ type: 'success', message: '用户信息修改成功！正在审核！' })
      // window.location.reload()
    } else {
      ElMessage({ type: 'error', message: '用户信息修改失败！' })
    }
  }).catch(err => {
    console.log(err)
    ElMessage({ type: 'error', message: '未知的错误！' })
  })
}
</script>

<template>
  <div class="userInfoContainer"
        v-loading="loading" 
        element-loading-background="rgba(255, 255, 255, 1)" 
        :delay="0" 
        element-loading-text="loading...">
    <div class="UserInfoCard">
      <div class="avatarContainer">
        <AvatarUploadComponent />
        <div style="width: 100%; text-align: center; margin-top: 10px; color: #999;">上传头像</div>
      </div>
      <div class="infoContainer">
        <el-form :model="form" label-width="auto" style="width: 90%;" label-position="top" size="large" :rules="rules">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="昵称" prop="username">
                <el-input v-model="form.username" placeholder="输入你的昵称" clearable/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别">
                <el-select v-model="form.gender" placeholder="选择你的性别">
                  <el-option label="男性" value="男性" />
                  <el-option label="女性" value="女性" />
                  <el-option label="武装直升机" value="武装直升机" />
                  <el-option label="沃尔玛购物袋" value="沃尔玛购物袋" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学院">
                <el-input v-model="form.institution" placeholder="学院名称" clearable/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="专业">
                <el-input v-model="form.major" placeholder="所在专业" clearable/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="个人简介">
            <el-input v-model="form.introduction" 
            type="textarea" 
            :autosize="{ minRows: 4, maxRows: 5 }" 
            placeholder="简单介绍一下自己吧~" 
            maxlength="100" 
            show-word-limit 
            clearable
            />
          </el-form-item>
          <el-form-item label="GithubID">
            <el-input v-model="form.GithubId" placeholder="你的Github用户名" clearable/>
          </el-form-item>
          <el-form-item label="技能标签">
            <el-input-tag v-model="form.tags" placeholder="你所拥有的技能" trigger="Enter" clearable :max="10" show-word-limit>
              <template #suffix>
                {{ tagsCount }} / 10
              </template>
            </el-input-tag>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="onSubmit" style="margin: auto;">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.userInfoContainer{
  width: 100%;

  margin-top: 10px;
  margin-left: 20px;
}
.UserInfoCard{
  /* width: 100%; */
  min-height: 250px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgb(232, 230, 230);

  margin-right: 10px;
}
.avatarContainer{
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  padding-top: 20px;
  padding-bottom: 20px;

  flex-wrap: wrap;
}
.infoContainer{
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
