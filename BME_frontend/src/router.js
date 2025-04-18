import { createRouter, createWebHistory } from 'vue-router';

import UserindexComponent from './components/user/UserindexComponent.vue';
import AdminindexComponent from "./components/user/AdminindexComponent.vue";

import HomePage from './components/HomePage.vue';
import StudyDetailsComponent from './components/StudyDetailsComponent.vue'
import StudyComponent from './components/StudyComponent.vue'
import ExamListComponent from './components/ExamListComponent.vue'

import HomeView from './views/HomeView.vue'
import LoginView from './views/auth/LoginView.vue'
import RegisterView from './views/auth/RegisterView.vue'
import ArticleView from './views/ArticleView.vue';
import StudyView from './views/StudyView.vue'
import ExamView from './views/ExamView.vue'
import UserIndex from './views/user/UserIndex.vue';
import UserCenter from './views/user/UserCenter.vue';
import UserInfoComponent from './components/UserInfoComponent.vue';

import AboutUsView from './views/AboutUsView.vue'
import FindPasswordView from './views/auth/FindPasswordView.vue'
import MedalWallComponent from './components/medal/MedalWallComponent.vue';

import MedalView from './views/medal/MedalView.vue';
import StudentGroupsComponent from './components/StudentGroup/StudentGroupsComponent.vue';
import StudentGroupsDetails from './components/StudentGroup/StudentGroupsDetails.vue';
import StudentGroupRank from './components/StudentGroup/StudentGroupRank.vue';
import StudentGroupTask from './components/StudentGroup/StudentGroupTask.vue';

const router = createRouter({
    history: createWebHistory(),
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
                {
                    path: '/user-center/my-groups',
                    name: 'my-groups',
                    component: StudentGroupsComponent,
                },
                {
                    path: '/user-center/student-group-details',
                    name: 'student-group-details',
                    component: StudentGroupsDetails,
                    children: [
                        {
                            path: '/user-center/student-group-details',
                            name: 'student-group-details-default',
                            component: StudentGroupRank,
                        },
                        {
                            path: '/user-center/student-group-details/rank',
                            name: 'student-group-details-rank',
                            component: StudentGroupRank,
                        },
                        {
                            path: '/user-center/student-group-details/tasks',
                            name: 'student-group-details-tasks',
                            component: StudentGroupTask,
                        }
                    ]
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
    ]
})

// router.beforeEach((to, from, next) => {
//     // 检测是否为移动设备
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
//     // 如果是移动设备且访问的是桌面首页
//     if (to.path === '/' && isMobile) {
//         next('/mobile')
//     } 
//     // 如果是桌面设备且访问的是移动首页
//     else if (to.path === '/mobile' && !isMobile) {
//         next('/')
//     } 
//     // 其他情况正常跳转
//     else {
//         next()
//     }
// })

export default router

