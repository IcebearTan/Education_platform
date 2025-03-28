import { createRouter, createWebHistory } from 'vue-router';

import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'

import UserManage from './components/UserManage.vue'
import UserAttendence from './components/UserAttendence.vue'
import ArticleManage from './components/ArticleManage.vue'
import ArticleCreate from './components/ArticleCreate.vue'
import EditorView from './views/EditorView.vue';
import CreateView from './views/CreateView.vue';

import EditorComponent from './components/EditorComponent.vue';
import EditorCreateComponent from './components/EditorCreateComponent.vue';





const router = createRouter({
    history: createWebHistory("/admin/"),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            children: [
                {
                    path: '/user-manage/users',
                    name: 'user_manage_users',
                    component: UserManage
                },
                {
                    path: '/user-manage/attendence',
                    name: 'user_manage_attendence',
                    component: UserAttendence
                },
                {
                    path: '',
                    name: 'home_default',
                    component: ArticleManage
                },
                {
                    path: '/article/manage',
                    name: 'article_manage',
                    component: ArticleManage
                },
                {
                    path: '/article/create',
                    name: 'article_create',
                    component: ArticleCreate
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
            path: '/editor',
            name: 'editor',
            component: EditorView,
        },
        {
            path: '/public',
            name: 'public',
            component: CreateView,
        }
    ]
})

export default router
