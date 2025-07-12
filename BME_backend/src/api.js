import axios from 'axios';

// const API_URL = 'http://110.41.177.107:8000';
// const API_URL = 'http://139.159.157.5:5000';
const API_URL = 'http://172.25.56.83:5173';
const LocalAPI_URL = 'http://localhost:5000';


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: false, 


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
