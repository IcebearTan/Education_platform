<script>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { ElButton, ElDialog } from 'element-plus'
import { CircleCloseFilled } from '@element-plus/icons-vue'

import api from '../api';

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
  name: 'EditorComponent',
  components: {
    Editor,
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
      default:"undo redo | formatselect fontsizeselect | hr link lineheight forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | quicklink h2 h3 blockquote table numlist bullist fullscreen",
      },
    width: {
      type: Number,
      default: 1000,
    },
    height: {
      type: Number,
      default: 600,
    },
    baseValue: {
      type: String,
      default: '',
      },
    Article_Id: {
        type: String,
        default: '',
    }
  },
    setup(props, { emit }) {
        const visible = ref(true)
        const content = ref('<p>请添加一点内容吧~</p>')

        const handleClick = () => {
            console.log(content.value)
        }

        const init = reactive({
            // images_upload_url: 'http://192.168.3.47:8081/imgUpload',
            language_url: '/admin/tinymce/langs/zh_CN.js', // 中文插件
            language: 'zh_CN',

            // font_formats:
            // "微软雅黑=Microsoft YaHei,Helvetica Neue;PingFang SC;sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun;serifsans-serif;Terminal=terminal;monaco;Times New Roman=times new roman;times",
            // fontsize_formats: '12px 14px 16px 18px 20px 24px 26px 28px 30px 32px 36px',
            // block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Preformatted=pre; Blockquote=blockquote',
            // skin_url: '/tinymce/skins/ui/oxide',

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
            width: props.width,
            height: props.height,
            plugins: props.plugins,
            toolbar: props.toolbar,
            branding: false,

            content_style: `
                body { 
                    color: #444; 
                    font-family: sans-serif;
                    white-space: break-spaces;
                    word-wrap: break-word;
                }
                .mce-content-body{
                    caret-color: #ff0000; /* 修改光标颜色 */
                }
            `,
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
        const Article_Introduction = ref('');

        const fetchArticleContent = async () => {
            console.log('获取文章内容');
            try {
                // Article_Id.value = props.Article_Id;
                console.log(Article_Id.value);
                const res = await api({
                    url: '/article',
                    method: 'get',
                    params: {
                        Article_Id: Article_Id.value,
                    }
                });
                console.log('拿到了！');
                Article_Title.value = res.data.Article_Title;
                Article_Introduction.value = res.data.Article_Introduction;
                console.log(Article_Title.value);
                console.log(res.data.html_content);
                content.value = JSON.parse(res.data.html_content);

                
            } catch (error) {
                emit('showMessage', { type: 'warning', message: '获取文章内容失败！' });
            }
        };

        const updateArticleContent = () => {
            try {
                const res = api({
                    url: '/article/detail_json',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        Article_Id: Article_Id.value,
                        Article_Title: Article_Title.value,
                        Article_Introduction: Article_Introduction.value,
                        Html: JSON.stringify(content.value),
                    }
                });
                console.log(res);
                // emit('showMessage', { type: 'success', message: '更新文章内容成功！' });
            } catch (error) {
                emit('showMessage', { type: 'warning', message: '更新文章内容失败！' });
            } finally {
                ElMessage.success('更新文章内容成功！正在审核！');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            }

        const handleSubmit = () => {
            updateArticleContent();
        }

        const isPreviewShow = ref(false);
        const togglePreview = () => {
            isPreviewShow.value = !isPreviewShow.value;
        }

        watch(
            () => props.baseValue,
            (newBaseValue) => {
            myValue.value = newBaseValue;
            }
        );

        onMounted(() => {
            // 在mounted中初始化tinymce
            Article_Id.value = props.Article_Id;
            fetchArticleContent();

            tinymce.init({});
        });

        onBeforeUnmount(() => {
            // 在组件卸载前销毁tinymce实例
            tinymce.remove();
        });

        return {
            init,
            content,
            isPreviewShow,
            Article_Id,
            Article_Title,
            Article_Introduction,
            visible,

            handleClick,
            handleSubmit,
            togglePreview,
        };

    },
};
</script>

<template>
    <div class="common-layer">
        <el-form>
            <div style="display: flex; justify-content: center;">
                <div class="article-info">
                    <div class="button-group">
                        <!-- <el-button @click="handleClick()">获取内容</el-button> -->
                        <el-button @click="handleSubmit()" size="large" type="success">保存提交</el-button>
                        <el-button @click="togglePreview()" size="large" type="primary" plain>{{ isPreviewShow ? '隐藏预览' : '显示预览'}}</el-button>
                    </div>
                    <div style="margin: 20px;">
                        <el-form-item label="文章标题" label-position="top">
                            <el-input v-model="Article_Title" placeholder="给文章起个引人注目的标题"></el-input>
                        </el-form-item>
                        <el-form-item label="文章简介" label-position="top">
                            <el-input v-model="Article_Introduction" 
                            type="textarea" 
                            :autosize="{ minRows: 4, maxRows: 5 }" 
                            placeholder="100字以内简要介绍文章内容" 
                            maxlength="100" 
                            show-word-limit 
                            clearable
                            />
                        </el-form-item>
                    </div>
                    
                </div>
                <div class="tinymce-box">
                    <Editor
                        v-model="content"
                        ref="edit"
                        :init="init"
                        :disabled="disabled"
                    />
                </div>
            </div>
        </el-form>
        <div v-show="isPreviewShow" style="width: 1000px; margin: auto; margin-top: 30px;">
            <h1>效果预览</h1>
            <hr></hr>
            <div v-html="content" class="contentPreview"></div>
        </div>
        
    </div>
    <el-dialog v-model="visible" :show-close="false" width="500">
        <template #header="{ close, titleId, titleClass }">
        <div class="my-header">
            <h4 :id="titleId" :class="titleClass">重要提示！!</h4>
            <el-button type="danger" @click="close">
            <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
            Close
            </el-button>
        </div>
        </template>
        如果加载完还没有出现内容的话，请耐心等待1-2秒！
        <br>
        图片第一次粘贴可能出现大小错误，请撤回重新粘贴！
    </el-dialog>

    
</template>

<style scoped>
/* 添加你的样式 */
.common-layer{
    /* display: flex; */
    /* flex-direction: row； */
}

/* 样式调整，将工具栏与编辑区域分开 */
#toolbar-container {
    margin-bottom: 10px; /* 工具栏和编辑框之间的间距 */
}
#editor-container {
    border: 1px solid #ccc;
    min-height: 200px;
}
.tinymce-box{
    display: flex;
    justify-content: center;
}
.contentPreview{
    width: 1000px;
    margin: auto;
    margin-top: 20px;

    background-color: #fff;
    min-height: 1334px;
}
.article-info{
    width: 300px;
    height: 100%;
    margin-right: 20px;
    background-color: #fff;
    border-radius: 10px;
    border: #eee solid 2px;
    box-sizing: border-box;
}
.button-group{
    margin-left: 20px;
    margin-top: 20px;
}
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
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
