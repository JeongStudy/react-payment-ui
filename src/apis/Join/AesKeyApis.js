import apiClient from "../Axios";


export const baseUrl = "http://localhost:8080/api";

export const getAesKey = async () => {
    try {
        const response = await apiClient.get('payment/crypto/aes', {
            baseURL: baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
