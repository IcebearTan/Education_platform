<template>
  <div class="cover-manage-container">
    <div class="cover-title">封面图片编辑</div>
    <div class="cover-list-outer">
      <div class="cover-list">
        <div
          v-for="(cover, index) in sortedCovers"
          :key="cover.cover_id"
          class="cover-item"
          @mouseenter="hoverIndex = index"
          @mouseleave="hoverIndex = -1"
        >
          <span class="cover-number">{{ cover.cover_id }}</span>
          <img
            :src="cover.base64"
            alt="封面图片"
            class="cover-img"
            @dblclick="showPreview(cover.base64)"
          />
          <div class="cover-actions" :class="{ show: hoverIndex === index }">
            <el-upload
              class="action-upload"
              :show-file-list="false"
              :http-request="(options) => customUploadRequest(options, cover.cover_id)"
              :before-upload="beforeCoverUpload"
            >
              <button class="action-btn" type="button">前插图片</button>
            </el-upload>
            <button class="action-btn delete" @click="deleteCover(cover.cover_id)">删除</button>
          </div>
        </div>
        <!-- 添加图片上传 -->
        <div class="cover-item add-cover" @click="triggerAddUpload">
          <span class="cover-number">{{ maxCoverId + 1 }}</span>
          <el-upload
            ref="addUploadRef"
            class="add-upload"
            :show-file-list="false"
            :http-request="(options) => customUploadRequest(options, maxCoverId + 1)"
            :before-upload="beforeCoverUpload"
          >
            <div class="add-icon">+</div>
          </el-upload>
        </div>
      </div>
    </div>
    <!-- 图片放大预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      width="auto"
      class="preview-dialog"
      :show-close="true"
      center
      :close-on-click-modal="true"
      :modal-append-to-body="true"
      :destroy-on-close="true"
    >
      <img :src="previewImg" class="preview-img" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { ElMessage } from 'element-plus'

const covers = ref([])
const hoverIndex = ref(-1)
const addUploadRef = ref(null)
const maxCoverId = ref(0)

// 放大预览相关
const previewVisible = ref(false)
const previewImg = ref('')

function showPreview(img) {
  previewImg.value = img
  previewVisible.value = true
}

onMounted(() => {
  getCovers();
})

async function getCovers() {
  try {
    const response = await api.get(`/homeCover/list`);
    if (response.data && Array.isArray(response.data.covers)) {
      covers.value = response.data.covers.map(item => ({
        base64: 'data:image/png;base64,' + item.cover,
        cover_id: item.id
      }))
    }
    maxCoverId.value = Math.max(...covers.value.map(c => c.cover_id));
  } catch (error) {
    console.error('获取封面失败:', error)
  }
}

const sortedCovers = computed(() =>
  covers.value.slice().sort((a, b) => a.cover_id - b.cover_id)
)

function beforeCoverUpload(rawFile) {
  if (
    rawFile.type !== 'image/jpeg' &&
    rawFile.type !== 'image/png' &&
    rawFile.type !== 'image/jpg'
  ) {
    ElMessage.error('图片必须是JPEG,PNG,JPG格式中的一种!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 4) {
    ElMessage.error('图片大小不能超过4MB!')
    return false
  }
  return true
}

async function customUploadRequest(options, insertIndex) {
  const { file, onSuccess, onError } = options
  const formData = new FormData()
  formData.append('HomeCover', file)
  let res = null;
  try {
    res = await api.post(`/homeCover/update?Cover_Id=${insertIndex}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  } catch (err) {
    ElMessage.error('图片上传失败!')
    onError && onError(err)
  }
  if(res){
    onSuccess(res);
    ElMessage.success('图片上传成功!');
    getCovers();
  }
}

async function deleteCover(index) {
  let res = null;
  try {
    res = await api.post(`/homeCover/delete?Cover_Id=${index}`);
  } catch (err) {
    ElMessage.error('图片删除失败!')
  }
  if(res){
    ElMessage.success('图片删除成功!');
    getCovers();
  }
}

function triggerAddUpload(e) {
  if (e.target.closest('.el-upload')) return;
  addUploadRef.value && addUploadRef.value.$el.querySelector('input[type=file]').click();
}
</script>

<style scoped>
.cover-manage-container {
  width: 85vw;
  min-height: 400px;
  height: 96vh;
  padding: 0;
  border: 2px solid #222;
  border-radius: 24px;
  background: #f8fafc;
  box-sizing: border-box;
  box-shadow: 0 4px 32px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}

.cover-title {
  font-size: 26px;
  font-weight: 700;
  color: #222;
  letter-spacing: 2px;
  margin-top: 24px;
  margin-left: 48px;
  margin-bottom: 12px;
  text-align: left;
  width: auto;
  padding-left: 18px;
  border-left: 5px solid #1976d2;
  background: linear-gradient(90deg, #e3f0ff 0%, #fff 100%);
  border-radius: 8px 0 0 8px;
  box-shadow: 0 2px 8px rgba(25,118,210,0.04);
}

.cover-list-outer {
  width: calc(85vw - 80px);
  max-width: none;
  margin: 0 0 0 32px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(25,118,210,0.06);
  padding: 32px 32px 32px 32px;
  box-sizing: border-box;
  min-height: 400px;
  max-height: calc(100vh - 120px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cover-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 40px 40px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 12px;
  scrollbar-width: thin;
  scrollbar-color: #1976d2 #e3f0ff;
  background: transparent;
}
.cover-list::-webkit-scrollbar {
  width: 10px;
  background: #e3f0ff;
  border-radius: 8px;
}
.cover-list::-webkit-scrollbar-thumb {
  background: #1976d2;
  border-radius: 8px;
  min-height: 40px;
}

.cover-item {
  position: relative;
  width: 220px;
  height: 300px;
  border: 2px solid #b3c6e0;
  border-radius: 16px;
  background: #fafdff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: box-shadow 0.2s, border-color 0.2s;
  flex: 0 0 auto;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
  box-shadow: 0 2px 8px rgba(25,118,210,0.04);
}
.cover-item:hover {
  box-shadow: 0 8px 32px rgba(25,118,210,0.10);
  border-color: #1976d2;
  background: #f0f7ff;
}

.cover-number {
  position: absolute;
  top: 8px;
  left: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #1976d2;
  background: rgba(255,255,255,0.85);
  border-radius: 6px;
  padding: 2px 8px;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(25,118,210,0.04);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border: none;
  background: #fff;
  display: block;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 8px rgba(25,118,210,0.06);
}
.cover-img:active {
  transform: scale(0.98);
}

.cover-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 3;
}
.cover-actions.show {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  background: #fff;
  border: 1px solid #1976d2;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 14px;
  color: #1976d2;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(25,118,210,0.04);
}
.action-btn:hover {
  background: #e3f0ff;
  color: #0d47a1;
  border-color: #0d47a1;
}
.action-btn.delete {
  border-color: #e57373;
  color: #e57373;
}
.action-btn.delete:hover {
  background: #ffeaea;
  color: #d32f2f;
  border-color: #d32f2f;
}

.add-cover {
  cursor: pointer;
  border: 2px dashed #1976d2;
  background: #f5faff;
  justify-content: center;
  align-items: center;
  flex: 0 0 auto;
  width: 220px;
  height: 300px;
  display: flex;
  position: relative;
  transition: background 0.2s, border-color 0.2s;
}
.add-cover:hover {
  background: #e3f0ff;
  border-color: #0d47a1;
}

.add-icon {
  font-size: 60px;
  color: #1976d2;
  font-weight: bold;
  user-select: none;
  transition: color 0.2s;
}
.add-cover:hover .add-icon {
  color: #0d47a1;
}

.action-upload,
.add-upload {
  display: inline-block;
}

/* 放大预览弹窗样式美化，去除图片左右白边 */
:deep(.preview-dialog) .el-dialog__header {
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  /* 不要 display: none; */
}
:deep(.preview-dialog) .el-dialog__title {
  display: none;
}
:deep(.preview-dialog) .el-dialog__body {
  padding: 0;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  min-height: 0;
}
:deep(.preview-dialog) .el-dialog {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
  box-sizing: border-box;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 !important; /* 新增，去除内边距 */
  min-width: 0 !important; /* 新增 */
  min-height: 0 !important; /* 新增 */
}
:deep(.preview-dialog) {
  --el-overlay-background-color: rgba(30, 34, 44, 0.85);
}
.preview-img {
  max-width: 96vw;
  max-height: 92vh;
  display: block;
  border-radius: 18px;
  box-shadow: 0 8px 48px rgba(25,118,210,0.22);
  /* background: #fff; */
  margin: 0;
  border: none;
}
:deep(.preview-dialog) .el-dialog__close {
  color: #fff !important;
  font-size: 28px !important;
  top: 12px !important;
  right: 18px !important;
  z-index: 100;
  background: rgba(30,34,44,0.6);
  border-radius: 50%;
  transition: background 0.2s;
}
:deep(.preview-dialog) .el-dialog__close:hover {
  background: #1976d2;
  color: #fff !important;
}
</style>