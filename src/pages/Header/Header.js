import React, {useEffect, useState} from "react";
import styles from "./Header.module.css";
import {NavLink, useNavigate} from "react-router-dom";
import {getCookie} from "../../utils/token"; // 방금 만든 함수

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
                <span className={styles.logoText} onClick={() => navigate("/")}
                      className={styles.logoText}>Payment-System</span>
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
                    <div className={styles.navMenu}>
                        <NavLink
                            to="/card/register"
                            className={({isActive}) =>
                                `${styles.navLink} ${isActive ? styles.active : ""}`
                            }
                        >
                            카드 등록
                        </NavLink>
                        <NavLink
                            to="/order"
                            className={({isActive}) =>
                                `${styles.navLink} ${isActive ? styles.active : ""}`
                            }
                        >
                            주문 결제
                        </NavLink>
                        <button
                            className={styles.logoutButton}
                            onClick={() => {
                                document.cookie =
                                    "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                setIsLoggedIn(false);
                                navigate("/auth");
                            }}
                        >
                            로그아웃
                        </button>
                    </div>
                )}
            </nav>
            {/* 모바일 메뉴도 동일하게 처리 생략 */}
        </header>
    );
};

export default Header;
