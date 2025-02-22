<template>
  <el-upload
    class="avatar-uploader"
    :http-request="customUploadRequest"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
    :before-upload="beforeAvatarUpload"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
  </el-upload>
</template>

<script lang="ts" setup>
import api from '../api'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useStore } from 'vuex'

import type { UploadProps } from 'element-plus'

const imageUrl = ref('')

const uploadAvatar = async (formData: FormData, onSuccess?: (res: any) => void, onError?: (err: any) => void,) => {
    api.post('/user/user_avatars/upgrade', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .catch(error => {
        onError(error);
    })
    .then((res) => {
        console.log(res);
        onSuccess(res);
    });
}

const customUploadRequest = (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('avatar', file);  // 将文件添加到 FormData
    
     
    // 使用封装的 API 方法上传文件
    uploadAvatar(formData, onSuccess, onError)
        
        
}

const store = useStore()
const fetchAvatar = async () =>{
    await api({
        url: "/user/user_avatars",
        method: "get",
    }).then((res) => {
        store.commit('setAvatar', res.data.User_Avatar)
    })
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
  ElMessage.success('头像上传成功!')
  fetchAvatar()
  setTimeout(() => {
    window.location.reload()
  }, 1000)
  
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png' && rawFile.type !== 'image/jpg') {
    ElMessage.error('头像必须是JPEG,PNG,JPG格式中的一种!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过2MB!')
    return false
  }
//   ElMessage.success('Avatar vaild!')
  return true
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}
</style>
