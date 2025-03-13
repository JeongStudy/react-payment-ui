import React from "react";
import styles from "./CustomAlert.module.css";

const CustomAlert = ({ message, onConfirm, onCancel, showCancel = false, confirmButtonMessage ='확인' }) => {

    return (
        <div className={styles.overlay}>
            <div className={styles.alertBox}>
                <p className={styles.message}>{message}</p>
                <div className={styles.buttonGroup}>
                    <button className={styles.confirmButton} onClick={onConfirm}>
                        {confirmButtonMessage}
                    </button>
                    {showCancel && (
                        <button className={styles.cancelButton} onClick={onCancel}>
                            취소
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomAlert;
