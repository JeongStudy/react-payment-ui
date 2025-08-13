import apiClient from "../Axios";

export const baseUrl = "http://localhost:8080/api";

export const getCardList = async (payload) => {
    try {
        const response = await apiClient.get('payment/cards/active', payload, {
            baseURL: baseUrl
        });
        return response;
    } catch (error) {
        throw error;
    }
};