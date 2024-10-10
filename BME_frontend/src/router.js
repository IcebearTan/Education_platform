import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import UserindexComponent from './components/UserindexComponent.vue';
import HomePage from './components/HomePage.vue';
import ArticleView from './views/ArticleView.vue';
import StudyView from './views/StudyView.vue'

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

        {
            path: '/study',
            name: 'study',
            component: StudyView,
            children: [
                {
                    path: '/study/C-yu-yan-cheng-xu-she-ji/',
                    name: 'study_home',
                    component: HomePage,
                },
                {
                    path: 'user',
                    name: 'study_user',
                    component: UserindexComponent,
                }
            ]
        },
    ]
})

export default router
