// components/Payment/PaymentMethodSelector.js
import React from 'react';

const PaymentMethodSelector = ({ method, onChange }) => {
    return (
        <div style={{display: 'flex', gap: 16, margin: '16px 0'}}>
            <label style={labelStyle}>
                <input
                    type="radio"
                    name="payMethod"
                    value="CARD"
                    checked={method === 'CARD'}
                    onChange={() => onChange('CARD')}
                />
                <span>카드 결제</span>
            </label>
            <label style={labelStyle}>
                <input
                    type="radio"
                    name="payMethod"
                    value="EASY"
                    checked={method === 'EASY'}
                    onChange={() => onChange('EASY')}
                />
                <span>간편결제 (개발중)</span>
            </label>
            <label style={labelStyle}>
                <input
                    type="radio"
                    name="payMethod"
                    value="NONMEMBERCARD"
                    checked={method === 'NONMEMBERCARD'}
                    onChange={() => onChange('NONMEMBERCARD')}
                />
                <span>비회원 카드 결제</span>
            </label>
        </div>
    );
};

const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
};

export default PaymentMethodSelector;
