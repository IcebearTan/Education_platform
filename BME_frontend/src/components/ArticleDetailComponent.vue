<template>
  <div>
    <el-container>
        <el-header class="article-header">
        <div style="display: flex; justify-content: left; align-items: center; font-size: 28px; font-weight: bold; margin-bottom: 10px;">
            {{ articleTitle }}
        </div>
        <div class="article-footer">
            <span class="publish-time">创建时间：{{ articleTime + '' }} 作者：{{ articleAuthor }}</span>
            <div class="article-stats">
                <span class="like-count">点赞数 0</span>
                <span class="view-count">阅读数 0</span>
            </div>
        </div>
        </el-header>
        <el-main style="padding: 0;">
            <div class="content" v-html="article"></div>
        </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { id } from 'element-plus/es/locales.mjs';
import { defineComponent } from 'vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api';

export default defineComponent({

    name: 'ArticleDetailComponent',
    props: {
        id: {
            type: String,
            required: true
        }
    },

    setup(props, context) {
        const route = useRoute(); // 获取当前路由
        const article = ref(''); // 使用 ref 创建响应式数据
        const articleTitle = ref('');
        const articleTime = ref('');
        const articleAuthor = ref('');

        const getArticle = async () => {
            try {
                console.log(props.id);
                const response = await api({
                method: 'get',
                url: '/article',
                params: {
                    Article_Id: props.id // 从路由查询参数获取Article_Id
                }
                });
                console.log(response.data);
                articleTitle.value = response.data.Article_Title;
                articleTime.value = response.data.Publish_Time;
                articleAuthor.value = response.data.Article_Author
                article.value = JSON.parse(response.data.html_content); // 更新响应式数据
                // console.log(article.value.html_content);
            } catch (error) {
                console.error(error);
            }
        };

        // onMounted生命周期钩子
        onMounted(async () => {
            console.log(route.query.Article_Id); // 打印查询参数
            await getArticle(); // 获取文章数据
        });

        
        return {
            article,
            articleTitle,
            articleTime,
            articleAuthor
        }
  },
})
</script>

<style scoped>
.article-header{
    margin-top: 20px;
    margin-left: 30px;
    margin-right: 30px;

    height: min-content;
}
.content{
    margin-left: 30px;
    margin-right: 30px;
}
</style>
