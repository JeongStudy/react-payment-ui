import apiClient from "../Axios";


export const baseUrl = "http://localhost:8080/api";

export const signUpUser = async (payload) => {
    try {
        const response = await apiClient.post('auth/signup', payload, {
            baseURL: baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};