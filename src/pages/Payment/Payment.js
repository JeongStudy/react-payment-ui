// pages/Payment/Payment.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PaymentMethodSelector from '../../components/Payment/PaymentMethodSelector';
import CardPicker from '../../components/Card/CardPicker';
import PaymentPasswordModal from '../../components/Payment/PaymentPasswordModal';

const Payment = () => {
    const { state } = useLocation();
    const order = state?.order;
    const [method, setMethod] = useState('CARD');
    const [selectedCard, setSelectedCard] = useState(null);
    const [showPwdModal, setShowPwdModal] = useState(false);

    const openPwdModal = () => {
        if (method !== 'CARD') {
            alert('간편결제는 현재 개발 중입니다.');
            return;
        }
        if (!selectedCard) {
            alert('결제할 카드를 선택해 주세요.');
            return;
        }
        setShowPwdModal(true);
    };

    if (!order) {
        return <div style={{ padding: 16 }}>잘못된 접근입니다. 주문 정보가 없습니다.</div>;
    }

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>결제</h2>

            <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>주문 요약</div>
                <div style={{ marginTop: 6 }}>{order.productName} · 수량 {order.quantity}</div>
                <div style={{ marginTop: 4, color: '#6b7280', fontSize: 13 }}>{order.subtitle}</div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>{order.price.toLocaleString()}원</div>
            </div>

            <PaymentMethodSelector method={method} onChange={setMethod} />

            {method === 'CARD' && (
                <div style={{ marginTop: 8 }}>
                    <CardPicker selectedCardId={selectedCard?.id || null} onSelect={setSelectedCard} />
                </div>
            )}

            {method === 'EASY' && (
                <div style={{ marginTop: 8, color: '#6b7280' }}>간편결제는 준비 중입니다.</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button style={btnPrimary} onClick={openPwdModal}>결제하기</button>
            </div>

            <PaymentPasswordModal
                open={showPwdModal}
                onClose={() => setShowPwdModal(false)}
                orderId={order.orderId}
                billingKey={selectedCard?.billingKey}
                onSuccess={(pid) => {
                    alert(`결제 요청 접수 완료! paymentId=${pid ?? 'N/A'}`);
                }}
            />
        </div>
    );
};

const btnPrimary = { background: '#111827', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' };

export default Payment;