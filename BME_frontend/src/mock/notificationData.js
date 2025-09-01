// 通知消息Mock数据
import { mockConfig } from './config.js'

// 生成Mock通知数据
export const mockNotifications = {
    // 任务发布通知
    task: [
        {
            id: 'task_001',
            title: '新任务：完成Vue.js项目开发',
            content: '请在本周内完成Vue.js项目的前端开发工作，包括用户界面设计和基本功能实现。',
            source_type: '2', // 任务发布
            related_info_id: 'task_001',
            group_id: '1',
            task_id: 'task_001',
            group_name: 'BME生物医学工程创新小组',
            is_read: false,
            is_important: true,
            create_time: '2025-08-29T10:30:00Z',
            sender_name: '张老师',
            priority: 'high'
        },
        {
            id: 'task_002',
            title: '任务提醒：数据结构作业截止时间临近',
            content: '数据结构课程作业将在明天截止，请尚未提交的同学抓紧时间完成。',
            source_type: '2',
            related_info_id: 'task_002',
            group_id: '2',
            task_id: 'task_002',
            group_name: '算法与数据结构研讨组',
            is_read: false,
            is_important: false,
            create_time: '2025-08-29T14:15:00Z',
            sender_name: '李教授',
            priority: 'medium'
        },
        {
            id: 'task_003',
            title: '项目任务：团队协作开发',
            content: '请各小组成员按照分工完成各自负责的模块，注意代码规范和接口协调。',
            source_type: '2',
            related_info_id: 'task_003',
            group_id: '3',
            task_id: 'task_003',
            group_name: '机器学习实践团队',
            is_read: true,
            is_important: false,
            create_time: '2025-08-28T16:45:00Z',
            sender_name: '王导师',
            priority: 'high'
        }
    ],

    // 作业批改通知
    homework: [
        {
            id: 'homework_001',
            title: '作业批改完成：JavaScript基础练习',
            content: '您提交的JavaScript基础练习已完成批改，成绩为85分，请查看详细反馈。',
            source_type: '1', // 作业批改
            related_info_id: 'homework_001',
            group_id: '1',
            task_id: 'task_001',
            group_name: 'BME生物医学工程创新小组',
            is_read: false,
            is_important: false,
            create_time: '2025-08-29T09:20:00Z',
            sender_name: '张老师',
            score: 85,
            feedback: '代码逻辑清晰，但需要注意变量命名规范'
        },
        {
            id: 'homework_002',
            title: '作业反馈：算法设计题目',
            content: '您的算法设计作业已批改完成，请注意时间复杂度的优化。',
            source_type: '1',
            related_info_id: 'homework_002',
            group_id: '2',
            task_id: 'task_002',
            group_name: '算法与数据结构研讨组',
            is_read: true,
            is_important: false,
            create_time: '2025-08-28T11:30:00Z',
            sender_name: '李教授',
            score: 78,
            feedback: '算法思路正确，但实现效率有待提升'
        }
    ],

    // 请假反馈通知
    leave: [
        {
            id: 'leave_001',
            title: '请假申请审批结果',
            content: '您提交的病假申请已通过审批，请注意休息并及时补课。',
            source_type: '8', // 请假反馈
            related_info_id: 'leave_001',
            group_id: '1',
            group_name: 'BME生物医学工程创新小组',
            is_read: false,
            is_important: false,
            create_time: '2025-08-29T08:15:00Z',
            sender_name: '张老师',
            leave_type: '病假',
            leave_status: 'approved',
            leave_days: 2
        },
        {
            id: 'leave_002',
            title: '请假申请需要补充材料',
            content: '您的事假申请需要补充相关证明材料，请及时提供。',
            source_type: '8',
            related_info_id: 'leave_002',
            group_id: '2',
            group_name: '算法与数据结构研讨组',
            is_read: true,
            is_important: true,
            create_time: '2025-08-28T15:20:00Z',
            sender_name: '李教授',
            leave_type: '事假',
            leave_status: 'pending',
            leave_days: 1
        }
    ],

    // 系统通知
    system: [
        {
            id: 'system_001',
            title: '系统维护通知',
            content: '系统将于本周六凌晨2:00-4:00进行维护升级，期间可能无法正常访问。',
            source_type: '9', // 系统通知
            related_info_id: 'system_001',
            is_read: false,
            is_important: true,
            create_time: '2025-08-29T12:00:00Z',
            sender_name: '系统管理员'
        },
        {
            id: 'system_002',
            title: '新功能上线通知',
            content: '学习进度统计功能已上线，您可以在个人中心查看详细的学习数据分析。',
            source_type: '9',
            related_info_id: 'system_002',
            is_read: true,
            is_important: false,
            create_time: '2025-08-27T10:00:00Z',
            sender_name: '系统管理员'
        }
    ],

    // 小组管理 - 作业提交通知
    'homework-submission': [
        {
            id: 'homework_submit_001',
            title: '学生提交作业：JavaScript基础练习',
            content: '学生张三已提交"JavaScript基础练习"作业，请及时批阅。提交时间：2025-08-29 14:30',
            source_type: '10', // 小组管理
            related_info_id: 'homework_submit_001',
            group_id: '1',
            group_name: 'BME生物医学工程创新小组',
            student_id: 'stu_001',
            student_name: '张三',
            task_id: 'task_001',
            task_name: 'JavaScript基础练习',
            is_read: false,
            is_important: true,
            create_time: '2025-08-29T14:30:00Z',
            submission_type: 'homework'
        },
        {
            id: 'homework_submit_002',
            title: '学生提交作业：算法设计题目',
            content: '学生李四已提交"算法设计题目"作业，请查看并给出评分建议。',
            source_type: '10',
            related_info_id: 'homework_submit_002',
            group_id: '2',
            group_name: '算法与数据结构研讨组',
            student_id: 'stu_002',
            student_name: '李四',
            task_id: 'task_002',
            task_name: '算法设计题目',
            is_read: false,
            is_important: false,
            create_time: '2025-08-29T13:15:00Z',
            submission_type: 'homework'
        },
        {
            id: 'homework_submit_003',
            title: '学生补交作业：数据结构实验',
            content: '学生王五已补交"数据结构实验"作业，之前因病假延期。',
            source_type: '10',
            related_info_id: 'homework_submit_003',
            group_id: '2',
            group_name: '算法与数据结构研讨组',
            student_id: 'stu_003',
            student_name: '王五',
            task_id: 'task_004',
            task_name: '数据结构实验',
            is_read: true,
            is_important: false,
            create_time: '2025-08-28T20:45:00Z',
            submission_type: 'homework'
        }
    ],

    // 小组管理 - 请假申请通知
    'leave-application': [
        {
            id: 'leave_apply_001',
            title: '学生请假申请：病假',
            content: '学生赵六申请病假3天（8月30日-9月1日），原因：发烧需要休息治疗。已提供医院证明。',
            source_type: '10',
            related_info_id: 'leave_apply_001',
            group_id: '1',
            group_name: 'BME生物医学工程创新小组',
            student_id: 'stu_004',
            student_name: '赵六',
            leave_type: '病假',
            leave_reason: '发烧需要休息治疗',
            leave_start: '2025-08-30',
            leave_end: '2025-09-01',
            leave_days: 3,
            leave_status: 'pending',
            is_read: false,
            is_important: true,
            create_time: '2025-08-29T16:20:00Z',
            has_certificate: true
        },
        {
            id: 'leave_apply_002',
            title: '学生请假申请：事假',
            content: '学生刘七申请事假1天（9月2日），原因：家庭紧急事务需要处理。',
            source_type: '10',
            related_info_id: 'leave_apply_002',
            group_id: '3',
            group_name: '机器学习实践团队',
            student_id: 'stu_005',
            student_name: '刘七',
            leave_type: '事假',
            leave_reason: '家庭紧急事务需要处理',
            leave_start: '2025-09-02',
            leave_end: '2025-09-02',
            leave_days: 1,
            leave_status: 'pending',
            is_read: false,
            is_important: false,
            create_time: '2025-08-29T11:10:00Z',
            has_certificate: false
        },
        {
            id: 'leave_apply_003',
            title: '学生销假通知',
            content: '学生陈八的病假已结束，今日正常返校上课。病假期间（8月26日-8月28日）。',
            source_type: '10',
            related_info_id: 'leave_apply_003',
            group_id: '1',
            group_name: 'BME生物医学工程创新小组',
            student_id: 'stu_006',
            student_name: '陈八',
            leave_type: '病假',
            leave_reason: '感冒康复',
            leave_start: '2025-08-26',
            leave_end: '2025-08-28',
            leave_days: 3,
            leave_status: 'completed',
            is_read: true,
            is_important: false,
            create_time: '2025-08-29T08:30:00Z',
            has_certificate: true
        }
    ],

    // 小组管理 - 加入申请通知
    'join-application': [
        {
            id: 'join_apply_001',
            title: '学生申请加入小组',
            content: '学生周九申请加入"BME生物医学工程创新小组"，专业：生物医学工程，年级：大三。个人介绍：对生物医学工程有浓厚兴趣，希望能参与创新项目。',
            source_type: '10',
            related_info_id: 'join_apply_001',
            group_id: '1',
            group_name: 'BME生物医学工程创新小组',
            student_id: 'stu_007',
            student_name: '周九',
            student_major: '生物医学工程',
            student_grade: '大三',
            application_reason: '对生物医学工程有浓厚兴趣，希望能参与创新项目',
            application_status: 'pending',
            is_read: false,
            is_important: true,
            create_time: '2025-08-29T15:45:00Z'
        },
        {
            id: 'join_apply_002',
            title: '学生申请加入小组',
            content: '学生吴十申请加入"算法与数据结构研讨组"，专业：计算机科学与技术，年级：大二。有一定的编程基础，希望提升算法能力。',
            source_type: '10',
            related_info_id: 'join_apply_002',
            group_id: '2',
            group_name: '算法与数据结构研讨组',
            student_id: 'stu_008',
            student_name: '吴十',
            student_major: '计算机科学与技术',
            student_grade: '大二',
            application_reason: '有一定的编程基础，希望提升算法能力',
            application_status: 'pending',
            is_read: false,
            is_important: false,
            create_time: '2025-08-29T10:20:00Z'
        },
        {
            id: 'join_apply_003',
            title: '学生加入申请已通过',
            content: '学生郑十一的加入申请已通过，现已成为"机器学习实践团队"的正式成员。',
            source_type: '10',
            related_info_id: 'join_apply_003',
            group_id: '3',
            group_name: '机器学习实践团队',
            student_id: 'stu_009',
            student_name: '郑十一',
            student_major: '人工智能',
            student_grade: '大三',
            application_reason: '对机器学习技术很感兴趣',
            application_status: 'approved',
            is_read: true,
            is_important: false,
            create_time: '2025-08-28T14:15:00Z'
        }
    ]
}

// 计算未读消息数量
export const calculateUnreadCount = (notifications) => {
    let total = 0
    Object.values(notifications).forEach(typeMessages => {
        if (Array.isArray(typeMessages)) {
            total += typeMessages.filter(msg => !msg.is_read).length
        }
    })
    return total
}

// Mock API响应
export const mockNotificationApiResponses = {
    // 获取所有通知
    getAllNotifications: () => {
        return {
            code: 200,
            message: '获取通知列表成功',
            data: {
                notifications: mockNotifications,
                total_unread: calculateUnreadCount(mockNotifications)
            }
        }
    },

    // 标记消息为已读
    markAsRead: (messageId) => {
        // 在实际应用中，这里会更新数据库
        // 在mock中，我们可以模拟更新本地数据
        Object.values(mockNotifications).forEach(typeMessages => {
            if (Array.isArray(typeMessages)) {
                const message = typeMessages.find(msg => msg.id === messageId)
                if (message) {
                    message.is_read = true
                }
            }
        })

        return {
            code: 200,
            message: '标记已读成功',
            data: { success: true }
        }
    },

    // 获取特定类型的通知
    getNotificationsByType: (type) => {
        return {
            code: 200,
            message: `获取${type}类型通知成功`,
            data: mockNotifications[type] || []
        }
    },

    // 获取任务详情
    getTaskDetail: (taskId) => {
        const taskMap = {
            'task_001': {
                id: 'task_001',
                title: '完成Vue.js项目开发',
                description: '请在本周内完成Vue.js项目的前端开发工作',
                group_id: '1',
                group_name: 'BME生物医学工程创新小组',
                deadline: '2025-09-05T23:59:59Z',
                status: 'in_progress'
            },
            'task_002': {
                id: 'task_002',
                title: '数据结构作业',
                description: '完成链表、栈、队列相关习题',
                group_id: '2',
                group_name: '算法与数据结构研讨组',
                deadline: '2025-08-31T23:59:59Z',
                status: 'in_progress'
            },
            'task_003': {
                id: 'task_003',
                title: '团队协作开发',
                description: '按照分工完成各自负责的模块',
                group_id: '3',
                group_name: '机器学习实践团队',
                deadline: '2025-09-10T23:59:59Z',
                status: 'in_progress'
            }
        }

        return {
            code: 200,
            message: '获取任务详情成功',
            data: taskMap[taskId] || null
        }
    },

    // 获取作业详情
    getHomeworkDetail: (homeworkId) => {
        const homeworkMap = {
            'homework_001': {
                id: 'homework_001',
                title: 'JavaScript基础练习',
                task_id: 'task_001',
                group_id: '1',
                group_name: 'BME生物医学工程创新小组',
                score: 85,
                feedback: '代码逻辑清晰，但需要注意变量命名规范',
                submit_time: '2025-08-28T18:30:00Z'
            },
            'homework_002': {
                id: 'homework_002',
                title: '算法设计题目',
                task_id: 'task_002',
                group_id: '2',
                group_name: '算法与数据结构研讨组',
                score: 78,
                feedback: '算法思路正确，但实现效率有待提升',
                submit_time: '2025-08-27T20:15:00Z'
            }
        }

        return {
            code: 200,
            message: '获取作业详情成功',
            data: homeworkMap[homeworkId] || null
        }
    },

    // 获取小组管理详情 - 作业提交
    getHomeworkSubmissionDetail: (submissionId) => {
        const submissionMap = {
            'homework_submit_001': {
                id: 'homework_submit_001',
                group_id: '1',
                group_name: 'BME生物医学工程创新小组',
                student_id: 'stu_001',
                student_name: '张三',
                task_id: 'task_001',
                task_name: 'JavaScript基础练习',
                submission_time: '2025-08-29T14:30:00Z',
                status: 'submitted'
            },
            'homework_submit_002': {
                id: 'homework_submit_002',
                group_id: '2',
                group_name: '算法与数据结构研讨组',
                student_id: 'stu_002',
                student_name: '李四',
                task_id: 'task_002',
                task_name: '算法设计题目',
                submission_time: '2025-08-29T13:15:00Z',
                status: 'submitted'
            },
            'homework_submit_003': {
                id: 'homework_submit_003',
                group_id: '2',
                group_name: '算法与数据结构研讨组',
                student_id: 'stu_003',
                student_name: '王五',
                task_id: 'task_004',
                task_name: '数据结构实验',
                submission_time: '2025-08-28T20:45:00Z',
                status: 'submitted'
            }
        }

        return {
            code: 200,
            message: '获取作业提交详情成功',
            data: submissionMap[submissionId] || null
        }
    },

    // 获取小组管理详情 - 请假申请
    getLeaveApplicationDetail: (leaveId) => {
        const leaveMap = {
            'leave_apply_001': {
                id: 'leave_apply_001',
                group_id: '1',
                group_name: 'BME生物医学工程创新小组',
                student_id: 'stu_004',
                student_name: '赵六',
                leave_type: '病假',
                leave_reason: '发烧需要休息治疗',
                leave_start: '2025-08-30',
                leave_end: '2025-09-01',
                leave_days: 3,
                leave_status: 'pending',
                has_certificate: true,
                apply_time: '2025-08-29T16:20:00Z'
            },
            'leave_apply_002': {
                id: 'leave_apply_002',
                group_id: '3',
                group_name: '机器学习实践团队',
                student_id: 'stu_005',
                student_name: '刘七',
                leave_type: '事假',
                leave_reason: '家庭紧急事务需要处理',
                leave_start: '2025-09-02',
                leave_end: '2025-09-02',
                leave_days: 1,
                leave_status: 'pending',
                has_certificate: false,
                apply_time: '2025-08-29T11:10:00Z'
            },
            'leave_apply_003': {
                id: 'leave_apply_003',
                group_id: '1',
                group_name: 'BME生物医学工程创新小组',
                student_id: 'stu_006',
                student_name: '陈八',
                leave_type: '病假',
                leave_reason: '感冒康复',
                leave_start: '2025-08-26',
                leave_end: '2025-08-28',
                leave_days: 3,
                leave_status: 'completed',
                has_certificate: true,
                apply_time: '2025-08-25T10:30:00Z'
            }
        }

        return {
            code: 200,
            message: '获取请假申请详情成功',
            data: leaveMap[leaveId] || null
        }
    },

    // 获取小组管理详情 - 加入申请
    getJoinApplicationDetail: (joinId) => {
        const joinMap = {
            'join_apply_001': {
                id: 'join_apply_001',
                group_id: '1',
                group_name: 'BME生物医学工程创新小组',
                student_id: 'stu_007',
                student_name: '周九',
                student_major: '生物医学工程',
                student_grade: '大三',
                student_email: 'zhoujiu@example.com',
                student_phone: '13800138007',
                application_reason: '对生物医学工程有浓厚兴趣，希望能参与创新项目',
                application_status: 'pending',
                apply_time: '2025-08-29T15:45:00Z'
            },
            'join_apply_002': {
                id: 'join_apply_002',
                group_id: '2',
                group_name: '算法与数据结构研讨组',
                student_id: 'stu_008',
                student_name: '吴十',
                student_major: '计算机科学与技术',
                student_grade: '大二',
                student_email: 'wushi@example.com',
                student_phone: '13800138008',
                application_reason: '有一定的编程基础，希望提升算法能力',
                application_status: 'pending',
                apply_time: '2025-08-29T10:20:00Z'
            },
            'join_apply_003': {
                id: 'join_apply_003',
                group_id: '3',
                group_name: '机器学习实践团队',
                student_id: 'stu_009',
                student_name: '郑十一',
                student_major: '人工智能',
                student_grade: '大三',
                student_email: 'zhengshiyi@example.com',
                student_phone: '13800138009',
                application_reason: '对机器学习技术很感兴趣',
                application_status: 'approved',
                apply_time: '2025-08-28T14:15:00Z'
            }
        }

        return {
            code: 200,
            message: '获取加入申请详情成功',
            data: joinMap[joinId] || null
        }
    }
}

export default mockNotifications
