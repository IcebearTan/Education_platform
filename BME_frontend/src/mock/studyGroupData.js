// 学习小组相关的Mock数据
// 用于开发阶段测试界面功能，后续替换为真实API

export const mockGroupData = {
    group_id: 1,
    group_name: 'JavaScript 进阶学习小组',
    group_type: 'study',
    description: '专注于 JavaScript 高级特性、框架应用和项目实战的学习小组。通过理论学习和实践项目，提升编程技能和解决问题的能力。我们将深入学习ES6+特性、Vue.js框架、Node.js后端开发，以及现代前端工程化工具的使用。',
    course_name: 'Web前端高级开发',
    teacher_id: 1001,
    teacher_name: '张老师',
    teacher_avatar: '/src/assets/Jerry_Scintilla_avatar.jpg',
    student_count: 8,
    create_time: '2024-01-15',
    status: 'active',
    students: [
        {
            Student_Id: 2001,
            Student: '李小明',
            avatar: '/src/assets/ice_bear_avatar.jpg',
            join_date: '2024-01-16',
            progress: 85,
            completed_tasks: 5,
            total_tasks: 6
        },
        {
            Student_Id: 2002,
            Student: '王小红',
            avatar: '/src/assets/ChenMinJie.jpg',
            join_date: '2024-01-17',
            progress: 72,
            completed_tasks: 4,
            total_tasks: 6
        },
        {
            Student_Id: 2003,
            Student: '陈小强',
            avatar: '/src/assets/LuMengXuan.jpg',
            join_date: '2024-01-18',
            progress: 91,
            completed_tasks: 6,
            total_tasks: 6
        },
        {
            Student_Id: 2004,
            Student: '赵小美',
            avatar: '/src/assets/ジエ_avatar.png',
            join_date: '2024-01-19',
            progress: 67,
            completed_tasks: 3,
            total_tasks: 6
        },
        {
            Student_Id: 2005,
            Student: '刘小华',
            avatar: '/src/assets/ice_bear_avatar.jpg',
            join_date: '2024-01-20',
            progress: 78,
            completed_tasks: 4,
            total_tasks: 6
        },
        {
            Student_Id: 2006,
            Student: '杨小龙',
            avatar: '/src/assets/ChenMinJie.jpg',
            join_date: '2024-01-21',
            progress: 82,
            completed_tasks: 5,
            total_tasks: 6
        },
        {
            Student_Id: 2007,
            Student: '周小丽',
            avatar: '/src/assets/LuMengXuan.jpg',
            join_date: '2024-01-22',
            progress: 89,
            completed_tasks: 5,
            total_tasks: 6
        },
        {
            Student_Id: 2008,
            Student: '孙小赵',
            avatar: '/src/assets/ジエ_avatar.png',
            join_date: '2024-01-23',
            progress: 75,
            completed_tasks: 4,
            total_tasks: 6
        }
    ]
}

export const mockTasks = [
    {
        id: 1,
        title: 'ES6+ 新特性学习',
        description: '学习并掌握箭头函数、解构赋值、模板字符串、Promise、async/await等ES6+特性，完成相关练习题并提交学习笔记。',
        status: 'completed',
        deadline: '2024-02-01',
        created_at: '2024-01-20',
        priority: 'high',
        difficulty: '中等',
        estimated_hours: 8,
        tags: ['JavaScript', 'ES6+', '基础']
    },
    {
        id: 2,
        title: 'Vue3 组件开发实战',
        description: '使用Vue3 Composition API开发一个完整的待办事项管理组件，要求包含增删改查功能、数据持久化、组件通信等特性。',
        status: 'in_progress',
        deadline: '2024-02-10',
        created_at: '2024-01-25',
        priority: 'high',
        difficulty: '困难',
        estimated_hours: 12,
        tags: ['Vue3', '组件开发', '实战']
    },
    {
        id: 3,
        title: 'Node.js API 开发',
        description: '使用Express框架开发RESTful API，实现用户管理、数据验证、JWT认证、文件上传等功能，并编写相应的测试用例。',
        status: 'pending',
        deadline: '2024-02-20',
        created_at: '2024-02-01',
        priority: 'medium',
        difficulty: '困难',
        estimated_hours: 16,
        tags: ['Node.js', 'Express', 'API开发']
    },
    {
        id: 4,
        title: '响应式布局实践',
        description: '使用 CSS Grid 和 Flexbox 完成响应式页面布局，适配移动端、平板和桌面端，掌握现代CSS布局技术。',
        status: 'in_progress',
        deadline: '2024-02-15',
        created_at: '2024-01-28',
        priority: 'medium',
        difficulty: '中等',
        estimated_hours: 6,
        tags: ['CSS', '响应式', '布局']
    },
    {
        id: 5,
        title: 'Webpack 工程化配置',
        description: '学习并配置Webpack构建工具，包括模块打包、代码分割、性能优化、开发环境配置等内容。',
        status: 'pending',
        deadline: '2024-02-25',
        created_at: '2024-02-05',
        priority: 'low',
        difficulty: '困难',
        estimated_hours: 10,
        tags: ['Webpack', '工程化', '构建工具']
    },
    {
        id: 6,
        title: 'Git 版本控制实践',
        description: '掌握Git常用命令、分支管理、合并冲突解决、团队协作流程等版本控制技能。',
        status: 'completed',
        deadline: '2024-01-30',
        created_at: '2024-01-18',
        priority: 'high',
        difficulty: '简单',
        estimated_hours: 4,
        tags: ['Git', '版本控制', '团队协作']
    }
]

export const mockActivities = [
    {
        id: 1,
        type: 'task_submit',
        content: '李小明 提交了 ES6+ 新特性学习 任务，完成度100%',
        time: '2024-02-03 14:30:00',
        user: '李小明',
        user_id: 2001,
        target_type: 'task',
        target_id: 1
    },
    {
        id: 2,
        type: 'discussion',
        content: '张老师 发起了关于 Vue3响应式原理 的讨论，欢迎大家踊跃参与',
        time: '2024-02-03 10:15:00',
        user: '张老师',
        user_id: 1001,
        target_type: 'discussion',
        target_id: 101
    },
    {
        id: 3,
        type: 'resource_share',
        content: '王小红 分享了 JavaScript设计模式详解 学习资源',
        time: '2024-02-02 16:45:00',
        user: '王小红',
        user_id: 2002,
        target_type: 'resource',
        target_id: 201
    },
    {
        id: 4,
        type: 'achievement',
        content: '陈小强 完成了小组学习里程碑，获得进步之星徽章 🌟',
        time: '2024-02-02 09:20:00',
        user: '陈小强',
        user_id: 2003,
        target_type: 'achievement',
        target_id: 301
    },
    {
        id: 5,
        type: 'join',
        content: '孙小赵 加入了学习小组，让我们欢迎新成员！',
        time: '2024-01-23 14:00:00',
        user: '孙小赵',
        user_id: 2008,
        target_type: 'member',
        target_id: 2008
    },
    {
        id: 6,
        type: 'task_create',
        content: '张老师 发布了新任务：Webpack 工程化配置',
        time: '2024-02-05 09:30:00',
        user: '张老师',
        user_id: 1001,
        target_type: 'task',
        target_id: 5
    },
    {
        id: 7,
        type: 'task_complete',
        content: '周小丽 完成了任务：Git 版本控制实践',
        time: '2024-01-30 11:20:00',
        user: '周小丽',
        user_id: 2007,
        target_type: 'task',
        target_id: 6
    },
    {
        id: 8,
        type: 'comment',
        content: '刘小华 在 Vue3 组件开发实战 任务中提出了问题',
        time: '2024-02-01 15:45:00',
        user: '刘小华',
        user_id: 2005,
        target_type: 'task',
        target_id: 2
    }
]

export const mockLearningProgress = {
    overall: 78,
    totalHours: 156,
    weeklyHours: 12,
    monthlyHours: 48,
    skillPoints: 2850,
    level: 'Intermediate',
    nextLevelPoints: 3000,
    strengths: ['JavaScript', 'Vue.js', 'CSS'],
    improvements: ['Node.js', 'Webpack', 'Testing'],
    weeklyProgress: [
        { date: '2024-01-29', hours: 2 },
        { date: '2024-01-30', hours: 3 },
        { date: '2024-01-31', hours: 1 },
        { date: '2024-02-01', hours: 2 },
        { date: '2024-02-02', hours: 2 },
        { date: '2024-02-03', hours: 2 },
        { date: '2024-02-04', hours: 0 }
    ]
}

// 多个学习小组数据（用于小组列表页面）
export const mockGroupList = [
    {
        ...mockGroupData,
        group_id: 1,
        group_name: 'JavaScript 进阶学习小组'
    },
    {
        group_id: 2,
        group_name: 'Python 数据分析小组',
        group_type: 'study',
        description: '专注于Python在数据分析、机器学习领域的应用学习。',
        teacher_name: '李老师',
        teacher_avatar: '/src/assets/ChenMinJie.jpg',
        student_count: 12,
        create_time: '2024-01-10',
        status: 'active'
    },
    {
        group_id: 3,
        group_name: 'React 实战项目组',
        group_type: 'project',
        description: '通过实际项目学习React生态系统，包括Redux、Router等。',
        teacher_name: '王老师',
        teacher_avatar: '/src/assets/LuMengXuan.jpg',
        student_count: 6,
        create_time: '2024-01-20',
        status: 'active'
    }
]

// Mock API 响应函数
export const mockApiResponses = {
    // 获取小组详情
    getGroupDetail: (groupId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: '获取成功',
                    data: { ...mockGroupData, group_id: groupId }
                })
            }, 300)
        })
    },

    // 获取小组任务列表
    getGroupTasks: (groupId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: '获取成功',
                    data: mockTasks
                })
            }, 200)
        })
    },

    // 获取小组活动记录
    getGroupActivities: (groupId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: '获取成功',
                    data: mockActivities
                })
            }, 150)
        })
    },

    // 获取学习进度
    getLearningProgress: (groupId, userId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: '获取成功',
                    data: mockLearningProgress
                })
            }, 250)
        })
    },

    // 获取小组列表
    getGroupList: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: '获取成功',
                    data: mockGroupList
                })
            }, 400)
        })
    }
}

export default {
    mockGroupData,
    mockTasks,
    mockActivities,
    mockLearningProgress,
    mockGroupList,
    mockApiResponses
}
