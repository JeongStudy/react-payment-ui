import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import styles from "./Join.module.css";
import CustomAlert from "../../components/Alert/CustomAlert";
import {signUpUser} from '../../apis/Join/SignUserApis';
import {getRsaKey} from "../../apis/Join/RsaKeyApis";
import {aesEncrypt, rsaEncrypt} from "../../utils/Cipher";
import JoinLoading from "../../components/Join/JoinLoading";
import {getAesKey} from "../../apis/Join/AesKeyApis";

const Join = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",          // 사용자 이메일(아이디)
        password: "",       // 사용자 비밀번호
        confirmPassword: "",// 사용자 비밀번호 확인
        last_name: "",      // 사용자 성
        first_name: "",     // 사용자 이름
        phone: "",          // 사용자 휴대폰 번호
    });

    const [errors, setErrors] = useState({});
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const [joinLoading, setJoinLoading] = useState(false);
    const [showJoinAlert, setShowJoinAlert] = useState(false);
    const [alertJoinMessage, setAlertJoinMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // 유효성 검증
        if (name === "email") {
            setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        } else if (name === "password") {
            const error = validatePassword(value, formData.email);
            setErrors((prev) => ({ ...prev, password: error }));

            // 비밀번호 확인 체크
            if (formData.confirmPassword && formData.confirmPassword === value && !error) {
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                setIsPasswordValid(true);
            } else if (formData.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
                setIsPasswordValid(false);
            } else {
                setIsPasswordValid(!error);
            }
        } else if (name === "confirmPassword") {
            if (formData.password === value) {
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                setIsPasswordValid(true);
            } else {
                setErrors((prev) => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
                setIsPasswordValid(false);
            }
        } else if (name === "last_name") {
            setErrors((prev) => ({ ...prev, last_name: validateName(value) }));
        } else if (name === "first_name") {
            setErrors((prev) => ({ ...prev, first_name: validateName(value) }));
        } else if (name === "phone") {
            setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
        }
    };

    // 유효성 검사 함수
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "올바른 이메일 형식이 아닙니다.";
        return "";
    };
    const validatePassword = (password, email) => {
        if (password.length < 8 || password.length > 16) return "비밀번호는 8자 이상 16자 이하여야 합니다.";
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);
        const conditionCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
        if (conditionCount < 3) return "비밀번호는 영문 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.";
        if (/(.)\1\1/.test(password)) return "비밀번호에 동일한 문자를 3번 이상 연속해서 사용할 수 없습니다.";
        if (/\s/.test(password)) return "비밀번호에 공백을 사용할 수 없습니다.";
        if (email && password.includes(email.split("@")[0])) return "비밀번호에 아이디(이메일 앞부분)를 포함할 수 없습니다.";
        return "";
    };
    const validateName = (name) => {
        if (name.length < 1 || name.length > 20) return "1~20자 영문 대문자만 입력하세요.";
        const nameRegex = /^[A-Z]+$/;
        if (!nameRegex.test(name)) return "영문 대문자(A~Z)만 입력할 수 있습니다.";
        return "";
    };
    const validatePhone = (phone) => {
        const phoneNum = phone.replace(/-/g, "");
        if (!/^\d{11}$/.test(phoneNum)) return "휴대폰 번호는 11자리 숫자여야 합니다.";
        return "";
    };

    // 회원가입 요청
    const handleSubmit = async () => {
        // 전체 유효성 체크
        if (
            errors.email || !formData.email ||
            errors.password || !formData.password ||
            errors.confirmPassword || !formData.confirmPassword ||
            errors.last_name || !formData.last_name ||
            errors.first_name || !formData.first_name ||
            errors.phone || !formData.phone ||
            !isPasswordValid
        ) {
            setAlertMessage("입력값을 모두 올바르게 입력해주세요.");
            setShowAlert(true);
            return;
        }

        setJoinLoading(true);

        try {
            // 1. AES 키 발급
            const aesResponse = await getAesKey();
            if (!aesResponse || aesResponse.status !== 201) {
                setAlertMessage(aesResponse?.message || "AES 키 발급에 실패했습니다.");
                setShowAlert(true);
                setJoinLoading(false);
                return;
            }
            const { aesKey } = aesResponse.data.data; // 필요 데이터 추출

            // 2. RSA 키 발급
            const rsaResponse = await getRsaKey();
            if (!rsaResponse || rsaResponse.status !== 201) {
                setAlertMessage(rsaResponse?.message || "RSA 키 발급에 실패했습니다.");
                setShowAlert(true);
                setJoinLoading(false);
                return;
            }
            const { publicKey } = rsaResponse.data.data;

            // 2. 클라이언트 암호화
            const encryptedAesKey = await rsaEncrypt(aesKey, publicKey);
            const encryptedPassword = await aesEncrypt(formData.password, aesKey);

            console.log(formData);
            // 3. 회원가입 API 호출
            const payload = {
                email: formData.email,
                encPassword: encryptedPassword,
                encAesKey: encryptedAesKey,
                publicKey,
                lastName: formData.last_name,
                firstName: formData.first_name,
                phoneNumber: formData.phone,
            };
            const data = await signUpUser(payload);

            if (data.status === 201) {
                setAlertJoinMessage(data.data.message); // 서버 메시지 그대로 사용
                setShowJoinAlert(true);
            } else {
                setAlertMessage(data.message || "회원가입에 실패했습니다.");
                setShowAlert(true);
            }
        } catch (error) {
            // error.response?.data?.message 우선, 없으면 fallback 메시지
            setAlertMessage(
                error?.response?.data?.message ||
                error?.message ||
                "회원가입 처리 중 오류가 발생했습니다."
            );
            setShowAlert(true);
        } finally {
            setJoinLoading(false);
        }
    };

    const handleRedirectUrl = () => {
        navigate("/auth");
    };

    return (
        <div className={styles.container}>
            <h1>회원가입</h1>

            <div className={styles.field}>
                <label>이메일(아이디)</label>
                <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.field}>
                <label>비밀번호</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.password && (
                    <span className={errors.password === "" ? styles.success : styles.error}>
                        {errors.password === "" ? "사용 가능한 비밀번호입니다." : errors.password}
                    </span>
                )}
            </div>

            <div className={styles.field}>
                <label>비밀번호 확인</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.confirmPassword && (
                    <span className={errors.confirmPassword === "" ? styles.success : styles.error}>
                        {errors.confirmPassword === "" ? "비밀번호와 일치합니다." : errors.confirmPassword}
                    </span>
                )}
            </div>

            <div className={styles.field}>
                <label>성(last name)</label>
                <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.last_name && <span className={styles.error}>{errors.last_name}</span>}
            </div>

            <div className={styles.field}>
                <label>이름(first name)</label>
                <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.first_name && <span className={styles.error}>{errors.first_name}</span>}
            </div>

            <div className={styles.field}>
                <label>휴대폰 번호</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
            </div>

            <button
                onClick={handleSubmit}
                disabled={
                    !formData.email ||
                    !formData.password ||
                    !formData.confirmPassword ||
                    !formData.last_name ||
                    !formData.first_name ||
                    !formData.phone ||
                    !!errors.email ||
                    !!errors.password ||
                    !!errors.confirmPassword ||
                    !!errors.last_name ||
                    !!errors.first_name ||
                    !!errors.phone ||
                    !isPasswordValid
                }
                className={`${styles.submitButton} ${
                    formData.email &&
                    formData.password &&
                    formData.confirmPassword &&
                    formData.last_name &&
                    formData.first_name &&
                    formData.phone &&
                    !errors.email &&
                    !errors.password &&
                    !errors.confirmPassword &&
                    !errors.last_name &&
                    !errors.first_name &&
                    !errors.phone &&
                    isPasswordValid
                        ? styles.active
                        : ""
                }`}
            >
                회원가입
            </button>

            {joinLoading && <JoinLoading text="회원가입 중..." />}
            {showJoinAlert && (
                <CustomAlert
                    message={alertJoinMessage}
                    onConfirm={handleRedirectUrl}
                    confirmButtonMessage={"로그인으로 이동하기"}
                />
            )}
            {showAlert && (
                <CustomAlert
                    message={alertMessage}
                    onConfirm={() => setShowAlert(false)}
                />
            )}
        </div>
    );
};

export default Join;
