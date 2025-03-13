// utils/Cipher.js

// RSA 암호화를 위해 JSEncrypt 라이브러리를 사용할 수 있습니다.
// 만약 별도의 라이브러리 없이 Web Crypto API를 사용하고 싶다면 구현이 달라질 수 있습니다.
import JSEncrypt from "jsencrypt";

/**
 * RSA 암호화 함수
 * @param {string} plaintext - 암호화할 문자열 (예: AES 랜덤키)
 * @param {string} publicKey - RSA 공개키 (Base64 인코딩된 PEM 형식 문자열이어야 함)
 * @returns {Promise<string>} - 암호화된 문자열 (Base64 인코딩)
 */
export const rsaEncrypt = async (plaintext, publicKey) => {
    return new Promise((resolve, reject) => {
        try {
            const jsEncrypt = new JSEncrypt();
            jsEncrypt.setPublicKey(publicKey);
            const encrypted = jsEncrypt.encrypt(plaintext);
            if (!encrypted) {
                return reject("RSA 암호화 실패");
            }
            resolve(encrypted);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * AES256 암호화 함수 (AES-CBC 모드 사용, IV는 암호문과 함께 반환)
 * @param {string} plaintext - 암호화할 평문
 * @param {string} aesKeyString - AES 랜덤키 (Base64 인코딩된 문자열)
 * @returns {Promise<string>} - "IV:ciphertext" 형식의 암호문 (각각 Base64 인코딩)
 */
export const aesEncrypt = async (plaintext, aesKeyString) => {
    // Base64 디코딩하여 키 버퍼 생성
    const keyData = Uint8Array.from(atob(aesKeyString), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-CBC" },
        false,
        ["encrypt"]
    );
    // IV 생성 (16바이트)
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    // AES-CBC 암호화 수행
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        data
    );
    // 결과를 Base64로 인코딩 (IV와 암호문을 ':'로 구분하여 반환)
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const ciphertext = new Uint8Array(encryptedBuffer);
    const ciphertextBase64 = btoa(String.fromCharCode(...ciphertext));
    return `${ivBase64}:${ciphertextBase64}`;
};