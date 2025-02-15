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
        
        
};

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
//   ElMessage.success('Upload success!')
  
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png' && rawFile.type !== 'image/jpg') {
    ElMessage.error('Avatar picture must be in JPEG,PNG,JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  ElMessage.success('Avatar vaild!')
  return true
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
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
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
