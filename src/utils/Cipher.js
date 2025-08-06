// utils/Cipher.js

// RSA 암호화를 위해 JSEncrypt 라이브러리를 사용할 수 있습니다.
// 만약 별도의 라이브러리 없이 Web Crypto API를 사용하고 싶다면 구현이 달라질 수 있습니다.
import JSEncrypt from "jsencrypt";

/**
 * RSA 암호화 (Java 호환)
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
            resolve(encrypted); // 이미 Base64 인코딩됨
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * AES CBC (PKCS5Padding, IV+암호문 Base64) - Java 서버와 호환
 */
export const aesEncrypt = async (plaintext, aesKeyString) => {
    const encoder = new TextEncoder();
    let keyBytes = encoder.encode(aesKeyString);
    if (keyBytes.length > 16) keyBytes = keyBytes.slice(0, 16);
    if (keyBytes.length < 16) {
        let tmp = new Uint8Array(16);
        tmp.set(keyBytes);
        keyBytes = tmp;
    }
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-CBC" },
        false,
        ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const data = encoder.encode(plaintext);
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        data
    );
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv, 0);
    combined.set(encryptedBytes, iv.length);
    const base64 = btoa(String.fromCharCode(...combined));
    return base64;
};