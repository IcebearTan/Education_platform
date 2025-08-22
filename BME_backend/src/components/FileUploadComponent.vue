<template>
  <div class="file-upload-component">
    <!-- 文件选择区域 -->
    <div 
      class="upload-area" 
      :class="{ 'drag-over': isDragOver }"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".html,.htm,.md,.markdown"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <div class="upload-button-area">
        <el-button type="primary" @click="triggerFileSelect">
          <el-icon><Upload /></el-icon>
          选择文件
        </el-button>
        <div class="upload-tip">
          支持上传 .html, .htm, .md, .markdown 格式的文件
        </div>
      </div>
      
      <div class="drag-tip">
        或将文件拖拽到此处
      </div>
    </div>
    
    <!-- 文件信息展示 -->
    <div v-if="selectedFile" class="file-info">
      <el-card class="file-card">
        <div class="file-details">
          <div class="file-name">
            <el-icon><Document /></el-icon>
            <span>{{ selectedFile.name }}</span>
          </div>
          <div class="file-size">
            大小: {{ formatFileSize(selectedFile.size) }}
          </div>
          <div class="file-type">
            类型: {{ getFileType(selectedFile.name) }}
          </div>
        </div>
        <div class="file-actions">
          <el-button 
            type="success" 
            @click="parseAndImport"
            :loading="isParsingLoading"
          >
            <el-icon><Check /></el-icon>
            解析并导入
          </el-button>
          <el-button @click="clearFile">
            <el-icon><Close /></el-icon>
            清除
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 解析预览 -->
    <div v-if="parsePreview" class="parse-preview">
      <el-card>
        <template #header>
          <div class="preview-header">
            <span>文件内容预览</span>
            <el-button 
              type="primary" 
              size="small"
              @click="confirmImport"
            >
              <el-icon><Check /></el-icon>
              确认导入
            </el-button>
          </div>
        </template>
        <div class="preview-content">
          <div class="preview-meta" v-if="extractedMeta.title || extractedMeta.description">
            <div v-if="extractedMeta.title" class="meta-item">
              <strong>标题:</strong> {{ extractedMeta.title }}
            </div>
            <div v-if="extractedMeta.description" class="meta-item">
              <strong>描述:</strong> {{ extractedMeta.description }}
            </div>
          </div>
          <div class="preview-body" v-html="parsePreview"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Document, Check, Close } from '@element-plus/icons-vue'
import { marked } from 'marked'
import TurndownService from 'turndown'

export default {
  name: 'FileUploadComponent',
  components: {
    Upload,
    Document,
    Check,
    Close
  },
  emits: ['file-imported'],
  setup(props, { emit }) {
    const fileInputRef = ref()
    const selectedFile = ref(null)
    const parsePreview = ref('')
    const extractedContent = ref('')
    const extractedMeta = ref({})
    const isParsingLoading = ref(false)
    const isDragOver = ref(false)
    const dragCounter = ref(0)
    
    // 触发文件选择
    const triggerFileSelect = () => {
      fileInputRef.value?.click()
    }
    
    // 验证文件
    const validateFile = (file) => {
      console.log('验证文件:', file)
      
      const validTypes = ['.html', '.htm', '.md', '.markdown']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      
      if (!validTypes.includes(fileExtension)) {
        ElMessage.error('请选择 HTML 或 Markdown 格式的文件！')
        return false
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        ElMessage.error('文件大小不能超过 10MB！')
        return false
      }
      
      return true
    }
    
    // 设置选中的文件
    const setSelectedFile = (file) => {
      selectedFile.value = file
      console.log('文件已设置:', selectedFile.value)
      ElMessage.success(`文件 "${file.name}" 已选择，请点击"解析并导入"按钮`)
    }
    
    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
    
    // 拖拽相关处理
    const handleDragOver = (event) => {
      event.preventDefault()
      event.stopPropagation()
      isDragOver.value = true
    }
    
    const handleDragEnter = (event) => {
      event.preventDefault()
      event.stopPropagation()
      dragCounter.value++
      isDragOver.value = true
      console.log('拖拽进入，计数器:', dragCounter.value)
    }
    
    const handleDragLeave = (event) => {
      event.preventDefault()
      event.stopPropagation()
      dragCounter.value--
      console.log('拖拽离开，计数器:', dragCounter.value)
      if (dragCounter.value === 0) {
        isDragOver.value = false
        console.log('拖拽状态重置')
      }
    }
    
    const handleDrop = (event) => {
      event.preventDefault()
      event.stopPropagation()
      dragCounter.value = 0
      isDragOver.value = false
      
      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        console.log('拖拽文件:', file)
        if (validateFile(file)) {
          setSelectedFile(file)
        }
      }
    }
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    // 获取文件类型
    const getFileType = (fileName) => {
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      switch (extension) {
        case '.html':
        case '.htm':
          return 'HTML文档'
        case '.md':
        case '.markdown':
          return 'Markdown文档'
        default:
          return '未知格式'
      }
    }
    
    // 解析HTML文件
    const parseHtmlFile = (htmlContent) => {
      // 创建临时DOM元素来解析HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      // 提取元信息
      const title = doc.querySelector('title')?.textContent || 
                   doc.querySelector('h1')?.textContent || ''
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
                         doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || ''
      
      // 提取body内容，排除script和style标签
      const body = doc.body
      if (body) {
        // 移除script和style标签
        body.querySelectorAll('script, style').forEach(el => el.remove())
        
        // 使用TurndownService将HTML转换为Markdown，然后再转换回HTML以确保格式统一
        const turndownService = new TurndownService({
          headingStyle: 'atx',
          bulletListMarker: '-',
          codeBlockStyle: 'fenced'
        })
        
        const markdown = turndownService.turndown(body.innerHTML)
        const htmlContent = marked.parse(markdown)
        
        return {
          title,
          description,
          content: htmlContent,
          markdown
        }
      }
      
      return {
        title,
        description,
        content: htmlContent,
        markdown: htmlContent
      }
    }
    
    // 解析Markdown文件
    const parseMarkdownFile = (markdownContent) => {
      // 配置marked选项
      marked.setOptions({
        breaks: true,
        gfm: true
      })
      
      // 提取front matter（如果存在）
      let title = ''
      let description = ''
      let content = markdownContent
      
      // 检查是否有YAML front matter
      const frontMatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
      if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1]
        content = frontMatterMatch[2]
        
        // 简单解析YAML（仅支持title和description）
        const titleMatch = frontMatter.match(/title:\s*['"]?([^'"\n]+)['"]?/)
        const descMatch = frontMatter.match(/description:\s*['"]?([^'"\n]+)['"]?/)
        
        if (titleMatch) title = titleMatch[1].trim()
        if (descMatch) description = descMatch[1].trim()
      }
      
      // 如果没有从front matter中提取到标题，尝试从第一个标题中提取
      if (!title) {
        const firstHeading = content.match(/^#+\s+(.+)$/m)
        if (firstHeading) {
          title = firstHeading[1].trim()
        }
      }
      
      // 将Markdown转换为HTML
      const htmlContent = marked.parse(content)
      
      return {
        title,
        description,
        content: htmlContent,
        markdown: content
      }
    }
    
    // 解析并导入文件
    const parseAndImport = async () => {
      if (!selectedFile.value) {
        ElMessage.error('请先选择文件！')
        return
      }
      
      isParsingLoading.value = true
      
      try {
        const fileContent = await readFileContent(selectedFile.value)
        const fileExtension = selectedFile.value.name.toLowerCase().substring(selectedFile.value.name.lastIndexOf('.'))
        
        let result
        if (['.html', '.htm'].includes(fileExtension)) {
          result = parseHtmlFile(fileContent)
        } else if (['.md', '.markdown'].includes(fileExtension)) {
          result = parseMarkdownFile(fileContent)
        }
        
        extractedMeta.value = {
          title: result.title,
          description: result.description
        }
        extractedContent.value = result.content
        parsePreview.value = result.content
        
        ElMessage.success('文件解析成功！请查看预览内容')
      } catch (error) {
        console.error('文件解析失败:', error)
        ElMessage.error('文件解析失败，请检查文件格式是否正确')
      } finally {
        isParsingLoading.value = false
      }
    }
    
    // 读取文件内容
    const readFileContent = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsText(file, 'UTF-8')
      })
    }
    
    // 确认导入
    const confirmImport = () => {
      emit('file-imported', {
        title: extractedMeta.value.title,
        description: extractedMeta.value.description,
        content: extractedContent.value
      })
      
      // 清理状态
      clearFile()
      ElMessage.success('内容已导入到编辑器！')
    }
    
    // 清除文件
    const clearFile = () => {
      selectedFile.value = null
      parsePreview.value = ''
      extractedContent.value = ''
      extractedMeta.value = {}
      // 清空 input 的值
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }
    
    return {
      fileInputRef,
      selectedFile,
      parsePreview,
      extractedMeta,
      isParsingLoading,
      isDragOver,
      triggerFileSelect,
      handleFileSelect,
      handleDragEnter,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      formatFileSize,
      getFileType,
      parseAndImport,
      confirmImport,
      clearFile
    }
  }
}
</script>

<style scoped>
.file-upload-component {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-area.drag-over {
  border-color: #409eff;
  background: #e6f7ff;
  transform: scale(1.02);
}

.upload-button-area {
  margin-bottom: 12px;
}

.upload-tip {
  color: #606266;
  font-size: 12px;
  margin-top: 8px;
}

.drag-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
  font-style: italic;
}

.file-info {
  margin-top: 16px;
}

.file-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.file-card :deep(.el-card__body) {
  padding: 16px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.file-size,
.file-type {
  font-size: 14px;
  color: #606266;
}

.file-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.parse-preview {
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-content {
  max-height: 400px;
  overflow-y: auto;
}

.preview-meta {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border-left: 4px solid #409eff;
}

.meta-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.preview-body {
  line-height: 1.6;
  color: #2c3e50;
}

.preview-body :deep(h1),
.preview-body :deep(h2),
.preview-body :deep(h3),
.preview-body :deep(h4),
.preview-body :deep(h5),
.preview-body :deep(h6) {
  color: #2c3e50;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.preview-body :deep(h1) { font-size: 24px; }
.preview-body :deep(h2) { font-size: 20px; }
.preview-body :deep(h3) { font-size: 18px; }

.preview-body :deep(p) {
  margin: 12px 0;
}

.preview-body :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 20px;
  background: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 4px;
}

.preview-body :deep(code) {
  background: #f1f2f3;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, 'Roboto Mono', monospace;
}

.preview-body :deep(pre) {
  background: #2d3748;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.preview-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.preview-body :deep(table th),
.preview-body :deep(table td) {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.preview-body :deep(table th) {
  background: #f5f5f5;
  font-weight: 600;
}

.preview-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 12px 0;
}

.preview-body :deep(ul),
.preview-body :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.preview-body :deep(li) {
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-actions {
    flex-direction: column;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .preview-content {
    max-height: 300px;
  }
}
</style>
