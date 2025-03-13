import apiClient from "../Axios";


export const baseUrl = "http://localhost:8080/api";

export const getRsaKey = async (userAuthId) => {
    try {
        const response = await apiClient.get('/rsa-key/generate', {
            params: { userAuthId },
            baseURL: baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


