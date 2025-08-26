// pages/Payment/PaymentComplete.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentComplete = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const paymentId = state?.paymentId;
    const order = state?.order;
    const code = state?.code;
    const description = state?.description;

    return (
        <div style={container}>
            <div style={card}>
                <h2 style={title}>🎉 결제가 완료되었습니다</h2>
                <p style={subtitle}>고객님의 결제가 정상적으로 처리되었습니다.</p>

                <div style={infoBox}>
                    <div style={row}>
                        <span style={label}>결제번호</span>
                        <span style={value}>{paymentId}</span>
                    </div>
                    <div style={row}>
                        <span style={label}>상품명</span>
                        <span style={value}>{order?.productName}</span>
                    </div>
                    <div style={row}>
                        <span style={label}>수량</span>
                        <span style={value}>{order?.quantity}</span>
                    </div>
                    <div style={row}>
                        <span style={label}>결제금액</span>
                        <span style={value}>{order?.price?.toLocaleString()}원</span>
                    </div>
                    <div style={row}>
                        <span style={label}>상태</span>
                        <span style={value}>{code} ({description})</span>
                    </div>
                </div>

                <div style={btnBox}>
                    <button style={btnPrimary} onClick={() => navigate("/")}>메인으로</button>
                    <button style={btnGhost} onClick={() => navigate("/order")}>다른 주문하기</button>
                </div>
            </div>
        </div>
    );
};

// ✅ 스타일 객체
const container = { display: "flex", justifyContent: "center", padding: "40px 16px" };
const card = { background: "white", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", padding: 24, width: "100%", maxWidth: 480, textAlign: "center" };
const title = { fontSize: 22, fontWeight: 700 };
const subtitle = { fontSize: 15, color: "#6b7280", marginTop: 8 };
const infoBox = { marginTop: 20, textAlign: "left", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 };
const row = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const label = { color: "#6b7280", fontSize: 14 };
const value = { fontWeight: 600, fontSize: 15 };
const btnBox = { display: "flex", justifyContent: "flex-end", marginTop: 20, gap: 10 };
const btnPrimary = { background: "#111827", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer" };
const btnGhost = { background: "white", color: "#111827", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", cursor: "pointer" };

export default PaymentComplete;
