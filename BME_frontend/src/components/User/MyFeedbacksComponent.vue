<template>
  <div class="my-feedbacks">
    <div class="header">
      <h2>我的反馈记录</h2>
      <p class="subtitle">查看您提交的所有反馈记录</p>
    </div>

    <el-table 
      :data="feedbackList" 
      v-loading="loading" 
      style="width: 100%; max-width: 860px;"
      stripe
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      :cell-style="{ 'vertical-align': 'top', 'padding': '12px 8px' }"
      :default-sort="{ prop: 'created_at', order: 'descending' }"
    >
      <el-table-column label="标题" width="120">
        <template #default="scope">
          <div class="cell-content title-cell">{{ scope.row.title }}</div>
        </template>
      </el-table-column>
      
      <el-table-column label="问题描述" width="295">
        <template #default="scope">
          <div class="cell-content content-cell">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      
      <el-table-column label="图片" width="70" align="center">
        <template #default="scope">
          <div v-if="scope.row.has_image && scope.row.images && scope.row.images.length > 0" class="image-preview">
            <el-image
              :src="scope.row.images[0]"
              style="width: 40px; height: 40px; border-radius: 4px"
              fit="cover"
              :preview-src-list="scope.row.images"
              :preview-teleported="true"
            />
            <span v-if="scope.row.images.length > 1" class="image-count">
              +{{ scope.row.images.length - 1 }}
            </span>
          </div>
          <span v-else style="color: #c0c4cc; font-size: 12px;">无</span>
        </template>
      </el-table-column>
      
      <el-table-column label="时间" width="140">
        <template #default="scope">
          <div class="cell-content time-cell">{{ scope.row.created_at }}</div>
        </template>
      </el-table-column>
      
      <el-table-column label="状态" width="80" align="center">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === '已处理' ? 'success' : 'warning'"
            effect="plain"
            size="small"
            style="font-size: 12px;"
          >
            {{ scope.row.status || '待处理' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="110" align="center">
        <template #default="scope">
          <div class="action-buttons">
            <el-button 
              type="primary" 
              link 
              size="small"
              @click="viewDetail(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              type="danger" 
              link
              style="margin-left: 0;"
              size="small"
              @click="confirmDelete(scope.row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty 
      v-if="!loading && feedbackList.length === 0" 
      description="暂无反馈记录"
      :image-size="120"
    >
      <el-button type="primary" @click="$router.push('/')">
        去首页提交反馈
      </el-button>
    </el-empty>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="反馈详情"
      width="600px"
      :lock-scroll="false"
    >
      <div v-if="currentFeedback" class="feedback-detail">
        <div class="detail-item">
          <label>标题：</label>
          <span>{{ currentFeedback.title }}</span>
        </div>
        <div class="detail-item">
          <label>问题描述：</label>
          <p class="content">{{ currentFeedback.content }}</p>
        </div>
        <div class="detail-item" v-if="currentFeedback.has_image && currentFeedback.images && currentFeedback.images.length">
          <label>相关图片：</label>
          <div class="images-grid">
            <el-image
              v-for="(img, index) in currentFeedback.images"
              :key="index"
              :src="img"
              style="width: 80px; height: 80px; margin: 5px; border-radius: 6px"
              fit="cover"
              :preview-src-list="currentFeedback.images"
              :initial-index="index"
              :preview-teleported="true"
            />
          </div>
        </div>
        <div class="detail-item">
          <label>提交时间：</label>
          <span>{{ currentFeedback.created_at }}</span>
        </div>
        <div class="detail-item">
          <label>处理状态：</label>
          <el-tag 
            :type="currentFeedback.status === '已处理' ? 'success' : 'warning'"
            effect="plain"
          >
            {{ currentFeedback.status || '待处理' }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import api from '../../api'

const feedbackList = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const currentFeedback = ref(null)

// 获取反馈记录列表
const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const response = await api({
      url: '/information/error/query',
      method: 'get'
    })
    
    if (response.data.code === 200) {
      // 处理返回的数据格式
      feedbackList.value = (response.data.data || []).map(item => {
        let images = []
        // 如果有图片且image字段不为空
        if (item.has_image && item.image) {
          // 处理base64图片数据
          const imageData = item.image.startsWith('data:image/') 
            ? item.image 
            : `data:image/png;base64,${item.image}`
          images = [imageData]
        }
        
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          images,
          created_at: formatDate(item.create_time),
          has_image: item.has_image,
          status: '待处理' // 默认状态，如果后端有status字段可以使用 item.status
        }
      })
    } else {
      ElMessage.error(response.data.message || '获取反馈记录失败')
    }
  } catch (error) {
    console.error('获取反馈记录失败:', error)
    ElMessage.error('网络错误，无法获取反馈记录')
  } finally {
    loading.value = false
  }
}

// 查看详情
const viewDetail = (feedback) => {
  currentFeedback.value = feedback
  detailVisible.value = true
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 删除反馈
const confirmDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除标题为“${row.title}”的反馈吗？`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    deleteFeedback(row.id)
  }).catch(() => {})
}

const deleteFeedback = async (id) => {
  try {
    const response = await api({
      url: '/information/error/delete',
      method: 'post',
      data: { id }
    })
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      fetchFeedbacks()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，删除失败')
  }
}

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style scoped>
.my-feedbacks {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  min-height: 600px;
  max-width: 900px;
  margin: 0 auto;
}

.cell-content {
  line-height: 1.4;
  font-size: 13px;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

.title-cell {
  font-weight: 500;
  color: #303133;
  max-width: 110px;
}

.content-cell {
  color: #606266;
  max-width: 290px;
  max-height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.time-cell {
  font-size: 12px;
  color: #909399;
  max-width: 100px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.header {
  margin-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 16px;
}

.header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-count {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 2px;
}

.feedback-detail {
  padding: 16px 0;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.detail-item label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-item .content {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .my-feedbacks {
    padding: 16px;
  }
  
  .header h2 {
    font-size: 20px;
  }
}
</style>
