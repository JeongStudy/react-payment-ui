// components/OrderSummary.jsx
import React from 'react';

const OrderSummary = ({ order }) => {
    return (
        <div style={wrap}>
            <img src={order.thumbnail} alt="thumb" style={thumb} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{order.productName}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{order.subtitle}</div>
                <div style={{ marginTop: 8 }}>수량: {order.quantity}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{order.price.toLocaleString()}원</div>
                <div style={{ color: '#6b7280', fontSize: 12 }}>VAT 포함</div>
            </div>
        </div>
    );
};

const wrap = { display: 'flex', gap: 12, border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, alignItems: 'center' };
const thumb = { width: 72, height: 72, borderRadius: 8, objectFit: 'cover', background: '#f3f4f6' };

export default OrderSummary;