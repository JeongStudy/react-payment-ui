import apiClient from "../Axios";

export const baseUrl = "http://localhost:8080/api";

export const getRsaKey = async (userAuthId) => {
    try {
        const response = await apiClient.post('payment/crypto/rsa', {
            baseURL: baseUrl
        });
        return response;
    } catch (error) {
        throw error;
    }
};


