// pages/Order/Order.js
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderSummary from '../../components/Order/OrderSummary';

// 하드코딩된 단일 주문(요구사항)
const FIXED_ORDER_ID = "2400811";

const Order = () => {
    const navigate = useNavigate();
    const [selectedOrderId, setSelectedOrderId] = useState(FIXED_ORDER_ID);
    const order = useMemo(() => ({
        orderId: FIXED_ORDER_ID,
        productName: 'AI 라이센스 키(연 1석)',
        subtitle: '개발자 친화형 AI API 라이센스 키. 1계정 사용.',
        quantity: 1,
        price: 1,
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=300&auto=format&fit=crop',
        meta: { term: '1년', platform: 'Web' },
    }), []);

    const goPayment = () => {
        if (selectedOrderId !== FIXED_ORDER_ID) return;
        navigate('/payment', { state: { order } });
    };

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>주문 선택</h2>
            <label style={{ display: 'flex', gap: 12, marginTop: 12, cursor: 'pointer' }}>
                <input
                    type="radio"
                    name="order"
                    value={FIXED_ORDER_ID}
                    checked={selectedOrderId === FIXED_ORDER_ID}
                    onChange={() => setSelectedOrderId(FIXED_ORDER_ID)}
                />
                <OrderSummary order={order} />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button style={btnPrimary} onClick={goPayment}>결제하기</button>
            </div>
        </div>
    );
};

const btnPrimary = { background: '#111827', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' };

export default Order;
export { FIXED_ORDER_ID };