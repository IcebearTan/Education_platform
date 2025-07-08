# 出勤统计功能说明

## 功能概述

实现了一个完整的小组出勤统计系统，包含以下主要功能：

### 1. 总览统计
- **总出勤天数**：显示所有学生的出勤天数总和
- **平均出勤率**：计算所有学生的平均按时出勤率
- **总出勤时长**：显示所有学生的总出勤时长

### 2. 出勤排行榜
支持按以下三种维度排序：
- **按出勤天数**：按实际出勤天数排序
- **按按时率**：按8:45前签到的比例排序
- **按总时长**：按累计出勤时长排序

### 3. 分级下拉明细
每个学生可以展开查看详细的每日出勤记录：
- 日期
- 签到时间
- 签退时间
- 出勤时长
- 状态标签（正常/迟到/时长不足）

## 技术实现

### 接口调用
- **接口地址**：`/user/group/attendence_by_day`
- **请求方式**：GET
- **请求参数**：
  ```json
  {
    "group_id": 2,
    "startdate": "2025-07-04",
    "enddate": "2025-07-08"
  }
  ```

### 数据处理逻辑

#### 按时率计算
```javascript
// 8:45前签到视为按时
const isLate = checkInTime && checkInTime > '08:45:00'
const onTimeRate = attendanceDays > 0 ? ((onTimeDays / attendanceDays) * 100) : 0
```

#### 时长解析
```javascript
// 解析 "HH:MM:SS" 格式的时长字符串
const parseDuration = (durationStr) => {
  const parts = durationStr.split(':')
  const hours = parseInt(parts[0]) || 0
  const minutes = parseInt(parts[1]) || 0
  return hours + minutes / 60
}
```

#### 达标判断
```javascript
// 3小时及以上为时长达标
const isQualified = duration >= 3
```

## 组件结构

### 文件组织
```
src/components/StudentGroup/
├── AttendanceStatistics.vue    # 出勤统计主组件
├── StudentGroupRank.vue        # 排行榜容器组件
└── ...
```

### 主要组件
- **AttendanceStatistics.vue**：出勤统计的核心组件
- **StudentGroupRank.vue**：集成了学习进度和出勤统计的Tab切换容器

## 特性

### 1. 响应式设计
- 桌面端：网格布局，表格展示
- 移动端：卡片布局，垂直堆叠

### 2. 交互体验
- 点击展开/收起明细
- 排序切换动画
- 加载状态提示
- 空数据处理

### 3. 视觉设计
- 排名前三名特殊样式（金银铜）
- 状态标签颜色区分
- 迟到/时长不足行高亮
- 现代化卡片设计

### 4. 容错处理
- API调用失败时使用模拟数据
- 数据格式容错处理
- 用户友好的错误提示

## 使用方法

### 1. 集成到现有页面
```vue
<template>
  <AttendanceStatistics :groupId="groupId" />
</template>

<script setup>
import AttendanceStatistics from './AttendanceStatistics.vue'

const groupId = ref('2')
</script>
```

### 2. 自定义配置
组件支持通过props传入：
- `groupId`：小组ID（必填）

### 3. 数据格式
期望的接口返回格式：
```json
{
  "code": 200,
  "data": [
    {
      "user_id": 1,
      "username": "张三",
      "avatar": "/path/to/avatar.jpg",
      "daily_attendance": [
        {
          "date": "2024-01-15",
          "check_in_time": "08:30:00",
          "check_out_time": "12:00:00",
          "duration": "03:30:00"
        }
      ]
    }
  ]
}
```

## 未来优化

1. **数据缓存**：实现本地缓存减少API调用
2. **导出功能**：支持导出Excel报表
3. **图表展示**：增加趋势图表
4. **通知提醒**：迟到/缺勤提醒
5. **批量操作**：支持批量查看多个时间段
