// components/CardPicker.jsx
import React from 'react';

/**
 * 실제로는 사용자의 카드 목록을 API로 받아와 렌더링.
 * 여기서는 샘플(등록된 카드 없음 → 예시 1개 노출)으로 처리.
 */
const CardPicker = ({ selectedCardId, onSelect }) => {
    const sampleCards = [
        { id: 101, brand: 'KB국민(예시)', masked: '**** **** **** 1234', billingKey: 'BILLING-KEY-SAMPLE-001' },
    ];

    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>내 카드</div>
            {sampleCards.map((c) => (
                <label key={c.id} style={rowStyle}>
                    <input
                        type="radio"
                        name="card"
                        value={c.id}
                        checked={selectedCardId === c.id}
                        onChange={() => onSelect(c)}
                    />
                    <div>
                        <div>{c.brand} · {c.masked}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>빌링키: {c.billingKey}</div>
                    </div>
                </label>
            ))}
            {sampleCards.length === 0 && (
                <div style={{ color: '#6b7280' }}>등록된 카드가 없습니다. 먼저 카드 결제 수단을 등록해 주세요.</div>
            )}
        </div>
    );
};

const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 0',
};

export default CardPicker;