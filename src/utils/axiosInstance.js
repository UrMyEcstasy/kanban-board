import axios from 'axios'
import { BASE_URL } from '@/constants';

// базовая настройка axios
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000
});

// перехватывает запросы перед отправкой
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['X-Base-Auth'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// перехватывает ответ
api.interceptors.response.use(
    (response) => {
        try {
            const { data } = response
            return { data }
        } catch (err) {
            console.error(err)
            return { err }
        }
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api
