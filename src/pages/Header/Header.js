import React, {useState} from "react";
import styles from "./Header.module.css";
import {useNavigate} from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleJoinClick = () => {
        navigate("/join"); // /auth로 라우터 이동
    };

    const handleLoginClick = () => {
        navigate("/auth"); // /auth로 라우터 이동
    };

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                {/*<img src="/logo.png" alt="Pick2Sell Logo" className={styles.logoImg} />*/}
                <span className={styles.logoText}>Example</span>
            </div>

            {/* 데스크탑 메뉴 */}
            <nav className={`${styles.desktopMenu}`}>
                <a href="#plans">플랜</a>
                <a href="#guide">사용 가이드</a>
                <a href="#download">앱 다운로드</a>
                <a href="#inquiry">문의하기</a>
                <a href="#academy">아카데미</a>
                <button
                    className={styles.joinButton}
                    onClick={handleJoinClick}
                >
                    회원가입
                </button>
                <button
                    className={styles.loginButton}
                    onClick={handleLoginClick}
                >
                    로그인
                </button>
            </nav>

            {/* 모바일 메뉴 */}
            <div className={`${styles.mobileMenu}`}>
                <button className={styles.hamburger} onClick={toggleMenu}>
                    ☰
                </button>
                <div
                    className={`${styles.mobileNav} ${
                        menuOpen ? styles.navOpen : ""
                    }`}
                >
                    <a href="#plans">플랜</a>
                    <a href="#guide">사용 가이드</a>
                    <a href="#download">앱 다운로드</a>
                    <a href="#inquiry">문의하기</a>
                    <a href="#academy">픽투셀 아카데미</a>
                    <button className={styles.loginButton}>회원가입 / 로그인</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
