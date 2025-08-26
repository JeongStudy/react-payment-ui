// pages/Payment/Payment.js
import React, {useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import PaymentMethodSelector from "../../components/Payment/PaymentMethodSelector";
import CardPicker from "../../components/Card/CardPicker";
import PaymentPasswordModal from "../../components/Payment/PaymentPasswordModal";
import {PaymentApis} from "../../apis/payment/PaymentApis";
import PaymentCompleteModal from "../../components/Payment/PaymentCompleteModal";

const USE_MOCK = true; //나중에 true->false로 바꾸면 실폴링 복구됨

const Payment = () => {
    const {state} = useLocation();
    const navigate = useNavigate();
    const order = state?.order;

    const [method, setMethod] = useState("CARD");
    const [selectedCard, setSelectedCard] = useState(null);
    const [showPwdModal, setShowPwdModal] = useState(false);

    // Processing Overlay states
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMsg, setProcessingMsg] = useState("");
    const pollTimerRef = useRef(null);

    const [elapsed, setElapsed] = useState(0); // 초 단위 경과시간

    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [lastPaymentId, setLastPaymentId] = useState(null);

    const openPwdModal = () => {
        if (method === "EASY") return alert("간편결제는 현재 개발 중입니다.");
        if (method === "NONMEMBERCARD") return alert("1회성 카드결제는 현재 개발 중입니다.");
        if (!selectedCard) return alert("결제할 카드를 선택해 주세요.");
        setShowPwdModal(true);
    };

    const handlePwdConfirm = async ({encPassword, encAesKey, rsaPublicKey}) => {
        // 모달은 이미 닫힘. 이제부터 Payment.js에서 처리
        try {
            setIsProcessing(true);
            setProcessingMsg("결제 요청 중...");
            setElapsed(0); // 초기화

            const idempotencyKey =
                (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
                `${Date.now()}-${Math.random().toString(16).slice(2)}`;

            const payload = {
                paymentUserCardId: selectedCard?.id,
                serviceOrderId: order?.orderId,
                productName: order?.productName,
                amount: order?.price,
                idempotencyKey,
                encPassword,
                encAesKey,
                rsaPublicKey,
            };

            // 1) 결제 요청
            const res = await PaymentApis.createPayment(payload);
            // 서버 반환: { serviceOrderId, paymentId, eventId } (data 또는 data.data) 가정
            const data = res?.data?.data || res?.data || {};
            const paymentId = data.paymentId;

            if (!paymentId) {
                setIsProcessing(false);
                return alert("결제 요청은 처리되었으나 paymentId를 받지 못했습니다.");
            }

            // 2) 폴링 시작
            setProcessingMsg("결제 진행 중...");
            startPolling(paymentId);
        } catch (e) {
            console.error(e);
            setIsProcessing(false);
            alert(e?.response?.data?.message || e?.message || "결제 요청 중 오류가 발생했습니다.");
        }
    };

    const startPolling = (paymentId) => {
        clearPolling();

        if (USE_MOCK) {
            setProcessingMsg("결제 진행 중...");
            pollTimerRef.current = setTimeout(() => {
                setIsProcessing(false);
                setLastPaymentId(paymentId);
                setShowCompleteModal(true);
            }, 3000);
            return;
        }

        let tries = 0;

        pollTimerRef.current = setInterval(async () => {
            tries += 1;
            setElapsed((prev) => prev + 1); // ⏱️ 1초 증가

            // ⏰ 30초 초과하면 실패 처리
            if (tries > 30) {
                clearPolling();
                setIsProcessing(false);
                alert("결제가 제한 시간(30초)을 초과했습니다. 실패 처리됩니다.");
                return;
            }

            try {
                const res = await PaymentApis.getPaymentStatus(paymentId);
                // 서버 반환: { paymentId, code, description } (data 또는 data.data) 가정
                const s = res?.data?.data || res?.data || {};
                const code = s?.code;
                const description = s?.description;

                if (!code) return; // code 없으면 다음 턴

                if (code === "22") {
                    clearPolling();
                    setIsProcessing(false);
                    navigate("/payment/complete", {
                        replace: true,
                        state: {paymentId, order, code, description},
                    });
                } else if (code === "33" || code === "44") {
                    clearPolling();
                    setIsProcessing(false);
                    alert(description || "결제가 실패/취소되었습니다.");
                }
            } catch (e) {
                // 네트워크 순간 실패는 계속 폴링
                console.warn("poll error:", e?.message || e);
                clearPolling();
                setIsProcessing(false);
                alert("일시적으로 결제 상태를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
            }
        }, 1000);
    };

    const clearPolling = () => {
        if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    };

    // 언마운트 시 폴링 정리
    React.useEffect(() => clearPolling, []);

    if (!order) {
        return <div style={{padding: 16}}>잘못된 접근입니다. 주문 정보가 없습니다.</div>;
    }

    return (
        <div style={{maxWidth: 720, margin: "0 auto", padding: 16, position: "relative"}}>
            <h2 style={{fontSize: 22, fontWeight: 800}}>결제</h2>

            <div style={{marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12}}>
                <div style={{fontWeight: 700}}>주문 요약</div>
                <div style={{marginTop: 6}}>{order.productName} · 수량 {order.quantity}</div>
                <div style={{marginTop: 4, color: "#6b7280", fontSize: 13}}>{order.subtitle}</div>
                <div style={{marginTop: 8, fontWeight: 700}}>{order.price.toLocaleString()}원</div>
            </div>

            <PaymentMethodSelector method={method} onChange={setMethod}/>

            {method === "CARD" && (
                <div style={{marginTop: 8}}>
                    <CardPicker selectedCardId={selectedCard?.id || null} onSelect={setSelectedCard}/>
                </div>
            )}

            {method === "EASY" && <div style={{marginTop: 8, color: "#6b7280"}}>간편결제는 준비 중입니다.</div>}
            {method === "NONMEMBERCARD" && <div style={{marginTop: 8, color: "#6b7280"}}>1회성 카드결제는 준비 중입니다.</div>}

            <div style={{display: "flex", justifyContent: "flex-end", marginTop: 16}}>
                <button style={btnPrimary} onClick={openPwdModal}>결제하기</button>
            </div>

            <PaymentPasswordModal
                open={showPwdModal}
                onClose={() => setShowPwdModal(false)}
                onConfirm={handlePwdConfirm}   // NEW
            />

            {/* Processing Overlay */}
            {isProcessing && (
                <div style={overlay}>
                    <div style={overlayCard}>
                        <div style={{fontWeight: 700, marginBottom: 6}}>결제 중입니다…</div>
                        <div style={{color: "#6b7280", fontSize: 14}}>
                            {processingMsg} ({elapsed}s)
                        </div>
                    </div>
                </div>
            )}

            <PaymentCompleteModal
                open={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                onConfirm={() => {
                    setShowCompleteModal(false);
                    navigate("/payment/complete", {
                        replace: true,
                        state: {paymentId: lastPaymentId, order, code: "22", description: "결제 완료 (Mock)"},
                    });
                }}
            />
        </div>
    );
};

const btnPrimary = {
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer"
};
const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1200
};
const overlayCard = {background: "white", padding: 16, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.25)"};

export default Payment;
