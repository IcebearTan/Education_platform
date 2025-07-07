import axios from 'axios';

// const API_URL = 'http://110.41.177.107:8000';
// export const API_URL = 'http://139.159.157.5:5000';
export const API_URL = 'http://172.25.56.83:5173';

// 这个能下 http://139.159.157.5:5000/course/book_download?Down_Code=MU2PIKNPEYGK
// 这个不能下 http://139.159.157.5:5000/coures/book_download?Down_Code=MU2PIKNPEYGK 


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

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // 避免多次弹窗
            if (!window.__hasShownLoginExpire) {
                window.__hasShownLoginExpire = true;
                import('element-plus').then(({ ElMessage }) => {
                    ElMessage.error('登录失效，请重新登录');
                });
                localStorage.removeItem('token');
                // 延迟跳转，保证提示能完整显示
                setTimeout(() => {
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    window.__hasShownLoginExpire = false;
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
