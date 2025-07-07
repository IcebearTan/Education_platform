<template>
  <div class="article-wrapper">
    <!-- 文章主体区域 -->
    <div class="article-container">
      <!-- 文章头部 -->
      <article class="article-main">
        <header class="article-header">
          <div class="article-category">
            <span class="category-tag">技术分享</span>
          </div>
          
          <h1 class="article-title">{{ articleTitle }}</h1>
          
          <div class="article-meta">
            <div class="author-info">
              <div class="author-avatar">
                <img src="../../assets/ice_bear_avatar.jpg" alt="作者头像" />
              </div>
              <div class="author-details">
                <span class="author-name">{{ articleAuthor }}</span>
                <time class="publish-time">{{ formatTime(articleTime) }}</time>
              </div>
            </div>
            
            <div class="article-actions">
              <div class="action-item">
                <i class="action-icon">👁</i>
                <span>0</span>
              </div>
              <div class="action-item">
                <i class="action-icon">👍</i>
                <span>0</span>
              </div>
              <div class="action-item">
                <i class="action-icon">💬</i>
                <span>0</span>
              </div>
            </div>
          </div>
        </header>

        <!-- 文章内容 -->
        <div class="article-content">
          <div class="content-body" v-html="article"></div>
        </div>

        <!-- 文章底部操作区 -->
        <footer class="article-footer">
          <div class="interaction-section">
            <div class="interaction-buttons">
              <button class="btn-interaction like">
                <i class="icon">👍</i>
                <span>点赞</span>
              </button>
              <button class="btn-interaction comment">
                <i class="icon">💬</i>
                <span>评论</span>
              </button>
              <button class="btn-interaction share">
                <i class="icon">📤</i>
                <span>分享</span>
              </button>
            </div>
          </div>

          <!-- 标签区域 -->
          <div class="tags-section">
            <div class="article-tags">
              <span class="tag">Vue.js</span>
              <span class="tag">前端开发</span>
              <span class="tag">教程</span>
            </div>
          </div>
        </footer>
      </article>
    </div>

    <!-- 侧边栏区域 -->
    <aside class="article-sidebar">
      <!-- 目录导航 -->
      <div class="sidebar-section toc-section">
        <h3 class="section-title">目录</h3>
        <div class="toc-content">
          <div v-if="toc.length === 0" class="placeholder-text">暂无目录</div>
          <ul v-else class="toc-list">
            <li 
              v-for="item in toc" 
              :key="item.id"
              class="toc-item"
              :class="`toc-level-${item.level}`"
              @click="scrollToHeading(item.id)"
            >
              <a class="toc-link">
                <span class="toc-index">{{ item.index }}</span>
                {{ item.text }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 相关文章 -->
      <div class="sidebar-section related-section">
        <h3 class="section-title">相关文章</h3>
        <div class="related-content">
          <p class="placeholder-text">相关文章推荐</p>
        </div>
      </div>

      <!-- 作者信息卡片 -->
      <div class="sidebar-section author-card">
        <h3 class="section-title">关于作者</h3>
        <div class="author-card-content">
          <div class="author-card-avatar">
            <img src="../../assets/ice_bear_avatar.jpg" alt="作者头像" />
          </div>
          <div class="author-card-info">
            <h4 class="author-card-name">{{ articleAuthor }}</h4>
            <p class="author-card-desc">技术分享者，专注前端开发</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script lang="ts">
import { id } from 'element-plus/es/locales.mjs';
import { defineComponent } from 'vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api';

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
        const toc = ref([]); // 目录数组

        // 生成目录（带多级序号）
        const generateTOC = (htmlContent) => {
            if (!htmlContent) return [];
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const tocList = [];
            const numberStack = [0, 0, 0, 0, 0, 0]; // h1-h6
            let lastLevel = 1;
            headings.forEach((heading, index) => {
                const level = parseInt(heading.tagName.charAt(1)); // 1-6
                // 维护多级序号
                if (level > lastLevel) {
                    // 新子级
                    numberStack[level - 1] = 1;
                } else if (level === lastLevel) {
                    numberStack[level - 1]++;
                } else {
                    // 回到上级，后面级别清零
                    numberStack[level - 1]++;
                    for (let i = level; i < 6; i++) numberStack[i] = 0;
                }
                lastLevel = level;
                // 生成序号字符串
                const indexStr = numberStack.slice(0, level).filter(n => n > 0).join('.');
                const id = `toc-heading-${index}`;
                const text = heading.textContent.trim();
                heading.id = id;
                tocList.push({
                    id,
                    text,
                    level,
                    index: indexStr,
                    element: heading
                });
            });
            article.value = tempDiv.innerHTML;
            return tocList;
        };

        // 目录项点击跳转
        const scrollToHeading = (headingId) => {
            const element = document.getElementById(headingId);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }
        };

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
                articleAuthor.value = response.data.Article_Author;
                
                const htmlContent = JSON.parse(response.data.html_content);
                article.value = htmlContent;
                
                // 生成目录
                toc.value = generateTOC(htmlContent);
            } catch (error) {
                console.error(error);
            }
        };

        // 格式化时间
        const formatTime = (timeStr) => {
            if (!timeStr) return '';
            const date = new Date(timeStr);
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
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
            articleAuthor,
            toc,
            formatTime,
            scrollToHeading
        }
  },
})
</script>

<style scoped>
.article-wrapper {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 32px;
  padding: 32px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

/* 文章主体区域 */
.article-container {
  flex: 1;
  min-width: 0;
}

.article-main {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

/* 文章头部 */
.article-header {
  padding: 40px 40px 32px;
  border-bottom: 1px solid #f1f3f5;
}

.article-category {
  margin-bottom: 16px;
}

.category-tag {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  word-break: break-word;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f1f3f5;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.publish-time {
  font-size: 14px;
  color: #8e8e93;
}

.article-actions {
  display: flex;
  gap: 24px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8e8e93;
  font-size: 14px;
}

.action-icon {
  font-size: 16px;
}

/* 文章内容 */
.article-content {
  padding: 0 40px;
}

.content-body {
  line-height: 1.8;
  font-size: 16px;
  color: #2c2c2c;
  word-break: break-word;
}

/* 全局文章内容样式 */
.content-body h1, .content-body h2, .content-body h3 {
  margin: 32px 0 16px 0;
  color: #1a1a1a;
  font-weight: 600;
  scroll-margin-top: 80px; /* 为锚点跳转添加顶部偏移 */
}

.content-body h4, .content-body h5, .content-body h6 {
  margin: 24px 0 12px 0;
  color: #1a1a1a;
  font-weight: 600;
  scroll-margin-top: 80px;
}

.content-body h1 { font-size: 28px; }
.content-body h2 { font-size: 24px; }
.content-body h3 { font-size: 20px; }

.content-body p {
  margin: 16px 0;
  line-height: 1.8;
}

.content-body img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 24px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.content-body code {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 14px;
  color: #d73a49;
}

.content-body pre {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 24px 0;
  border-left: 4px solid #0366d6;
}

/* 文章底部 */
.article-footer {
  padding: 32px 40px 40px;
  border-top: 1px solid #f1f3f5;
  margin-top: 40px;
}

.interaction-section {
  margin-bottom: 32px;
}

.interaction-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-interaction {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #f8f9fa;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease;
}

.btn-interaction:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.btn-interaction.like:hover {
  background: #fff5f5;
  color: #e53e3e;
}

.btn-interaction.comment:hover {
  background: #f0f8ff;
  color: #3182ce;
}

.btn-interaction.share:hover {
  background: #f0fff4;
  color: #38a169;
}

.tags-section {
  display: flex;
  justify-content: center;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background: #f1f3f5;
  color: #495057;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag:hover {
  background: #e9ecef;
  cursor: pointer;
}

/* 侧边栏 */
.article-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sidebar-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f1f3f5;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f3f5;
}

.placeholder-text {
  color: #8e8e93;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
  margin: 0;
}

/* 目录样式 */
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.toc-link {
  display: block;
  padding: 8px 12px;
  color: #495057;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.toc-index {
  color: #b0b0b0;
  font-size: 13px;
  margin-right: 6px;
  min-width: 32px;
  display: inline-block;
}

.toc-link:hover {
  background: #f8f9fa;
  color: #667eea;
  border-left-color: #667eea;
}

/* 不同级别标题的缩进 */
.toc-level-1 .toc-link {
  font-weight: 600;
  padding-left: 12px;
}

.toc-level-2 .toc-link {
  padding-left: 20px;
  font-size: 13px;
}

.toc-level-3 .toc-link {
  padding-left: 28px;
  font-size: 13px;
  color: #6c757d;
}

.toc-level-4 .toc-link,
.toc-level-5 .toc-link,
.toc-level-6 .toc-link {
  padding-left: 36px;
  font-size: 12px;
  color: #6c757d;
}

/* 作者卡片 */
.author-card-content {
  text-align: center;
}

.author-card-avatar {
  margin-bottom: 16px;
}

.author-card-avatar img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f1f3f5;
}

.author-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.author-card-desc {
  font-size: 14px;
  color: #8e8e93;
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-wrapper {
    flex-direction: column;
    padding: 16px;
    gap: 24px;
  }

  .article-sidebar {
    width: 100%;
    order: -1;
  }

  .article-header {
    padding: 24px 20px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-content {
    padding: 0 20px;
  }

  .article-footer {
    padding: 24px 20px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .interaction-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .sidebar-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .article-wrapper {
    padding: 12px;
  }

  .article-header {
    padding: 20px 16px;
  }

  .article-content {
    padding: 0 16px;
  }

  .article-footer {
    padding: 20px 16px;
  }

  .article-title {
    font-size: 20px;
  }

  .content-body {
    font-size: 15px;
  }
}
</style>
