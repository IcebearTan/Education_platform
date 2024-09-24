import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import UserindexComponent from './views/UserIndex.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
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
            component: UserindexComponent
        },
    ]
})

export default router
