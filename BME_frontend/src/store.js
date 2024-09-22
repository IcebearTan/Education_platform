import Vuex from 'vuex';
import VuexPersist from 'vuex-persistedstate';

export default new Vuex.Store({
    state: {
        user: null,
        token: localStorage.getItem('token') || null,
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },
        clearToken(state) {
            state.token = null;
        },
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
    },
    getters: {

    },
    plugins: [
        VuexPersist({
            key: 'my-app',  // 本地存储的键名
            storage: window.localStorage,  // 使用 localStorage，也可以使用 sessionStorage
        })
    ]
});