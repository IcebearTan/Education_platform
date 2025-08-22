<script>
import { ref, reactive, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Grid, Document, View, Hide, FullScreen, Upload, CircleCloseFilled } from '@element-plus/icons-vue';
import api from '../api';
import { useRouter } from 'vue-router';
import FileUploadComponent from './FileUploadComponent.vue';

import Editor from '@tinymce/tinymce-vue';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/icons/default/icons';
import 'tinymce/plugins/image';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/contextmenu';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/code';
import 'tinymce/plugins/link';
import 'tinymce/plugins/paste';



export default {
    name: 'EditorCreateComponent',
    components: {
        Editor,
        FileUploadComponent,
        Grid,
        Document,
        View,
        Hide,
        FullScreen,
        Upload,
        CircleCloseFilled,
    },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        plugins: {
            type: [String, Array],
            default: 'lists image table wordcount link preview hr paste',
        },
        toolbar: {
            type: [String, Array],
            default: "undo redo | formatselect fontsizeselect | hr link lineheight forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | quicklink h2 h3 blockquote table numlist bullist fullscreen",
        },
        width: {
            type: Number,
            default: 1000,
        },
        height: {
            type: Number,
            default: 800,
        },
        baseValue: {
            type: String,
            default: '',
        }
    },
    setup(props, { emit }) {
        const visible = ref(false);
        const router = useRouter()

        const content = ref(`
<h2>欢迎使用文章编辑器！</h2>
<p>您可以在这里开始创作您的精彩内容。编辑器支持多种格式和功能：</p>
<ul>
<li><strong>丰富的文本格式</strong> - 粗体、斜体、下划线等</li>
<li><strong>标题层级</strong> - 从 H1 到 H6 的多级标题</li>
<li><strong>列表功能</strong> - 有序列表和无序列表</li>
<li><strong>图片插入</strong> - 支持图片上传和粘贴</li>
<li><strong>表格编辑</strong> - 创建和编辑表格</li>
<li><strong>代码块</strong> - 支持代码高亮显示</li>
</ul>
<blockquote>
<p>💡 <strong>小提示：</strong> 使用右侧的预览功能可以实时查看文章效果，使用分屏模式获得最佳编辑体验！</p>
</blockquote>
<p>现在就开始您的创作之旅吧！</p>
        `)

        const handleClick = () => {
            console.log(content.value)
        }

        const init = reactive({
            // images_upload_url: 'http://192.168.3.47:8081/imgUpload',
            language_url: '/admin/tinymce/langs/zh_CN.js', // 中文插件
            language: 'zh_CN',

            base_url: '/admin/node_modules/tinymce/', // 根据实际路径调整
            skin_url: '/admin/tinymce/skins/ui/oxide',
            content_css: '/admin/skins/content/default/content.css',

            paste_data_images: true, // 允许粘贴图片
            paste_word_valid_elements: 'img[src|width|height|alt|title|class]', // 允许图片标签带上特定属性
            paste_postprocess: function (plugin, args) {
                const div = args.node;  // 获取到的是包裹图片的 div 元素

                if (div.tagName === 'DIV') {
                    // 查找 div 内部的 img 标签
                    const img = div.querySelector('img');
                    console.log(img)
                    if (img) {
                        // 如果图片已经加载完成，强制刷新图片
                        if (img.complete) {
                            // 强制刷新图片
                            const imgSrc = img.src;
                            img.src = ''; // 清空 src
                            img.src = imgSrc; // 重新赋值 src，强制刷新
                            resizeImage(img); // 调整图片大小
                        } else {
                            img.onload = () => {
                                resizeImage(img); // 等图片加载完成后再调整大小
                            };
                        }
                    }
                }
            },

            menubar: false,
            width: '100%',
            height: 600,
            resize: true,
            plugins: 'lists image table wordcount link preview hr paste code fullscreen autoresize',
            toolbar: "undo redo | formatselect fontsizeselect | hr link forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | h2 h3 blockquote table numlist bullist | code fullscreen | wordcount",
            branding: false,
            statusbar: true,
            elementpath: false,
            
            // 自动调整高度
            autoresize_bottom_margin: 20,
            autoresize_min_height: 400,
            autoresize_max_height: 800,

            // 优化的内容样式
            content_style: `
                body { 
                    color: #2c3e50; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
                    font-size: 16px;
                    line-height: 1.8;
                    max-width: none;
                    margin: 20px;
                    padding: 0;
                    word-wrap: break-word;
                    background: #fff;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    color: #2c3e50;
                    font-weight: 600;
                    margin: 1.5em 0 0.8em 0;
                    line-height: 1.4;
                }
                
                h1 { font-size: 2em; }
                h2 { font-size: 1.7em; }
                h3 { font-size: 1.4em; }
                
                p {
                    margin: 1em 0;
                    line-height: 1.8;
                }
                
                blockquote {
                    margin: 1.5em 0;
                    padding: 1em 1.5em;
                    border-left: 4px solid #409eff;
                    background: #f8f9fa;
                    border-radius: 4px;
                    color: #555;
                }
                
                code {
                    background: #f1f2f3;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'SF Mono', Monaco, 'Roboto Mono', monospace;
                    font-size: 0.9em;
                }
                
                pre {
                    background: #2d3748;
                    color: #e2e8f0;
                    padding: 1em;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 1.5em 0;
                }
                
                img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 1em 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5em 0;
                    border: 1px solid #e1e4e8;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                table th, table td {
                    padding: 12px 16px;
                    border: 1px solid #e1e4e8;
                    text-align: left;
                }
                
                table th {
                    background: #f6f8fa;
                    font-weight: 600;
                    color: #24292e;
                }
                
                ul, ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }
                
                li {
                    margin: 0.5em 0;
                    line-height: 1.6;
                }
                
                .mce-content-body {
                    caret-color: #409eff;
                }
                
                a {
                    color: #409eff;
                    text-decoration: none;
                }
                
                a:hover {
                    text-decoration: underline;
                }
            `,
            
            // 设置工具栏样式
            toolbar_mode: 'sliding',
            
            // 添加自定义设置
            setup: function (editor) {
                editor.on('init', function () {
                    // 编辑器初始化完成后的操作
                    console.log('编辑器初始化完成');
                });
                
                editor.on('input', function () {
                    // 内容变化时的操作，可以用来实时更新字数统计
                    const wordCount = editor.plugins.wordcount ? editor.plugins.wordcount.getCount() : 0;
                    // 这里可以更新字数显示
                });
            }
        });
        // 封装一个 resizeImage 函数，处理图片尺寸
        const resizeImage = (img) => {
            const naturalWidth = img.naturalWidth;  // 获取图像的原始宽度
            const naturalHeight = img.naturalHeight;  // 获取图像的原始高度

            // 如果图片的自然宽度大于 600px，设置宽度为600px，并根据比例调整高度
            if (naturalWidth > 600) {
                img.width = 600;
                img.height = (600 / naturalWidth) * naturalHeight;
            } else {
                img.width = naturalWidth;
                img.height = naturalHeight;
            }
        };

        const Article_Id = ref('');
        const Article_Title = ref('');
        const Article_Introduction = ref('')

        const createArticle = async () => {
            const article = {
                Article_Title: Article_Title.value,
                Article_Introduction: Article_Introduction.value,
                Html: JSON.stringify(content.value),
            };
            try {
                const response = await api.post('/article/public', article);
                console.log(response.data);
                // 处理成功响应
                ElMessage.success('创建文章成功');
                setTimeout(() => {
                    router.push('/article/manage');
                }, 1000);
            } catch (error) {
            }
        }

        const handleSubmit = () => {
            createArticle();
        }

        const isPreviewShow = ref(true);
        const isFullscreen = ref(false);
        const isSideBySide = ref(true); // 默认使用分屏模式，更好的写作体验
        const screenWidth = ref(window.innerWidth);
        
        // 计算属性：根据屏幕大小决定是否强制使用单列模式
        const effectiveLayoutMode = computed(() => {
            return screenWidth.value < 1200 ? false : isSideBySide.value;
        });
        
        const togglePreview = () => {
            isPreviewShow.value = !isPreviewShow.value;
        }
        
        const toggleFullscreen = () => {
            isFullscreen.value = !isFullscreen.value;
        }
        
        const toggleSideBySide = () => {
            if (screenWidth.value < 1200) {
                // 在小屏幕上给出提示
                ElMessage.info('当前屏幕较小，建议使用单列模式以获得更好体验');
                return;
            }
            isSideBySide.value = !isSideBySide.value;
            // 如果切换到分屏模式，自动显示预览
            if (isSideBySide.value) {
                isPreviewShow.value = true;
            }
        }
        
        // 监听窗口大小变化
        const handleResize = () => {
            screenWidth.value = window.innerWidth;
        }
        
        // 处理文件导入
        const handleFileImported = (fileData) => {
            // 更新文章标题和简介
            if (fileData.title) {
                Article_Title.value = fileData.title;
            }
            if (fileData.description) {
                Article_Introduction.value = fileData.description;
            }
            // 更新编辑器内容
            if (fileData.content) {
                content.value = fileData.content;
            }
            
            ElMessage.success('文件内容已成功导入编辑器！');
        }

        watch(
            () => props.baseValue,
            (newBaseValue) => {
                content.value = newBaseValue;
            }
        );

        onMounted(() => {
            // 在mounted中初始化tinymce
            tinymce.init({});
            // 添加窗口大小监听
            window.addEventListener('resize', handleResize);
        });

        onBeforeUnmount(() => {
            // 在组件卸载前销毁tinymce实例
            tinymce.remove();
            // 移除事件监听
            window.removeEventListener('resize', handleResize);
        })

        return {
            init,
            content,
            isPreviewShow,
            isFullscreen,
            isSideBySide,
            effectiveLayoutMode,
            Article_Id,
            Article_Title,
            Article_Introduction,
            visible,

            handleClick,
            handleSubmit,
            togglePreview,
            toggleFullscreen,
            toggleSideBySide,
            handleFileImported,
        };

    },
}
</script>

<template>
    <div class="editor-container" :class="{ 'fullscreen': isFullscreen, 'side-by-side': isSideBySide }">
        <el-form>
            <!-- 顶部工具栏 -->
            <div class="toolbar-container">
                <div class="toolbar-left">
                    <div class="editor-title-section">
                        <h2 class="editor-title">文章编辑器</h2>
                        <span class="mode-description">
                            {{ effectiveLayoutMode ? '当前：左右分屏模式 - 编辑与预览并排显示' : '当前：上下单列模式 - 编辑在上，预览在下' }}
                        </span>
                    </div>
                </div>
                <div class="toolbar-right">
                    <el-button-group>
                        <el-button 
                            @click="toggleSideBySide()" 
                            :type="isSideBySide ? 'primary' : 'default'"
                            size="default"
                        >
                            <el-icon><Grid v-if="isSideBySide" /><Document v-else /></el-icon>
                            {{ isSideBySide ? '左右分屏' : '上下单列' }}
                        </el-button>
                        <el-button 
                            @click="togglePreview()" 
                            :type="isPreviewShow ? 'success' : 'default'"
                            size="default"
                        >
                            <el-icon><View v-if="isPreviewShow" /><Hide v-else /></el-icon>
                            {{ isPreviewShow ? '预览开启' : '预览关闭' }}
                        </el-button>
                        <el-button 
                            @click="toggleFullscreen()" 
                            :type="isFullscreen ? 'warning' : 'default'"
                            size="default"
                        >
                            <el-icon><FullScreen /></el-icon>
                            {{ isFullscreen ? '退出全屏' : '进入全屏' }}
                        </el-button>
                    </el-button-group>
                    <el-button 
                        @click="handleSubmit()" 
                        size="default" 
                        type="success"
                        style="margin-left: 12px;"
                    >
                        <el-icon><Upload /></el-icon>
                        发布文章
                    </el-button>
                </div>
            </div>

            <!-- 主内容区域 -->
            <div class="main-content" :class="{ 'split-layout': effectiveLayoutMode && isPreviewShow }">
                <!-- 左侧编辑区域 -->
                <div class="editor-section" :class="{ 'half-width': effectiveLayoutMode && isPreviewShow }">
                    <!-- 文章信息面板 -->
                    <div class="article-info-panel">
                        <el-card class="info-card" shadow="never">
                            <template #header>
                                <div class="card-header">
                                    <span class="card-title">文章信息</span>
                                </div>
                            </template>
                            
                            <!-- 文件上传组件 -->
                            <div class="file-upload-section">
                                <FileUploadComponent @file-imported="handleFileImported" />
                                <el-divider>或手动输入</el-divider>
                            </div>
                            
                            <el-form-item label="文章标题" label-position="top">
                                <el-input 
                                    v-model="Article_Title" 
                                    placeholder="给文章起个引人注目的标题"
                                    size="large"
                                    maxlength="100"
                                    show-word-limit
                                    clearable
                                />
                            </el-form-item>
                            <el-form-item label="文章简介" label-position="top">
                                <el-input 
                                    v-model="Article_Introduction" 
                                    type="textarea" 
                                    :autosize="{ minRows: 3, maxRows: 4 }" 
                                    placeholder="用简洁的语言介绍文章内容，让读者一目了然" 
                                    maxlength="200" 
                                    show-word-limit 
                                    clearable
                                />
                            </el-form-item>
                        </el-card>
                    </div>
                    
                    <!-- 编辑器 -->
                    <div class="editor-wrapper">
                        <div class="editor-header">
                            <span class="editor-label">文章内容</span>
                            <div class="editor-stats">
                                <span class="word-count">字数统计将在此显示</span>
                            </div>
                        </div>
                        <div class="tinymce-container">
                            <Editor
                                v-model="content"
                                ref="edit"
                                :init="init"
                                :disabled="disabled"
                            />
                        </div>
                    </div>
                </div>

                <!-- 右侧预览区域 -->
                <div 
                    v-show="isPreviewShow" 
                    class="preview-section" 
                    :class="{ 'half-width': effectiveLayoutMode, 'full-width': !effectiveLayoutMode }"
                >
                    <el-card class="preview-card" shadow="never">
                        <template #header>
                            <div class="preview-header">
                                <span class="preview-title">实时预览</span>
                                <el-button 
                                    size="small" 
                                    text 
                                    @click="togglePreview()"
                                    v-if="!effectiveLayoutMode"
                                >
                                    收起预览
                                </el-button>
                            </div>
                        </template>
                        <div class="preview-content">
                            <div class="article-preview">
                                <h1 class="preview-article-title">
                                    {{ Article_Title || '文章标题将在此显示' }}
                                </h1>
                                <div class="preview-article-meta">
                                    <span class="preview-intro">{{ Article_Introduction || '文章简介将在此显示' }}</span>
                                </div>
                                <div class="preview-divider"></div>
                                <div v-html="content" class="preview-body"></div>
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>
        </el-form>

        <!-- 提示对话框 -->
        <el-dialog v-model="visible" :show-close="false" width="500">
            <template #header="{ close, titleId, titleClass }">
                <div class="dialog-header">
                    <h4 :id="titleId" :class="titleClass">温馨提示</h4>
                    <el-button type="danger" @click="close" size="small">
                        <el-icon><CircleCloseFilled /></el-icon>
                        关闭
                    </el-button>
                </div>
            </template>
            <div class="dialog-content">
                <p>📝 编辑器使用小贴士：</p>
                <ul>
                    <li>如果内容加载缓慢，请耐心等待1-2秒</li>
                    <li>图片粘贴可能需要重试一次以获得最佳效果</li>
                    <li>建议使用分屏模式进行实时预览</li>
                    <li>支持全屏模式，获得更好的写作体验</li>
                </ul>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
/* 编辑器容器样式 */
.editor-container {
    min-height: 100vh;
    background: #f5f7fa;
    transition: all 0.3s ease;
    padding: 20px;
    box-sizing: border-box;
}

.editor-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: #fff;
    padding: 20px;
}

/* 工具栏样式 */
.toolbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;
}

.toolbar-left .editor-title {
    margin: 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
}

.toolbar-left .editor-title-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mode-description {
    font-size: 12px;
    color: #909399;
    font-weight: normal;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* 主内容区域 */
.main-content {
    display: flex;
    gap: 20px;
    min-height: calc(100vh - 120px);
}

.main-content.split-layout {
    display: flex;
}

/* 编辑器区域 */
.editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: all 0.3s ease;
}

.editor-section.half-width {
    flex: 0 0 50%;
    max-width: 50%;
}

/* 文章信息面板 */
.article-info-panel {
    width: 100%;
}

.info-card {
    border-radius: 12px;
    border: 1px solid #e4e7ed;
}

.info-card :deep(.el-card__header) {
    background: #fafafa;
    border-bottom: 1px solid #ebeef5;
    padding: 16px 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    font-weight: 600;
    color: #303133;
    font-size: 16px;
}

.info-card :deep(.el-card__body) {
    padding: 20px;
}

/* 文件上传区域样式 */
.file-upload-section {
    margin-bottom: 20px;
}

.file-upload-section :deep(.el-divider) {
    margin: 20px 0;
}

.file-upload-section :deep(.el-divider__text) {
    background-color: #fafafa;
    color: #909399;
    font-size: 12px;
}

/* 编辑器包装器 */
.editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    overflow: hidden;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #fafafa;
    border-bottom: 1px solid #ebeef5;
}

.editor-label {
    font-weight: 600;
    color: #303133;
    font-size: 16px;
}

.editor-stats {
    font-size: 12px;
    color: #909399;
}

.tinymce-container {
    flex: 1;
    padding: 0;
}

.tinymce-container :deep(.tox-tinymce) {
    border: none !important;
    border-radius: 0 !important;
}

.tinymce-container :deep(.tox-editor-header) {
    border-bottom: 1px solid #ebeef5 !important;
}

/* 预览区域 */
.preview-section {
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.preview-section.half-width {
    flex: 0 0 50%;
    max-width: 50%;
}

.preview-section.full-width {
    width: 100%;
    margin-top: 20px;
}

.preview-card {
    height: 100%;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
}

.preview-card :deep(.el-card__header) {
    background: #f0f9ff;
    border-bottom: 1px solid #ebeef5;
    padding: 16px 20px;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-title {
    font-weight: 600;
    color: #303133;
    font-size: 16px;
}

.preview-card :deep(.el-card__body) {
    padding: 0;
    height: calc(100% - 57px);
}

.preview-content {
    height: 100%;
    overflow-y: auto;
}

/* 文章预览样式 */
.article-preview {
    padding: 30px;
    max-width: none;
    line-height: 1.6;
    color: #2c3e50;
}

.preview-article-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 16px 0;
    line-height: 1.3;
    word-wrap: break-word;
}

.preview-article-meta {
    margin-bottom: 24px;
}

.preview-intro {
    color: #666;
    font-size: 16px;
    line-height: 1.5;
    font-style: italic;
}

.preview-divider {
    height: 1px;
    background: linear-gradient(90deg, #409eff, transparent);
    margin: 24px 0;
}

.preview-body {
    font-size: 16px;
    line-height: 1.8;
    color: #2c3e50;
}

.preview-body :deep(h1) { font-size: 24px; margin: 20px 0 16px 0; color: #2c3e50; }
.preview-body :deep(h2) { font-size: 22px; margin: 18px 0 14px 0; color: #2c3e50; }
.preview-body :deep(h3) { font-size: 20px; margin: 16px 0 12px 0; color: #2c3e50; }
.preview-body :deep(p) { margin: 12px 0; }
.preview-body :deep(img) { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }
.preview-body :deep(table) { width: 100%; margin: 16px 0; border-collapse: collapse; }
.preview-body :deep(table th), 
.preview-body :deep(table td) { 
    padding: 8px 12px; 
    border: 1px solid #ddd; 
    text-align: left; 
}
.preview-body :deep(table th) { background: #f5f5f5; font-weight: 600; }
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

/* 对话框样式 */
.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dialog-content {
    color: #606266;
    line-height: 1.6;
}

.dialog-content ul {
    margin: 12px 0;
    padding-left: 20px;
}

.dialog-content li {
    margin: 8px 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .editor-container {
        padding: 16px;
    }
    
    .toolbar-container {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    
    .toolbar-left .editor-title-section {
        text-align: center;
    }
    
    .toolbar-right {
        justify-content: center;
    }
    
    /* 在中等屏幕上强制使用单列模式 */
    .main-content.split-layout {
        flex-direction: column;
    }
    
    .editor-section.half-width,
    .preview-section.half-width {
        flex: none;
        max-width: none;
        width: 100%;
    }
    
    .preview-section.full-width {
        margin-top: 20px;
    }
}

@media (max-width: 768px) {
    .editor-container {
        padding: 12px;
        min-height: calc(100vh - 24px);
    }
    
    .toolbar-container {
        padding: 12px 16px;
        margin-bottom: 16px;
    }
    
    .toolbar-left .editor-title {
        font-size: 18px;
    }
    
    .toolbar-right {
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .main-content {
        gap: 16px;
        min-height: calc(100vh - 160px);
    }
    
    .article-preview {
        padding: 20px;
    }
    
    .preview-article-title {
        font-size: 24px;
    }
    
    .preview-body {
        font-size: 15px;
    }
    
    /* 移动端强制单列布局 */
    .main-content.split-layout {
        flex-direction: column;
    }
    
    .editor-section.half-width,
    .preview-section.half-width {
        flex: none;
        max-width: none;
        width: 100%;
    }
}

@media (max-width: 480px) {
    .toolbar-container {
        padding: 10px 12px;
    }
    
    .toolbar-right .el-button-group {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    
    .toolbar-right .el-button-group .el-button {
        margin: 2px 0;
        border-radius: 6px !important;
    }
    
    .article-preview {
        padding: 16px;
    }
    
    .preview-article-title {
        font-size: 20px;
    }
    
    .preview-body {
        font-size: 14px;
    }
}

/* 全屏模式特殊样式 */
.editor-container.fullscreen .main-content {
    min-height: calc(100vh - 120px);
}

.editor-container.fullscreen .toolbar-container {
    position: sticky;
    top: 0;
    z-index: 100;
}

/* 动画效果 */
.editor-section,
.preview-section {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 滚动条样式 */
.preview-content::-webkit-scrollbar {
    width: 6px;
}

.preview-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.preview-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.preview-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>




//未来可能会用到的代码，先留着吧
//   external_plugins: {
//     powerpaste: '/tinymce/powerpaste/plugin.min.js', // word文档黏贴插件
//   },
// images_upload_handler: async (blobInfo, success, failure) => {
// const files = blobInfo.blob();
// const formData = new FormData();
// formData.append('file', files);
// try {
//     const response = await upLoadImg(formData);
//     success(response.data); // 上传成功返回图片URL
// } catch (error) {
//     emit('showMessage', { type: 'warning', message: '上传失败！服务器错误！' });
// }
// }



// // 监听 myValue 和 baseValue 的变化
// watch(myValue, (newValue) => {
//   emit('getValue', newValue + '<style>*{margin: 0;padding: 0} img{max-width: 100%!important} table{max-width: 100%!important;}</style>');
// });
