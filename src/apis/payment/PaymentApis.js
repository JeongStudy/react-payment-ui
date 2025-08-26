// src/apis/payment/PaymentApis.js
import apiClient from "../Axios";

export const baseUrl = "http://localhost:8080/api";

export const PaymentApis = {
    createPayment: async (payload, token) => {
        try {
            const response = await apiClient.post("payments/requests", payload, {
                baseURL: baseUrl
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    getPaymentStatus: async (paymentId) => {
        try {
            const response = await apiClient.get(`payments/requests/status/${paymentId}`, {
                baseURL: baseUrl
            });
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default PaymentApis;