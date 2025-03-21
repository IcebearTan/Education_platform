import Vuex from 'vuex';
import VuexPersist from 'vuex-persistedstate';
import { useRouter } from 'vue-router';


export default new Vuex.Store({
    state: {
        user: null,
        token: localStorage.getItem('token') || null,
        isLogin: false,
        avatar: null,
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },
        clearToken(state) {
            state.token = null;
        },
        setUser(state, user) {
            state.user = user
        },
        clearUser(state) {
            state.user = null
        },
        setAvatar(state, avatar) {
            state.avatar = avatar
        },
        clearAvatar(state) {
            state.avatar = null
        }

    },
    actions: {
        async login({ commit }, credentials) {
            try {
                const response = await api.post('/login', credentials);
                const token = response.data.token; // 假设 token 在响应中
                commit('setToken', token);
            } catch (error) {
                console.error('Login failed:', error);
            }
        },
        setUser({ commit }, user, avatar) {
            commit('setUser', user)
            commit('setAvatar', avatar)
        },
        logout({ commit }) {
            commit('clearUser');
            commit('clearAvatar');
        },

    },
    getters: {
        isLogin: (state) => !!state.token,
    },
    plugins: [
        VuexPersist({
            key: 'my-app',  // 本地存储的键名
            storage: window.localStorage,  // 使用 localStorage，也可以使用 sessionStorage
        })
    ]
});