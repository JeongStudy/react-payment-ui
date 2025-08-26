import React from "react";
import './Login.css';
import {Outlet, useNavigate} from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const handleIdLoginClick = () => {
        navigate("/auth/id"); // /auth/id로 라우팅
    };

    return (
        <main className="main">
            <div className="login-container">
                {/*<div className="logo">*/}
                {/*    /!*<img src="../../logo.svg" alt="react Logo" className="logo-img-large"/>*!/*/}
                {/*    <span className="logo-text-large">Example</span>*/}
                {/*</div>*/}
                <p className="description">로그인/가입하고<br/>결제시스템을 관리해 보세요</p>
                <button className="btn btn-secondary" onClick={handleIdLoginClick}>
                    <span>📧</span> 아이디로 시작
                </button>
                <Outlet />
            </div>
        </main>
    );
};

export default Login;