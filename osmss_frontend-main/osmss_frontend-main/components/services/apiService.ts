import axios from 'axios';
import { error } from 'console';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiService =  axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

apiService.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        const {response} = error;
        if(response.status === 401){
            localStorage.removeItem('token');
        }
        throw error;
    }
);

export default apiService;