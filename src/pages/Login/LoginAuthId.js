import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginAuthId.module.css";
import CustomAlert from "../../components/Alert/CustomAlert";
import { loginUser } from "../../apis/login/LoginApis";
import { getAesKey } from "../../apis/crypto/AesKeyApis";
import { getRsaKey } from "../../apis/crypto/RsaKeyApis";
import { aesEncrypt, rsaEncrypt } from "../../utils/Cipher";
import JoinLoading from "../../components/Join/JoinLoading";

const LoginAuthId = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 로그인 요청
    const handleLogin = async (e) => {
        e.preventDefault();
        // 간단 유효성 검사
        if (!formData.email || !formData.password) {
            setAlertMessage("이메일과 비밀번호를 입력하세요.");
            setShowAlert(true);
            return;
        }

        setLoading(true);

        try {
            // 1. AES 키 발급
            const aesResponse = await getAesKey();
            if (!aesResponse || aesResponse.status !== 201) {
                setAlertMessage(aesResponse?.message || "AES 키 발급에 실패했습니다.");
                setShowAlert(true);
                setLoading(false);
                return;
            }
            const { aesKey } = aesResponse.data.data;

            // 2. RSA 키 발급
            const rsaResponse = await getRsaKey();
            if (!rsaResponse || rsaResponse.status !== 201) {
                setAlertMessage(rsaResponse?.message || "RSA 키 발급에 실패했습니다.");
                setShowAlert(true);
                setLoading(false);
                return;
            }
            const { publicKey } = rsaResponse.data.data;

            // 3. 클라이언트 암호화
            const encryptedAesKey = await rsaEncrypt(aesKey, publicKey);
            const encryptedPassword = await aesEncrypt(formData.password, aesKey);

            // 4. 로그인 API 호출
            const payload = {
                email: formData.email,
                encPassword: encryptedPassword,
                encAesKey: encryptedAesKey,
                rsaPublicKey : publicKey,
            };
            const res = await loginUser(payload);

            // 5. 성공시 토큰 저장(예: 쿠키/로컬스토리지 등), 리다이렉트
            // 아래는 예시: 서버가 Authorization 헤더에 토큰 반환시
            // const token = res.headers['authorization'] || res.headers['Authorization'];
            // const token = res.headers.getAuthorization();
            const token = res.headers.get("authorization")|| res.headers.get("Authorization");

            if (token) {
                // 예시: 쿠키에 저장
                document.cookie = `accessToken=${token}; path=/;`;
                // alert("로그인 성공!");
                navigate("/");
            } else {
                setAlertMessage("로그인 성공, 하지만 토큰을 받지 못했습니다.");
                setShowAlert(true);
            }
        } catch (error) {
            setAlertMessage(
                error?.response?.data?.message ||
                error?.message ||
                "로그인 처리 중 오류가 발생했습니다."
            );
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1>아이디 로그인</h1>
            <form onSubmit={handleLogin}>
                <div className={styles.field}>
                    <label>이메일</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                        autoComplete="username"
                    />
                </div>
                <div className={styles.field}>
                    <label>비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={styles.input}
                        autoComplete="current-password"
                    />
                </div>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                >
                    로그인
                </button>
            </form>
            {loading && <JoinLoading text="로그인 중..." />}
            {showAlert && (
                <CustomAlert
                    message={alertMessage}
                    onConfirm={() => setShowAlert(false)}
                />
            )}
        </div>
    );
};

export default LoginAuthId;
