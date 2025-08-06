// api.js
import axios from 'axios';
import {getToken} from '../utils/token'

// axios 인스턴스 생성 (공통 baseURL, 타임아웃, 헤더 등 설정)
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // API 기본 경로
    timeout: 10000,  // 타임아웃 10초 (필요에 따라 조정)
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 (선택사항: 요청 전 공통 작업을 수행할 때 사용)
apiClient.interceptors.request.use(
    (config) => {
        // 예: 토큰 추가, 로깅 등
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (선택사항: 응답 후 공통 에러 처리 등)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 예: 에러 로깅, 공통 에러 메시지 처리
        return Promise.reject(error);
    }
);


export default apiClient;
