import apiClient from "../Axios";


export const baseUrl = "http://localhost:8080/api";

/**
 * 아이디 중복 검사 API 호출 함수
 * @param {string} userAuthId - 중복 여부를 체크할 아이디
 * @returns {Promise<object>} - API 응답 데이터
 */
export const checkUserAuthId = async (userAuthId) => {
    try {
        const response = await apiClient.get('/join/check-user-auth-id', {
            params: { userAuthId },
            baseURL: baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


/**
 * 이메일 인증번호 발송 API 호출 함수
 * @param {string} email - 인증번호를 발송할 이메일 주소
 * @returns {Promise<object>} - API 응답 데이터
 */
export const sendEmailVerification = async (email) => {
    try {
        // 쿼리 파라미터로 email 전달 (POST 요청의 경우, body가 없으므로 null 전달)
        const response = await apiClient.post('/join/email/send', null, {
            params: {email},
            baseURL: baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * 이메일 인증번호 검증 API 호출 함수
 * @param {string} email - 검증할 이메일 주소
 * @param {string} code - 사용자가 입력한 인증번호
 * @returns {Promise<object>} - API 응답 데이터
 */
export const verifyEmailCode = async (email, code) => {
    try {
        const response = await apiClient.post('/join/email/verify', null, {
            params: { email, code },
            baseURL : baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * 휴대폰 인증번호 발송 API 호출 함수
 * @param {string} name - 사용자 이름
 * @param {string} phone - 인증번호를 발송할 휴대폰 번호
 * @returns {Promise<object>} - API 응답 데이터
 */
export const sendPhoneVerification = async (name, phone) => {
    try {
        const response = await apiClient.post('/join/phone/send', null, {
            params: { name, phone },
            baseURL: baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * 휴대폰 인증번호 검증 API 호출 함수
 * @param {string} name - 사용자 이름
 * @param {string} phone - 검증할 휴대폰 번호
 * @param {string} code - 사용자가 입력한 인증번호
 * @returns {Promise<object>} - API 응답 데이터
 */
export const verifyPhoneCode = async (name, phone, code) => {
    try {
        const response = await apiClient.post('/join/phone/verify', null, {
            params: { name, phone, code },
            baseURL : baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * 회원가입 API 호출 함수
 * @param {object} payload - 회원가입에 필요한 데이터 (아이디, 암호화된 비밀번호, 암호화된 AES 키, RSA 공개키, 이름, 휴대폰, 이메일)
 * @returns {Promise<object>} - API 응답 데이터
 */
export const registerUser = async (payload) => {
    try {
        const response = await apiClient.post('/join/register', payload, {
            baseURL: baseUrl
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};