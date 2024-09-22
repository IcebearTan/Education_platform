import axios from 'axios';

const API_URL = 'http://110.41.177.107:8000';
// const API_URL = 'http://localhost:8000';


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: false, // default


});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // 从 localStorage 获取 token
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // 在请求头中添加 token
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
