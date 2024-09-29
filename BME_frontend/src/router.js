import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import UserindexComponent from './components/UserindexComponent.vue';
import HomePage from './components/HomePage.vue';
import ArticleView from './views/ArticleView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            children: [
                {
                    path: 'user',
                    name: 'user',
                    component: UserindexComponent,
                },
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
            path: '/article',
            name: 'article',
            component: ArticleView
        },
    ]
})

export default router
