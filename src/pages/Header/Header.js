import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/token"; // 방금 만든 함수

const Header = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!getCookie("accessToken"));

    // 쿠키 변동시 로그인 상태 실시간 반영 (최소 0.5초 ~ 1초 폴링)
    useEffect(() => {
        const interval = setInterval(() => {
            setIsLoggedIn(!!getCookie("accessToken"));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleJoinClick = () => navigate("/join");
    const handleLoginClick = () => navigate("/auth");

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <span className={styles.logoText}>Payment-System</span>
            </div>
            <nav className={`${styles.desktopMenu}`}>
                {/*<a href="#guide">사용 가이드</a>*/}
                {/* 로그인X 때만 노출 */}
                {!isLoggedIn && (
                    <>
                        <button className={styles.joinButton} onClick={handleJoinClick}>회원가입</button>
                        <button className={styles.loginButton} onClick={handleLoginClick}>로그인</button>
                    </>
                )}
                {/* 로그인O 시 로그아웃 등 */}
                {isLoggedIn && (
                    <>
                    <a href="/card/register">카드 결제 수단 등록</a>
                    <a href="/order">주문 결제</a>
                    <button
                        className={styles.logoutButton}
                        onClick={() => {
                            // 로그아웃 시 쿠키 삭제(secure 옵션 고려 실제 삭제 코드는 상황 따라 다름)
                            document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            setIsLoggedIn(false);
                            navigate("/auth");
                        }}
                    >
                        로그아웃
                    </button>
                    </>
                )}
            </nav>
            {/* 모바일 메뉴도 동일하게 처리 생략 */}
        </header>
    );
};

export default Header;
