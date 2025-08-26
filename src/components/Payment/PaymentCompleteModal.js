import React from "react";

const PaymentCompleteModal = ({ open, onConfirm }) => {
    if (!open) return null;

    return (
        <div style={backdrop}>
            <div style={modal}>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>✅ 결제가 완료되었습니다!</h3>
                <p style={{ marginTop: 8, color: "#6b7280" }}>
                    결제가 정상적으로 처리되었습니다.
                </p>

                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                    <button style={btnPrimary} onClick={onConfirm}>확인</button>
                </div>
            </div>
        </div>
    );
};

const backdrop = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 2000
};
const modal = {
    width: 360, background: "white", borderRadius: 12,
    padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    textAlign: "center"
};
const btnPrimary = {
    background: "#111827", color: "white", border: "none",
    borderRadius: 6, padding: "10px 16px", cursor: "pointer"
};

export default PaymentCompleteModal;
