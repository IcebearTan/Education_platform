import { createRouter, createWebHistory } from 'vue-router';

import HomePage from './components/Home/HomePage.vue';
import StudyDetailsComponent from './components/Course/StudyDetailsComponent.vue'
import StudyComponent from './components/Course/StudyComponent.vue'
import ExamListComponent from './components/ExamListComponent.vue'

import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import ArticleView from './views/ArticleView.vue';
import StudyView from './views/StudyView.vue'
import ExamView from './views/ExamView.vue'
import UserIndex from './views/UserIndex.vue';
import UserCenter from './views/UserCenter.vue';
import UserInfoComponent from './components/User/UserInfoComponent.vue';

import AboutUsView from './views/AboutUsView.vue'
import FindPasswordView from './views/FindPasswordView.vue'
import MedalWallComponent from './components/User/MedalWallComponent.vue';

import MedalView from './views/MedalView.vue';
import NotificationView from './views/NotificationView.vue';
import StudentGroupsComponent from './components/StudentGroup/StudentGroupsComponent.vue';
import StudyGroupDetails from './components/StudentGroup/StudyGroupDetails.vue';
import StudentGroupRank from './components/StudentGroup/StudentGroupRank.vue';
import StudentGroupTask from './components/StudentGroup/StudentGroupTask.vue';
import TaskDetailView from './views/TaskDetailView.vue';
import MyFeedbacksComponent from './components/User/MyFeedbacksComponent.vue';

const router = createRouter({
    history: createWebHistory(),
    scrollBehavior() {
        return { top: 0 }
    },
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            children: [
                {
                    path: '',
                    name: 'home_default',
                    component: HomePage,
                },
            ]
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView
        },
        {
            path: '/user',
            name: 'user',
            component: UserIndex,
        },
        {
            path: '/about',
            name: 'about',
            component: AboutUsView,
        },
        {
            path: '/find_password',
            name: 'find_password',
            component: FindPasswordView,
        },
        {
            path: '/user-center',
            name: 'user-center',
            component: UserCenter,
            children: [
                {
                    path: '/user-center/user-info',
                    name: 'user-info',
                    component: UserInfoComponent,
                },
                // 学习小组：学生视角查看参与的小组
                {
                    path: '/user-center/study-groups',
                    name: 'study-groups',
                    component: StudentGroupsComponent,
                    meta: { role: 'student', title: '学习小组' }
                },
                // 教学管理：导师视角管理小组
                {
                    path: '/user-center/teaching-management',
                    name: 'teaching-management',
                    component: () => import('./components/Teacher/TeachingManagementComponent.vue'),
                    meta: { role: 'teacher', title: '教学管理' }
                },
                {
                    path: '/user-center/my-feedbacks',
                    name: 'my-feedbacks',
                    component: MyFeedbacksComponent,
                },
                // 学习小组详情页面
                {
                    path: '/user-center/study-group/:groupId',
                    name: 'study-group-details',
                    component: StudyGroupDetails,
                    props: route => ({
                        groupId: route.params.groupId,
                        groupName: route.query.group_name,
                        taskId: route.query.taskId,
                        homeworkId: route.query.homeworkId,
                        tab: route.query.tab || 'tasks',  // 默认显示任务页面
                        viewMode: 'student'
                    }),
                    meta: { role: 'student' }
                },
                // 任务详情页面
                {
                    path: '/user-center/study-group/:groupId/task/:taskId',
                    name: 'task-detail',
                    component: TaskDetailView,
                    props: route => ({
                        groupId: parseInt(route.params.groupId),
                        taskId: parseInt(route.params.taskId),
                        userRole: route.query.role || 'student'
                    }),
                    meta: { title: '任务详情' }
                },
                // 教学管理详情页面
                {
                    path: '/user-center/teaching/:groupId',
                    name: 'teaching-group-management',
                    component: () => import('./components/Teacher/TeachingGroupDetails.vue'),
                    props: route => ({
                        groupId: route.params.groupId,
                        groupName: route.query.group_name,
                        taskId: route.query.taskId,
                        homeworkId: route.query.homeworkId,
                        tab: route.query.tab || 'tasks',
                        viewMode: 'teacher'
                    }),
                    meta: { role: 'teacher' }
                },
                // 向后兼容的重定向
                {
                    path: '/user-center/my-groups',
                    name: 'my-groups-redirect',
                    redirect: '/user-center/study-groups'
                },
                {
                    path: '/user-center/teaching-groups',
                    name: 'teaching-groups-redirect',
                    redirect: '/user-center/teaching-management'
                },
                // 保持向后兼容的旧路由
                {
                    path: '/user-center/student-group-details',
                    name: 'student-group-details-legacy',
                    redirect: to => {
                        return {
                            name: 'study-group-details',
                            params: { groupId: to.query.group_id },
                            query: {
                                group_name: to.query.group_name,
                                taskId: to.query.taskId,
                                homeworkId: to.query.homeworkId
                            }
                        }
                    }
                }
            ]
        },
        {
            path: '/article',
            name: 'article',
            component: ArticleView
        },

        {
            path: '/study',
            name: 'study',
            component: StudyView,
            children: [
                {
                    path: '/study/details',
                    name: 'study_details',
                    component: StudyDetailsComponent,
                },
                {
                    path: '',
                    name: 'study_default',
                    component: StudyComponent,
                }
            ]
        },
        {
            path: '/exam',
            name: 'exam',
            component: ExamView,
            children: [
                {
                    path: '/exam/details',
                    name: 'exam/details',
                    component: ExamListComponent,
                },
                {
                    path: '',
                    name: 'exma_list',
                    component: ExamListComponent,
                }
            ]
        },
        {
            path: '/order',
            name: 'order',
            component: StudyDetailsComponent,
        },
        {
            path: '/discuss',
            name: 'discuss',
            component: StudyDetailsComponent,
        },
        {
            path: '/medal',
            name: 'medal',
            component: MedalView,
            children: [
                {
                    path: '/medal/user-medal',
                    name: 'medal-wall',
                    component: MedalWallComponent,
                }
            ]
        },
        {
            path: '/notifications',
            name: 'notifications',
            component: NotificationView,
        },
    ]
})

export default router
