// src/utils/token.js
import Cookies from "js-cookie";

// 토큰 저장
export const setToken = (token) => {
    // "Bearer ..."로 올 때도 있으니 처리
    // if (token?.startsWith("Bearer ")) token = token.slice(7);
    Cookies.set("accessToken", token, { path: "/", secure: true, sameSite: "strict" });
};

export function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

export const getToken = () => Cookies.get("accessToken");
export const removeToken = () => Cookies.remove("accessToken");