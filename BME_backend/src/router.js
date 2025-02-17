import { createRouter, createWebHistory } from 'vue-router';

import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'

import UserManage from './components/UserManage.vue'
import ArticleManage from './components/ArticleManage.vue'
import ArticleCreate from './components/ArticleCreate.vue'
import EditorView from './views/EditorView.vue';





const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            children: [
                {
                    path: '/user-manage',
                    name: 'user_manage',
                    component: UserManage
                },
                {
                    path: '',
                    name: 'home_default',
                    component: UserManage
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
            component: EditorView

        }
    ]
})

export default router
