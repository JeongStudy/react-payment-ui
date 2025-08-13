// src/apis/payment/PaymentApis.js
import apiClient from "../Axios";

export const baseUrl = "http://localhost:8080/api";

export const PaymentApis = {
    createPayment: async (payload, token) => {
        try {
            const response = await apiClient.post(
                "payments/requests", // baseUrl 뒤에 붙음
                payload,
                {
                    baseURL: baseUrl,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default PaymentApis;