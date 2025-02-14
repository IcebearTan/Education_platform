<template>
  <div class="article-list">
    <el-row gutter={20}>
      <el-col v-for="article in articles" :key="article.id" :span="8">
        <el-card class="article-card">
          <div slot="header" class="article-header">
            <h3 class="article-title">{{ article.title }}</h3>
          </div>
          <div class="article-body">
            <p class="article-summary">{{ article.summary }}</p>
          </div>
          <div class="article-footer">
            <span class="publish-time">{{ article.publishTime }}</span>
            <div class="article-stats">
              <span class="like-count"> {{ article.likes }}</span>
              <span class="view-count"> {{ article.views }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      articles: [
        {
          id: 1,
          title: 'Vue 3 组件化开发指南',
          summary: 'Vue 3 是一个渐进式的 JavaScript 框架，它以其灵活性和性能得到了广泛的应用...',
          publishTime: '2025-02-14',
          likes: 150,
          views: 1024
        },
        {
          id: 2,
          title: 'CSS Flexbox 布局技巧',
          summary: 'Flexbox 布局是一种新的 CSS 布局模型，它让我们能够更简单地创建复杂的布局...',
          publishTime: '2025-02-13',
          likes: 120,
          views: 950
        },
        {
          id: 3,
          title: 'JavaScript 深入浅出',
          summary: '这篇文章将深入分析 JavaScript 中的一些高级概念，并提供实践中的一些技巧...',
          publishTime: '2025-02-12',
          likes: 200,
          views: 1350
        }
      ]
    };
  }
};
</script>

<style scoped>
.article-list {
  padding: 20px;
}

.article-card {
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.article-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.article-body {
  padding: 10px 0;
}

.article-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.publish-time {
  font-style: italic;
}

.article-stats {
  display: flex;
  gap: 10px;
}

.like-count,
.view-count {
  display: flex;
  align-items: center;
}

.like-count::before {
  content: '👍';
  margin-right: 5px;
}

.view-count::before {
  content: '👀';
  margin-right: 5px;
}
</style>
