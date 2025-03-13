import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import styles from "./Join.module.css";
import CustomAlert from "../../components/Alert/CustomAlert"; // 커스텀 얼럿 컴포넌트
import {
    checkUserAuthId,
    registerUser,
    sendEmailVerification,
    sendPhoneVerification,
    verifyEmailCode,
    verifyPhoneCode
} from '../../apis/Join/JoinApis';
import {formatTime} from '../../utils/Formatter';
import {getRsaKey} from "../../apis/Join/RsaKeyApis";
import {aesEncrypt, rsaEncrypt} from "../../utils/Cipher";
import JoinLoading from "../../components/Join/JoinLoading";

// 전역 변수로 타이머 시간 설정
const TIMER_DURATION = 180; // 3분 (180초)

// 이메일 인증 타이머 시간 (10분 = 600초)
const EMAIL_TIMER_DURATION = 600;

const Join = () => {
    const usernameInputRef = useRef(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "", // 사용자 아이디
        password: "", // 사용자 비밀번호
        confirmPassword: "", // 사용자 비밀번호 확인
        name: "", // 사용자 이름
        phone: "", // 사용자 휴대폰 번호
        email: "", // 사용자 이메일
    });

    // 🌟 오류 및 상태 관리
    const [errors, setErrors] = useState({}); // 입력값 검증 및 오류 메시지 저장
    const [showAlert, setShowAlert] = useState(false); // 알림(팝업) 표시 여부
    const [alertMessage, setAlertMessage] = useState(""); // 알림(팝업) 메시지

    // 🌟 아이디 관련 상태
    const [isUsernameValid, setIsUsernameValid] = useState(false); // 아이디 유효성 검사 결과
    const [isCheckingUsername, setIsCheckingUsername] = useState(false); // 아이디 중복 검사 진행 여부
    const [isUsernameChecked, setIsUsernameChecked] = useState(false); // 아이디 중복 검사 완료 여부

    // 비밀번호 관련 상태
    const [isPasswordValid, setIsPasswordValid] = useState(false); // 비밀번호 규칙 및 일치 여부 상태

    // 이름 관련 상태

    // 🌟 휴대폰 인증 관련 상태
    const [isPhoneVerified, setIsPhoneVerified] = useState(false); // 휴대폰 인증 완료 여부
    const [isPhoneComplete, setIsPhoneComplete] = useState(false); // 휴대폰 번호 입력 완료 여부
    const [isCheckingPhone, setIsCheckingPhone] = useState(false); // // 휴대폰 인증 SMS 전송 중 여부
    const [isPhoneDisabled, setIsPhoneDisabled] = useState(false); // 휴대폰 입력칸 비활성화 여부
    const [isPhoneResendVisible, setIsPhoneResendVisible] = useState(false); // 인증 실패 후 재시도 버튼 표시 여부
    const [phoneFailCount, setPhoneFailCount] = useState(0); // 휴대폰 인증 실패 횟수
    const [phoneTimer, setPhoneTimer] = useState(0); // 휴대폰 인증 타이머 (초 단위)
    const [phoneAuthCode, setPhoneAuthCode] = useState(""); // 사용자가 입력한 인증번호

    // 🌟 이메일 인증 관련 상태
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 여부
    const [isEmailComplete, setIsEmailComplete] = useState(false); // 이메일 형식이 유효한지 여부
    const [isCheckingEmail, setIsCheckingEmail] = useState(false); // 이메일 인증 발송 진행 여부
    const [isEmailCodeSent, setIsEmailCodeSent] = useState(false); // 이메일 인증번호 발송 여부
    const [emailFailCount, setEmailFailCount] = useState(0); // 이메일 인증 실패 횟수
    const [emailTimer, setEmailTimer] = useState(0); // 이메일 인증 타이머 (초 단위)
    const [emailAuthCode, setEmailAuthCode] = useState(""); // 사용자가 입력한 이메일 인증번호

    // 회원가입 관련 상태
    const [joinLoading, setJoinLoading] = useState(false);
    const [showJoinAlert, setShowJoinAlert] = useState(false); // 알림(팝업) 표시 여부
    const [alertJoinMessage, setAlertJoinMessage] = useState(""); // 알림(팝업) 메시지

    // region 입력값 변경
    // 입력값 변경(아이디, 비밀번호, 비밀번호 확인, 이름)
    const handleChange = (e) => {
        const {name, value} = e.target;

        if (name === "username") {
            setFormData((prev) => ({...prev, username: value}));
            setIsUsernameChecked(false);

            // 빈 값일 경우 에러 초기화
            if (value.trim() === "") {
                setErrors((prev) => ({...prev, username: ""}));
                setIsUsernameValid(false);
                setIsCheckingUsername(false);
                return; // 나머지 로직 건너뜀
            }

            // 유효성 검사 및 메시지 추가
            const validationError = validateUsername(value);
            if (validationError) {
                setErrors((prev) => ({...prev, username: validationError}));
                setIsUsernameValid(false);
            } else {
                setErrors((prev) => ({...prev, username: ""}));
                setIsUsernameValid(false); // 유효성 검사 통과해도 중복검사를 대기
            }

        } else if (name === "password") {
            setFormData((prev) => ({...prev, password: value}));

            // 입력이 없는 경우 에러 메시지 초기화
            if (value.trim() === "") {
                setErrors((prev) => ({...prev, password: ""}));
                return;
            }

            // 비밀번호 유효성 검사
            const error = validatePassword(value, formData.username);

            if (error) {
                setErrors((prev) => ({...prev, password: error}));
            } else {
                setErrors((prev) => ({...prev, password: "사용 가능한 비밀번호입니다."}));

                // 비밀번호 확인 값과 일치하는지 추가 체크
                if (formData.confirmPassword && formData.confirmPassword === value) {
                    setErrors((prev) => ({...prev, confirmPassword: "비밀번호와 일치합니다."}));
                    setIsPasswordValid(true);
                } else {
                    // 아직 일치하지 않으면 false 처리
                    setErrors((prev) => ({...prev, confirmPassword: "비밀번호가 일치하지 않습니다."}));
                    setIsPasswordValid(false);
                }
            }

        } else if (name === "confirmPassword") {
            setFormData((prev) => ({...prev, confirmPassword: value}));

            // 입력이 없는 경우 에러 메시지 초기화
            if (value.trim() === "") {
                setErrors((prev) => ({...prev, confirmPassword: ""}));
                return;
            }

            // 비밀번호 확인 유효성 검사
            if (formData.password === value) {
                setErrors((prev) => ({...prev, confirmPassword: "비밀번호와 일치합니다."}));
                if (!validatePassword(formData.password, formData.username)) {
                    setIsPasswordValid(true);
                } else {
                    setIsPasswordValid(false);
                }
            } else {
                setErrors((prev) => ({...prev, confirmPassword: "비밀번호가 일치하지 않습니다."}));
                setIsPasswordValid(false);
            }
        } else if (name === "name") {
            setFormData((prev) => ({...prev, name: value}));

            // 이름 유효성 검사
            if (value.trim() === "") {
                setErrors((prev) => ({...prev, name: ""})); // 빈 값일 경우 에러 초기화
                return;
            }

            const error = validateName(value);
            if (error) {
                setErrors((prev) => ({...prev, name: error}));
            } else {
                setErrors((prev) => ({...prev, name: ""}));
            }
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
            setErrors((prev) => ({...prev, [name]: ""}));
        }
    };

    // 입력값 변경(휴대폰 번호)
    const handlePhoneChange = (e) => {
        let value = e.target.value;

        // 숫자 외 문자 제거
        value = value.replace(/[^0-9]/g, "");

        // '-' 추가 로직
        if (value.length > 3 && value.length <= 7) {
            value = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length > 7) {
            value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        }

        if (value.length > 13) return; // 최대 길이 제한

        setFormData((prev) => ({...prev, phone: value}));

        // 입력값 완료 상태 확인
        setIsPhoneComplete(value.replace(/-/g, "").length === 11);
        setErrors((prev) => ({...prev, phone: ""}));
    };

    // 입력값 변경(이메일)
    const handleEmailChange = (e) => {
        const value = e.target.value;

        setFormData((prev) => ({...prev, email: value}));

        // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 간단한 이메일 형식 검사
        if (value.trim() === "") {
            // 이메일이 비어있으면 상태 초기화
            setErrors((prev) => ({...prev, email: ""}));
            setIsEmailComplete(false);
            setIsEmailVerified(false); // 이메일 인증 상태 초기화
        } else if (!emailRegex.test(value)) {
            setErrors((prev) => ({...prev, email: "올바른 이메일 형식이 아닙니다."}));
            setIsEmailComplete(false);
        } else {
            setErrors((prev) => ({...prev, email: ""}));
            setIsEmailComplete(true);
            setIsEmailVerified(false); // 이메일 인증 상태 초기화
        }
    };
    // endregion

    // region 아이디, 비밀번호 관련
    // 아이디 유효성 검사
    const validateUsername = (username) => {
        const usernameRegex = /^[a-z][a-z0-9]{4,19}$/;
        if (!usernameRegex.test(username)) {
            return "아이디는 5~20자의 영문 소문자와 숫자 조합이며, 영문자로 시작해야 합니다.";
        }

        if (/^[0-9]+$/.test(username)) {
            return "아이디는 숫자로만 구성될 수 없습니다.";
        }
        return ""; // 유효한 경우 에러 메시지 없음
    };

    // 아이디 중복 검사 API
    const checkUsername = async () => {
        // 입력이 없거나, 로컬 유효성 검사를 통과하지 않은 경우 API 호출하지 않음
        if (!formData.username.trim() || validateUsername(formData.username)) return;

        setIsCheckingUsername(true); // 아이디 중복 검사 시작
        setErrors((prev) => ({...prev, username: ""}));

        try {
            // 인위적으로 0.5초 지연
            await new Promise((resolve) => setTimeout(resolve, 500));

            const response = await checkUserAuthId(formData.username);
            // API 응답을 통해 중복 여부를 판단
            if (response.data.duplicate) {
                setErrors((prev) => ({...prev, username: "중복된 아이디입니다."}));
                setIsUsernameValid(false);
                setIsUsernameChecked(false);
                // 입력 필드로 포커스 이동
                if (usernameInputRef.current) {
                    usernameInputRef.current.focus();
                }
            } else {
                setErrors((prev) => ({...prev, username: ""}));
                setIsUsernameValid(true);
                setIsUsernameChecked(true); // 아이디 중복 검사 완료 상태 설정
            }
        } catch (error) {
            // API 호출 실패 시 에러 처리
            setErrors((prev) => ({...prev, username: "아이디 중복 검사 중 오류 발생"}));
            setIsUsernameValid(false);
            setIsUsernameChecked(false);
            // 입력 필드로 포커스 이동
            if (usernameInputRef.current) {
                usernameInputRef.current.focus();
            }
        } finally {
            setIsCheckingUsername(false); // 아이디 중복 검사 종료
        }
    };

    // 비밀번호 유효성 검사
    const validatePassword = (password, username) => {
        if (password.length < 8 || password.length > 16) {
            return "비밀번호는 8자 이상 16자 이하여야 합니다.";
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        const conditionCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

        if (conditionCount < 3) {
            return "비밀번호는 영문 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.";
        }

        if (/(.)\1\1/.test(password)) {
            return "비밀번호에 동일한 문자를 3번 이상 연속해서 사용할 수 없습니다.";
        }

        if (/\s/.test(password)) {
            return "비밀번호에 공백을 사용할 수 없습니다.";
        }

        if (username && password.includes(username)) {
            return "비밀번호에 아이디를 포함할 수 없습니다.";
        }

        return ""; // 유효한 경우
    };
    // endregion

    // region 이름, 휴대폰 관련
    // 이름 유효성 검사 및 인증
    const validateName = (name) => {
        if (name.length < 2 || name.length > 20) {
            return "이름은 2자 이상 20자 이하여야 합니다.";
        }

        const nameRegex = /^[가-힣a-zA-Z]+( [가-힣a-zA-Z]+)*$/;
        if (!nameRegex.test(name)) {
            return "이름은 한글, 영문, 공백만 사용할 수 있으며 연속된 공백은 허용되지 않습니다.";
        }

        return ""; // 유효한 경우 에러 메시지 없음
    };

    // 휴대폰 인증 타이머 시작
    const startPhoneTimer = () => {
        setPhoneTimer(TIMER_DURATION); // 3분 (180초)
        setIsPhoneResendVisible(false); // 재시도 버튼 숨김
        setIsPhoneDisabled(true); // 입력 칸 비활성화
    };

    // 휴대폰 인증 타이머 감소 로직
    useEffect(() => {
        if (phoneTimer > 0) {
            const countdown = setInterval(() => setPhoneTimer((prev) => prev - 1), 1000);
            return () => clearInterval(countdown);
        } else if (phoneTimer === 0) {
            if (isPhoneDisabled && !isPhoneVerified) {
                setErrors((prev) => ({...prev, phone: "인증번호 입력 시간이 종료되었습니다."})); // 에러 메시지 추가
                setIsPhoneResendVisible(true); // 재시도 버튼 표시
            } else if (isPhoneDisabled && isPhoneVerified) {

            }
        }
    }, [phoneTimer, isPhoneDisabled]);

    // 휴대폰 인증 코드 발송 API
    const handleSendPhoneVerification = async () => {
        if (!isPhoneComplete || !formData.name.trim()) return;

        const phoneRegex = /^\d{11}$/;
        if (!phoneRegex.test(formData.phone.replace(/-/g, ""))) {
            setErrors((prev) => ({...prev, phone: "유효하지 않은 휴대폰 번호입니다."}));
            return;
        }

        setErrors((prev) => ({...prev, phone: ""}));
        setIsPhoneVerified(false); // 인증 완료 초기화
        setIsPhoneDisabled(true); // 입력 칸 비활성화
        setIsCheckingPhone(true);
        startPhoneTimer(); // 타이머 시작

        try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기

            const data = await sendPhoneVerification(formData.name, formData.phone);

            if (data.data.responseCode === 200) {
                setAlertMessage("휴대폰 인증번호가 발송되었습니다.");
                setShowAlert(true);
            } else {
                if (data.data.responseCode === 401) {
                    setAlertMessage("유효하지 않은 휴대폰 번호입니다.");
                    setErrors((prev) => ({...prev, phone: "유효하지 않은 휴대폰 번호입니다."}));
                } else if (data.data.responseCode === 402) {
                    setAlertMessage("이미 가입된 휴대폰 번호입니다.");
                    setErrors((prev) => ({...prev, phone: "이미 가입된 휴대폰 번호입니다."}));
                } else if (data.data.responseCode === 403) {
                    setAlertMessage("오늘 해당 아이피로 휴대폰 인증을 5회 이상 시도하였습니다.");
                    setErrors((prev) => ({...prev, phone: "해당 아이피 휴대폰 인증 5회 초과 실패."}));
                } else {
                    setAlertMessage("휴대폰 인증 발송 중 오류가 발생했습니다. 다시 시도해주세요.");
                }

                setPhoneTimer(0);
                setIsPhoneDisabled(false);
                setIsPhoneComplete(false);
                setFormData((prev) => ({...prev, name: "", phone: ""}));
                setShowAlert(true);
            }

        } catch (error) {
            setAlertMessage("휴대폰 인증 요청 중 오류가 발생했습니다.");
            setShowAlert(true);
            setFormData((prev) => ({...prev, name: "", phone: ""}));
            setPhoneTimer(0);
            setIsPhoneDisabled(false);
            setIsPhoneComplete(false);
        } finally {
            setIsCheckingPhone(false);
        }
    };

    // 휴대폰 인증 재시도 버튼 클릭 시
    const resendVerification = () => {
        setPhoneTimer(0);
        setIsPhoneVerified(false); // 인증 상태 초기화
        setIsPhoneResendVisible(false); // 재시도 버튼 숨김
        setFormData((prev) => ({...prev, name: "", phone: ""})); // 이름과 휴대폰 번호 초기화
        setErrors((prev) => ({...prev, name: "", phone: ""}));
        setIsPhoneDisabled(false); // 입력 가능하도록 해제
        setIsPhoneComplete(false);
    };

    // 휴대폰 인증 코드 검증 API
    const handleVerifyPhoneCode = async () => {
        if (phoneAuthCode.length !== 6) return;
        try {
            const data = await verifyPhoneCode(formData.name, formData.phone, phoneAuthCode);

            if (data.data.responseCode === 200) {
                setIsPhoneVerified(true);
                setAlertMessage("휴대폰 인증이 완료되었습니다.");
                setShowAlert(true);
                setPhoneAuthCode(""); // 입력 값 초기화
                setErrors((prev) => ({...prev, phone: ""})); // 에러 메시지 제거
                setPhoneTimer(0); // 타이머 종료
            } else {
                if (data.data.responseCode === 401) {
                    setPhoneFailCount((prev) => prev + 1);

                    if (phoneFailCount + 1 >= 5) {
                        setAlertMessage("인증에 5회 실패하였습니다. 정보를 다시 입력해주세요.");
                        setShowAlert(true);
                        setFormData((prev) => ({...prev, name: "", phone: ""})); // 이름과 휴대폰 번호 초기화
                        setPhoneAuthCode(""); // 인증번호 입력 초기화
                        setPhoneFailCount(0); // 실패 횟수 초기화
                        setPhoneTimer(0); // 타이머 종료
                        setIsPhoneDisabled(false); // 입력 가능하도록 변경
                        setIsPhoneComplete(false); // 휴대폰 번호 인증 버튼 비활성화
                        setIsPhoneResendVisible(false); // 재시도 버튼 숨김
                        setErrors((prev) => ({...prev, phone: "", name: ""})); // 에러 초기화
                    } else {
                        setAlertMessage(`인증에 실패하였습니다. 남은 시도 횟수: ${5 - (phoneFailCount + 1)}`);
                        setShowAlert(true);
                    }
                } else {
                    setAlertMessage("휴대폰 인증 요청 중 오류가 발생했습니다.");
                    setShowAlert(true);
                }

            }
        } catch (error) {
            setAlertMessage("휴대폰 인증 요청 중 오류가 발생했습니다.");
            setShowAlert(true);
        } finally {

        }
    };
    // endregion

    // region 이메일 관련
    // 이메일 인증번호 발송 API
    const handleSendEmail = async () => {
        if (!isEmailComplete) return;
        setIsCheckingEmail(true); // 이메일 전송 중 상태 활성화
        try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기

            const data = await sendEmailVerification(formData.email);

            console.log(data);
            if (data.data.responseCode === 200) {
                // 성공 시 상태 업데이트
                setIsEmailCodeSent(true);
                setEmailTimer(EMAIL_TIMER_DURATION);
                setErrors((prev) => ({...prev, email: ''}));
            } else {
                if (data.data.responseCode === 401) {
                    setAlertMessage('이메일 형식이 올바르지 않습니다.');
                    setErrors((prev) => ({...prev, email: "이메일 형식이 올바르지 않습니다."}));
                } else if (data.data.responseCode === 402) {
                    // 이미 가입된 이메일일 때 얼럿 메시지 띄우기
                    setAlertMessage('이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.');
                    setErrors((prev) => ({...prev, email: "이미 가입된 이메일입니다."}));
                } else if (data.data.responseCode === 403) {
                    setAlertMessage('오늘 해당 아이피로 이메일 인증을 5회 이상 하여, 이메일 인증을 받으실 수 없습니다.');
                    setErrors((prev) => ({...prev, email: "해당 아이피 이메일 인증 5회 초과 실패."}));
                } else {
                    // 기타 에러 상황 처리
                    setAlertMessage('이메일 인증 발송 중 오류가 발생했습니다. 다시 시도해주세요.');
                    setErrors((prev) => ({...prev, email: "이메일 인증 발송 실패"}));
                }
                setShowAlert(true);
                setIsEmailCodeSent(false);
                setEmailTimer(0);
                setFormData((prev) => ({...prev, email: ""}));

            }
        } catch (error) {
            // API 호출 실패 (서버 문제 등)
            setAlertMessage('이메일 인증 요청 중 서버 오류가 발생했습니다.');
            setShowAlert(true);
            setErrors((prev) => ({...prev, email: '이메일 인증 발송 실패',}));
            setIsEmailCodeSent(false);
            setEmailTimer(0);
            setFormData((prev) => ({...prev, email: ""}));
        } finally {
            setIsCheckingEmail(false); // 이메일 전송 완료 후 상태 해제
        }
    };

    // 이메일 인증번호 검증 API
    const handleEmailCodeVerification = async () => {
        try {
            const data = await verifyEmailCode(formData.email, emailAuthCode);

            if (data.data.responseCode === 200) {
                // 인증 성공
                setIsEmailVerified(true);
                setIsEmailCodeSent(false); // 인증번호 입력폼 숨김
                setErrors((prev) => ({...prev, email: ""}));
                setAlertMessage("이메일 인증이 완료되었습니다.");
                setShowAlert(true);
            } else {
                if (data.data.responseCode === 401) {
                    // 인증 실패 (잘못된 코드 입력)
                    setEmailFailCount((prev) => prev + 1);
                    if (emailFailCount + 1 >= 5) {
                        setAlertMessage("인증에 5회 실패하였습니다. 이메일을 다시 입력해주세요.");
                        setShowAlert(true);
                        // 실패 5회 이상이면 이메일 인증 초기화
                        setIsEmailCodeSent(false);
                        setEmailAuthCode("");
                        setEmailTimer(0);
                        setEmailFailCount(0);
                        // 이메일 입력 필드 초기화
                        setFormData((prev) => ({...prev, email: ""}));
                    } else {
                        setErrors((prev) => ({...prev, email: "인증번호가 올바르지 않습니다."}));
                        setAlertMessage(`인증번호가 올바르지 않습니다. 남은 시도 횟수: ${5 - (emailFailCount + 1)}`);
                        setShowAlert(true);
                    }
                } else {
                    // 기타 에러
                    setAlertMessage("이메일 인증 중 오류가 발생했습니다.");
                    setShowAlert(true);
                    setErrors((prev) => ({...prev, email: "이메일 인증 실패"}));
                }
            }
        } catch (error) {
            setAlertMessage("이메일 인증 요청 중 서버 오류가 발생했습니다.");
            setShowAlert(true);
            setErrors((prev) => ({...prev, email: "이메일 인증 오류"}));
        } finally {

        }
    };

    // 이메일 타이머 감소 로직
    useEffect(() => {
        if (emailTimer > 0) {
            const countdown = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
            return () => clearInterval(countdown);
        } else if (emailTimer === 0) {
            if (isEmailCodeSent && !isEmailVerified) {
                setErrors((prev) => ({...prev, email: "인증번호 입력 시간이 종료되었습니다."}));
                setIsEmailCodeSent(false);
                setEmailAuthCode("");
                setFormData((prev) => ({...prev, email: ""}));
            }

        }
    }, [emailTimer, isEmailCodeSent]);
    // endregion

    // region 회원가입 관련
    // 회원가입 요청
    const handleSubmit = async () => {
        if (
            !isUsernameChecked && // 아이디 중복검사 완료
            !isPasswordValid && // 비밀번호 유효성 검사 완료
            !isPhoneVerified && // 휴대폰 번호 인증 완료
            !isEmailVerified // 이메일 인증 완료
        ) {
            return;
        }

        setJoinLoading(true); // 로딩 시작

        try {
            // 1. RSA 공개키 및 AES 랜덤키 발급 API 호출
            const rsaResponse = await getRsaKey(formData.username);
            // rsaResponse.data가 RsaKeyResponse 객체라고 가정:
            if (rsaResponse.status != 200) {
                setAlertMessage("회원가입이 실패하였습니다.[RSA 키 발급 실패]");
                setShowAlert(true);
                setJoinLoading(false);
                return;
            }
            const {rsaPublicKey, aesRandomKey} = rsaResponse.data;

            // 2. 클라이언트 암호화 처리
            // (a) AES 랜덤키를 RSA 공개키로 암호화
            const encryptedAesKey = await rsaEncrypt(aesRandomKey, rsaPublicKey);
            // (b) 평문 비밀번호를 AES256 (CBC 모드)로 암호화
            const encryptedPassword = await aesEncrypt(formData.password, aesRandomKey);

            // 3. 회원가입 API에 전달할 payload 구성
            const payload = {
                userAuthId: formData.username,
                encryptedPassword, // AES256 암호화된 비밀번호
                encryptedAesKey,   // RSA 공개키로 암호화한 AES 랜덤키
                rsaPublicKey,      // 클라이언트가 받은 RSA 공개키 (필요한 경우)
                userName: formData.name,
                userPhone: formData.phone,
                userEmail: formData.email
            };

            // 4. 회원가입 API 호출
            const data = await registerUser(payload);
            if (data.data.responseCode === 200) {
                setAlertJoinMessage("회원가입에 성공했습니다.");
                setShowJoinAlert(true);
            } else {
                if (data.data.responseCode === 403) {
                    setAlertMessage(data.message);
                    setShowAlert(true);
                } else {
                    setAlertMessage("회원가입에 실패했습니다.");
                    setShowAlert(true);
                }
            }

        } catch (error) {
            console.error("회원가입 처리 중 오류 발생", error);
            setAlertMessage("회원가입 처리 중 오류가 발생했습니다.");
            setShowAlert(true);
        } finally {
            setJoinLoading(false);
        }

        // 회원가입 API 호출 로직
        console.log("회원가입 성공");
    };

    const handleRedirectUrl = () => {
        navigate("/auth");
    }
    // endregion


    return (
        <div className={styles.container}>
            <h1>회원가입</h1>

            {/* 아이디 입력 */}
            <div className={styles.field}>

                <label>아이디</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={checkUsername}
                    ref={usernameInputRef} // 입력칸에 ref 연결
                    className={styles.input}
                />

                {isCheckingUsername && <span className={styles.checking}>검사 중...</span>}

                {!isCheckingUsername && isUsernameValid && (
                    <span className={styles.success}>사용 가능한 아이디입니다.</span>
                )}

                {!isCheckingUsername && errors.username && (
                    <span className={styles.error}>{errors.username}</span>
                )}

            </div>

            {/* 비밀번호 입력 */}
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
                    <span
                        className={
                            errors.password === "사용 가능한 비밀번호입니다."
                                ? styles.success
                                : styles.error
                        }
                    >
                        {errors.password}
                    </span>
                )}

            </div>

            {/* 비밀번호 확인 */}
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
                    <span
                        className={
                            errors.confirmPassword === "비밀번호와 일치합니다."
                                ? styles.success
                                : styles.error
                        }
                    >
                        {errors.confirmPassword}
                    </span>
                )}

            </div>

            {/* 이름 및 휴대폰 번호 입력 */}
            <div className={styles.field}>

                <label>이름</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={20} /* 최대 20자 제한 */
                    disabled={isPhoneDisabled} // 이름 비활성화 조건 추가
                    className={`${styles.input} ${isPhoneDisabled ? styles.disabled : ""}`} // 비활성화 스타일 추가
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>} {/* 이름 에러 메시지 */}

                <label>휴대폰 번호</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={isPhoneDisabled} // 휴대폰 번호 비활성화 조건
                    className={`${styles.input} ${isPhoneDisabled ? styles.disabled : ""}`} // 비활성화 스타일 추가
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>} {/* 이름 에러 메시지 */}

                <div className={styles.timerWrapper}>
                    {!isPhoneResendVisible && (
                        <button
                            onClick={handleSendPhoneVerification}
                            disabled={!isPhoneComplete || isPhoneDisabled} // 버튼 비활성화 조건
                            className={`${styles.button} ${
                                isPhoneComplete && !isPhoneDisabled ? styles.glowing : styles.disabledButton
                            }`}
                        >
                            {isCheckingPhone ? "SMS 전송 중..." : "휴대폰 번호 인증"}
                        </button>
                    )}
                    {phoneTimer > 0 && <span className={styles.phoneTimer}>{formatTime(phoneTimer)}</span>}
                </div>

                {phoneTimer > 0 && (
                    <div className={styles.inputRow}>
                        <input
                            type="text"
                            value={phoneAuthCode}
                            onChange={(e) => setPhoneAuthCode(e.target.value)}
                            maxLength={6} // 인증번호 최대 길이
                            placeholder="인증번호 입력"
                            className={styles.input}
                        />
                        <button
                            onClick={handleVerifyPhoneCode}
                            disabled={phoneAuthCode.length !== 6} // 인증번호가 6자일 때만 활성화
                            className={`${styles.button} ${styles.authCodeButton} ${phoneAuthCode.length === 6 ? styles.glowing : styles.disabledButton}`}
                        >
                            인증하기
                        </button>
                    </div>
                )}

                {(isPhoneResendVisible || isPhoneVerified) && (
                    <div className={styles.phoneVerificationResult}>
                        {isPhoneVerified && <span className={styles.success}>휴대폰 인증 완료</span>}
                        {isPhoneResendVisible && (
                            <button onClick={resendVerification} className={styles.resendButton}>
                                재시도
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 이메일 입력 및 인증 */}
            <div className={styles.field}>

                <label>이메일</label>
                <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    maxLength={50}
                    className={styles.input}
                    disabled={isEmailVerified || isEmailCodeSent} // 인증 성공 시 disable 처리
                />

                {errors.email && <span className={styles.error}>{errors.email}</span>}

                {!isEmailCodeSent && !isEmailVerified && (
                    <button
                        onClick={handleSendEmail}
                        disabled={!isEmailComplete || errors.email || isCheckingEmail}
                        className={`${styles.button} ${isEmailComplete && !errors.email ? styles.glowing : styles.disabledButton}`}
                    >
                        {isCheckingEmail ? "이메일 전송 중..." : "이메일 인증"}
                    </button>
                )}

                {isEmailCodeSent && (
                    <div className={styles.inputRow}>
                        <input
                            type="text"
                            value={emailAuthCode}
                            onChange={(e) => setEmailAuthCode(e.target.value)}
                            maxLength={6}
                            placeholder="인증번호 입력"
                            className={styles.input}
                        />
                        <button
                            onClick={handleEmailCodeVerification}
                            disabled={emailAuthCode.length !== 6}
                            className={`${styles.button} ${emailAuthCode.length === 6 ? styles.glowing : styles.disabledButton}`}
                        >
                            인증하기
                        </button>
                        {emailTimer > 0 && (
                            <span className={styles.phoneTimer}>{formatTime(emailTimer)}</span>
                        )}
                    </div>
                )}

                {isEmailVerified && <span className={styles.success}>이메일 인증 완료</span>}

            </div>

            {/* 회원가입 버튼 */}
            <button
                onClick={handleSubmit}
                disabled={
                    !isUsernameChecked || // 아이디 중복 검사 완료 여부
                    !isPasswordValid || // 비밀번호 유효성 및 검사 완료 여부
                    !isPhoneVerified || // 휴대폰 인증 완료 여부
                    !isEmailVerified // 이메일 인증 완료 여부
                }
                className={`${styles.submitButton} ${
                    isUsernameChecked &&
                    isPasswordValid &&
                    isPhoneVerified &&
                    isEmailVerified
                        ? styles.active
                        : ""
                }`}
            >
                회원가입
            </button>

            {joinLoading && <JoinLoading text="회원가입 중..."/>}

            {
                showJoinAlert &&
                (
                    <CustomAlert
                        message={alertJoinMessage}
                        onConfirm={handleRedirectUrl}
                        confirmButtonMessage={"로그인으로 이동하기"}
                    />
                )}

            {
                showAlert &&
                (
                    <CustomAlert
                        message={alertMessage}
                        onConfirm={() => setShowAlert(false)}
                    />
                )}
        </div>
    );
};

export default Join;
