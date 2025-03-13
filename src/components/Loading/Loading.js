import React from "react";
import styles from "./Loading.module.css";

const Loading = ({ text = "로딩 중..." }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.spinner}>
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className={styles.dot}></div>
                ))}
            </div>
            <div className={styles.text}>{text}</div>
        </div>
    );
};

export default Loading;