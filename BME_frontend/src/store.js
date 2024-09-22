import Vuex from 'vuex';
import VuexPersist from 'vuex-persistedstate';

export default new Vuex.Store({
    state: {
        user: null,
    },
    mutations: {

    },
    actions: {

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