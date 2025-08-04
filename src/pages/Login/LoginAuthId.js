import React, { useState } from "react";
import styles from "./LoginAuthId.module.css";

const LoginAuthId = () => {
    const [inputValue, setInputValue] = useState("");

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`입력된 이메일(아이디): ${inputValue}`);
    };

    return (
        <main className={styles.main}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className={styles.title}>이메일(아이디)를 입력해주세요</h1>
                <input
                    type="text"
                    placeholder="이메일(아이디)를 입력하세요"
                    value={inputValue}
                    onChange={handleChange}
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>
                    다음
                </button>
            </form>
        </main>
    );
};

export default LoginAuthId;
