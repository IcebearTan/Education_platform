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

export default api;
