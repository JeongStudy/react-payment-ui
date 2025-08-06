// src/apis/LoginApis.js
import apiClient from "../Axios";
import { setToken } from "../../utils/token";

export const loginUser = async (payload) => {
    try {
        const response = await apiClient.post('auth/login', payload);
        // 토큰을 응답 헤더에서 꺼내서 쿠키에 저장
        const authHeader = response.headers['authorization'];
        if (authHeader) {
            setToken(authHeader);
        }
        return response;
    } catch (error) {
        throw error;
    }
};