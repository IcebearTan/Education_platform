<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            欢迎回来，{{ userName }}！
            <span class="wave-emoji">👋</span>
          </h1>
          <p class="welcome-subtitle">今天是一个学习的好日子，让我们开始吧！</p>
        </div>
        <div class="banner-decoration">
          <div class="floating-icon">📚</div>
          <div class="floating-icon delay-1">🎓</div>
          <div class="floating-icon delay-2">⭐</div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.title">
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon :size="24">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-change" :class="stat.changeType">
            <el-icon><component :is="stat.changeIcon" /></el-icon>
            <span>{{ stat.change }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-grid">
      <!-- 快速操作 -->
      <div class="quick-actions-card">
        <div class="card-header">
          <h3>快速操作</h3>
          <el-icon class="header-icon"><Lightning /></el-icon>
        </div>
        <div class="actions-grid">
          <div 
            class="action-item" 
            v-for="action in quickActions" 
            :key="action.title"
            @click="handleQuickAction(action.route)"
          >
            <div class="action-icon" :style="{ background: action.color }">
              <el-icon><component :is="action.icon" /></el-icon>
            </div>
            <div class="action-content">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-description">{{ action.description }}</div>
            </div>
            <el-icon class="action-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="recent-activity-card">
        <div class="card-header">
          <h3>最近活动</h3>
          <el-icon class="header-icon"><Clock /></el-icon>
        </div>
        <div class="activity-list">
          <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
            <div class="activity-icon" :style="{ background: activity.color }">
              <el-icon><component :is="activity.icon" /></el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
          <div class="activity-more">
            <el-button text type="primary" style="color: white;">查看更多</el-button>
          </div>
        </div>
      </div>

      <!-- 系统状态 -->
      <div class="system-status-card">
        <div class="card-header">
          <h3>系统状态</h3>
          <el-icon class="header-icon"><Monitor /></el-icon>
        </div>
        <div class="status-list">
          <div class="status-item" v-for="status in systemStatus" :key="status.name">
            <div class="status-info">
              <span class="status-name">{{ status.name }}</span>
              <span class="status-value">{{ status.value }}</span>
            </div>
            <div class="status-bar">
              <div 
                class="status-progress" 
                :style="{ 
                  width: status.percentage + '%', 
                  background: status.color 
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-card">
        <div class="card-header">
          <h3>用户活跃度趋势</h3>
          <el-button-group size="small">
            <el-button :type="chartPeriod === '7d' ? 'primary' : ''" @click="chartPeriod = '7d'">7天</el-button>
            <el-button :type="chartPeriod === '30d' ? 'primary' : ''" @click="chartPeriod = '30d'">30天</el-button>
            <el-button :type="chartPeriod === '90d' ? 'primary' : ''" @click="chartPeriod = '90d'">90天</el-button>
          </el-button-group>
        </div>
        <div class="chart-placeholder">
          <div class="chart-mock">
            <div class="chart-bars">
              <div class="chart-bar" v-for="i in 7" :key="i" :style="{ height: Math.random() * 100 + 20 + 'px' }"></div>
            </div>
            <p class="chart-note">📊 图表组件可以集成 ECharts 或 Chart.js</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  User, Document, Trophy, ChatLineRound, Lightning, Clock, 
  Monitor, ArrowRight, TrendCharts, Bell, Setting, Plus,
  Edit, Search, Upload
} from '@element-plus/icons-vue';

export default {
  name: 'DashboardComponent',
  data() {
    return {
      chartPeriod: '7d',
      userName: '管理员',
      stats: [
        {
          title: '总用户数',
          value: '2,847',
          change: '+12.5%',
          changeType: 'positive',
          changeIcon: TrendCharts,
          icon: User,
          color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          title: '文章数量',
          value: '1,234',
          change: '+8.2%',
          changeType: 'positive',
          changeIcon: TrendCharts,
          icon: Document,
          color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          title: '活跃小组',
          value: '156',
          change: '+15.3%',
          changeType: 'positive',
          changeIcon: TrendCharts,
          icon: ChatLineRound,
          color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          title: '勋章发放',
          value: '892',
          change: '+23.1%',
          changeType: 'positive',
          changeIcon: TrendCharts,
          icon: Trophy,
          color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        }
      ],
      quickActions: [
        {
          title: '创建文章',
          description: '发布新的学习内容',
          icon: Edit,
          color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          route: '/editor'
        },
        {
          title: '用户管理',
          description: '管理系统用户',
          icon: User,
          color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          route: '/user-manage/users'
        },
        {
          title: '勋章管理',
          description: '设置和管理勋章',
          icon: Trophy,
          color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          route: '/medal/manage'
        },
        {
          title: '数据导入',
          description: '批量导入数据',
          icon: Upload,
          color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          route: '/data/import'
        }
      ],
      recentActivities: [
        {
          id: 1,
          title: '用户张三注册了账户',
          time: '2分钟前',
          icon: User,
          color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          id: 2,
          title: '文章《Vue3入门指南》被发布',
          time: '15分钟前',
          icon: Document,
          color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          id: 3,
          title: '勋章"学习达人"被授予',
          time: '1小时前',
          icon: Trophy,
          color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        },
        {
          id: 4,
          title: '小组"前端学习"创建成功',
          time: '2小时前',
          icon: ChatLineRound,
          color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }
      ],
      systemStatus: [
        {
          name: 'CPU使用率',
          value: '45%',
          percentage: 45,
          color: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          name: '内存使用',
          value: '67%',
          percentage: 67,
          color: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
        },
        {
          name: '磁盘空间',
          value: '23%',
          percentage: 23,
          color: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
        },
        {
          name: '网络延迟',
          value: '12ms',
          percentage: 88,
          color: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
        }
      ]
    };
  },
  methods: {
    handleQuickAction(route) {
      if (route) {
        this.$router.push(route);
      } else {
        this.$message.info('功能开发中...');
      }
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* 欢迎横幅 */
.welcome-banner {
  background: var(--primary-gradient);
  border-radius: var(--radius-xl);
  padding: 32px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  color: white;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.welcome-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.wave-emoji {
  animation: wave 2s infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-20deg); }
}

.welcome-subtitle {
  font-size: var(--text-lg);
  opacity: 0.9;
  margin: 0;
}

.banner-decoration {
  display: flex;
  gap: 16px;
}

.floating-icon {
  font-size: 32px;
  animation: float 3s ease-in-out infinite;
}

.floating-icon.delay-1 {
  animation-delay: 0.5s;
}

.floating-icon.delay-2 {
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--border-medium);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  font-weight: 600;
}

.stat-change.positive {
  color: var(--success-color);
}

.stat-change.negative {
  color: var(--error-color);
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

/* 通用卡片样式 */
.quick-actions-card,
.recent-activity-card,
.system-status-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.quick-actions-card:hover,
.recent-activity-card:hover,
.system-status-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-medium);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-icon {
  color: var(--text-secondary);
  font-size: 20px;
}

/* 快速操作 */
.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-item:hover {
  background: var(--bg-tertiary);
  transform: translateX(4px);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.action-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.action-arrow {
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.action-item:hover .action-arrow {
  color: var(--primary-color);
  transform: translateX(4px);
}

/* 最近活动 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.activity-more {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

/* 系统状态 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.status-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.status-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.status-progress {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

/* 图表区域 */
.charts-section {
  margin-bottom: 32px;
}

.chart-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-top: 20px;
}

.chart-mock {
  text-align: center;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
}

.chart-bar {
  width: 20px;
  background: var(--primary-gradient);
  border-radius: 2px 2px 0 0;
  animation: chartGrow 1s ease-out;
}

@keyframes chartGrow {
  from { height: 0 !important; }
}

.chart-note {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .system-status-card {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .banner-decoration {
    align-self: center;
  }
  
  .welcome-title {
    font-size: var(--text-2xl);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .system-status-card {
    grid-column: span 1;
  }
}
</style>
