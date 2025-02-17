<template>
    <div class="common-layer">
        <el-form>
            <div class="article-info">

            </div>
            <div class="tinymce-box">
                <Editor
                    v-model="content"
                    ref="edit"
                    :init="init"
                    :disabled="disabled"
                />
                <el-button @click="handleClick()">获取内容</el-button>
                <el-button @click="handleSubmit()">提交内容</el-button>

            </div>
        </el-form>
        
        <div v-html="content"></div>
    </div>
    
</template>

<!-- <script setup>

</script> -->

<script>
import { ref, reactive, watch, onMounted } from 'vue';
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
      default: 'lists image media table wordcount link code preview hr paste',
    },
    toolbar: {
      type: [String, Array],
      default:
        "undo redo | formatselect fontselect fontsizeselect | hr link lineheight forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | image media quicklink h2 h3 blockquote table numlist bullist fullscreen",
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
        const content = ref('<p>fuck you</p>')

        const handleClick = () => {
            console.log(content.value)
        }

        // 定义响应式的数据
        // const myValue = ref(props.baseValue);
        const init = reactive({
            images_upload_url: 'http://192.168.3.47:8081/imgUpload',
            language_url: '/tinymce/langs/zh_CN.js', // 中文插件
            language: 'zh_CN',

            font_formats:
            "微软雅黑=Microsoft YaHei,Helvetica Neue;PingFang SC;sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun;serifsans-serif;Terminal=terminal;monaco;Times New Roman=times new roman;times",
            fontsize_formats: '12px 14px 16px 18px 20px 24px 26px 28px 30px 32px 36px',
            block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Preformatted=pre; Blockquote=blockquote',
            skin_url: '/tinymce/skins/ui/oxide',
            paste_data_images: true, // 允许粘贴图片
            menubar: false,
            height: props.height,
            plugins: props.plugins,
            toolbar: props.toolbar,
            branding: false,
            
            //   external_plugins: {
            //     powerpaste: '/tinymce/powerpaste/plugin.min.js', // word文档黏贴插件
            //   },
            images_upload_handler: async (blobInfo, success, failure) => {
            const files = blobInfo.blob();
            const formData = new FormData();
            formData.append('file', files);
            try {
                const response = await upLoadImg(formData);
                success(response.data); // 上传成功返回图片URL
            } catch (error) {
                emit('showMessage', { type: 'warning', message: '上传失败！服务器错误！' });
            }
            },
        });

        const Article_Id = ref('');
        const fetchArticleContent = async () => {
            try {
                Article_Id.value = props.Article_Id;
                console.log(Article_Id);
                const res = await api({
                    url: '/article',
                    method: 'get',
                    params: {
                        Article_Id: Article_Id.value,
                    }
                });
                content.value = JSON.parse(res.data.html_content);
                console.log(res.data);
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
                        Html: JSON.stringify(content.value),
                    }
                });
                console.log(res);
            } catch (error) {
                emit('showMessage', { type: 'warning', message: '更新文章内容失败！' });
            }
            }

        const handleSubmit = () => {
            updateArticleContent();
        }

        // // 监听 myValue 和 baseValue 的变化
        // watch(myValue, (newValue) => {
        //   emit('getValue', newValue + '<style>*{margin: 0;padding: 0} img{max-width: 100%!important} table{max-width: 100%!important;}</style>');
        // });

        watch(
            () => props.baseValue,
            (newBaseValue) => {
            myValue.value = newBaseValue;
            }
        );

        onMounted(() => {
            // 在mounted中初始化tinymce
            tinymce.init({});

            console.log(props.Article_Id);
            fetchArticleContent();
        });

        return {
            init,
            content,

            handleClick,
            handleSubmit,
        };

    },
};
</script>

<style scoped>
/* 添加你的样式 */
.common-layer{
    display: flex;
    flex-direction: row;
}
</style>
