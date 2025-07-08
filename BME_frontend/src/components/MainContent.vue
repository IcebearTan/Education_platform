<template>
  <div class="main-content-wrapper">
    <div class="news-section">
      <h2 class="section-title">
        <span class="title-text">最新资讯</span>
        <span class="title-decoration"></span>
      </h2>
      
      <div class="news-grid" v-if="articles.length > 0">
        <div
          class="news-card"
          v-for="article in reversedArticles"
          :key="article.Article_Id"
          @click="goToArticle(article.Article_Id)"
        >
          <div class="news-card-content">
            <div class="news-card-header">
              <h3 class="news-card-title">{{ article.Article_Title }}</h3>
              <span class="news-card-date">{{ formatDate(article.Article_Time) }}</span>
            </div>
            <p class="news-card-summary">{{ article.Article_Introduction }}</p>
            <div class="news-card-footer">
              <span class="news-card-action">
                <span class="action-text">阅读全文</span>
                <span class="action-arrow">→</span>
              </span>
              <div class="news-card-stats">
                <span class="stat-item">
                  <span class="stat-icon">👍</span>
                  <span class="stat-count">{{ article.likeCount || 0 }}</span>
                </span>
                <span class="stat-item">
                  <span class="stat-icon">👀</span>
                  <span class="stat-count">{{ article.viewCount || 0 }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <div class="empty-icon">📰</div>
        <h3 class="empty-title">暂无资讯</h3>
        <p class="empty-description">最新的资讯内容即将发布，敬请期待</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

// 定义 props
const props = defineProps({
  articles: {
    type: Array,
    default: () => []
  }
});

// 定义 emits
const emit = defineEmits(['article-click']);

// 计算属性：倒序文章列表
const reversedArticles = computed(() => {
  return props.articles.slice().reverse();
});

// 跳转到文章详情
const goToArticle = (articleId) => {
  emit('article-click', articleId);
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays <= 7) return `${diffDays} 天前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};
</script>

<style scoped>
.main-content-wrapper {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px;
}

.news-section {
  width: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 40px 0 32px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  position: relative;
}

.title-text {
  background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.title-decoration {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 50%, #e6a23c 100%);
  border-radius: 1px;
  position: relative;
  overflow: hidden;
}

.title-decoration::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.news-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.news-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.04);
  overflow: hidden;
  position: relative;
}

.news-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #67c23a, #e6a23c);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.news-card:hover {
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  transform: translateY(-6px);
  border-color: rgba(64, 158, 255, 0.2);
}

.news-card:hover::before {
  opacity: 1;
}

.news-card-content {
  padding: 28px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.news-card-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.news-card-date {
  font-size: 14px;
  color: #8a8a8a;
  font-weight: 500;
  background: rgba(64, 158, 255, 0.08);
  padding: 6px 12px;
  border-radius: 12px;
  white-space: nowrap;
  font-family: 'SF Mono', Monaco, 'Roboto Mono', monospace;
}

.news-card-summary {
  font-size: 16px;
  color: #4a4a4a;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
}

.news-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.news-card-action {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.08);
  border: 1px solid transparent;
}

.action-arrow {
  transition: transform 0.2s ease;
}

.news-card-action:hover {
  background: rgba(64, 158, 255, 0.15);
  color: #1867c0;
  border-color: rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

.news-card-action:hover .action-arrow {
  transform: translateX(4px);
}

.news-card-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(0,0,0,0.03);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(0,0,0,0.06);
  color: #666;
}

.stat-icon {
  font-size: 16px;
}

.stat-count {
  font-weight: 500;
  font-family: 'SF Mono', Monaco, 'Roboto Mono', monospace;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #4a4a4a;
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 16px;
  color: #8a8a8a;
  line-height: 1.5;
  margin: 0;
  max-width: 400px;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .main-content-wrapper {
    padding: 0 12px;
  }
  
  .section-title {
    font-size: 24px;
    margin: 24px 0 20px 0;
  }
  
  .news-grid {
    gap: 16px;
  }
  
  .news-card-content {
    padding: 20px 16px 18px 16px;
    gap: 12px;
  }
  
  .news-card-title {
    font-size: 18px;
  }
  
  .news-card-summary {
    font-size: 14px;
  }
  
  .news-card-date {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .news-card-action {
    font-size: 14px;
    padding: 6px 12px;
  }
  
  .stat-item {
    font-size: 12px;
    padding: 4px 8px;
  }
}

@media (max-width: 600px) {
  .news-card-content {
    padding: 16px 12px 14px 12px;
  }
  
  .news-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .news-card-title {
    font-size: 16px;
  }
  
  .news-card-date {
    align-self: flex-end;
  }
  
  .news-card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .news-card-action {
    justify-content: center;
  }
  
  .news-card-stats {
    justify-content: center;
  }
  
  .empty-state {
    padding: 60px 16px;
  }
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .empty-title {
    font-size: 20px;
  }
  
  .empty-description {
    font-size: 14px;
  }
}

/* 骨架屏动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.news-card.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

/* 进入动画 */
.news-card {
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.news-card:nth-child(2) { animation-delay: 0.1s; }
.news-card:nth-child(3) { animation-delay: 0.2s; }
.news-card:nth-child(4) { animation-delay: 0.3s; }
.news-card:nth-child(5) { animation-delay: 0.4s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
