import { createRouter, createWebHistory } from 'vue-router';

import UserindexComponent from './components/UserindexComponent.vue';
import AdminindexComponent from "./components/AdminindexComponent.vue";

import HomePage from './components/HomePage.vue';
import StudyDetailsComponent from './components/StudyDetailsComponent.vue'
import StudyComponent from './components/StudyComponent.vue'
import ExamListComponent from './components/ExamListComponent.vue'

import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import ArticleView from './views/ArticleView.vue';
import StudyView from './views/StudyView.vue'
import ExamView from './views/ExamView.vue'
import UserIndex from './views/UserIndex.vue';
import UserCenter from './views/UserCenter.vue';
import UserInfoComponent from './components/UserInfoComponent.vue';

import AboutUsView from './views/AboutUsView.vue'
import FindPasswordView from './views/FindPasswordView.vue'


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
                }
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
    ]
})

export default router
