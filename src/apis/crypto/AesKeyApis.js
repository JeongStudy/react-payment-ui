import apiClient from "../Axios";

export const baseUrl = "http://localhost:8080/api";

export const getAesKey = async () => {
    try {
        const response = await apiClient.post('payment/crypto/aes', {
            baseURL: baseUrl
        });
        return response;
    } catch (error) {
        throw error;
    }
};
