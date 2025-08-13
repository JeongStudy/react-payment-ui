import React from "react";

/**
 * 실제로는 사용자의 카드 목록을 API로 받아와 렌더링.
 * 여기서는 샘플 카드 6개를 노출해 3열 그리드로 여러 줄 배치.
 * - 카드 이미지는 간단한 SVG 일러스트로 대체 (브랜드별 색상 변화)
 */
const CardPicker = ({ selectedCardId, onSelect }) => {
    const sampleCards = [
        { id: 101, brand: "KB국민(예시)", masked: "**** **** **** 1234", color: "#f59e0b" },
        { id: 102, brand: "신한(예시)", masked: "**** **** **** 5678", color: "#3b82f6" },
        { id: 103, brand: "우리(예시)",  masked: "**** **** **** 9012", color: "#10b981" },
        { id: 104, brand: "NH(예시)",   masked: "**** **** **** 3456", color: "#22c55e" },
        { id: 105, brand: "롯데(예시)",  masked: "**** **** **** 7890", color: "#ef4444" },
        { id: 106, brand: "현대(예시)",  masked: "**** **** **** 2468", color: "#64748b" },
    ];

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>내 카드</div>

            {/* 카드가 없을 때 */}
            {sampleCards.length === 0 && (
                <div style={emptyStyle}>등록된 카드가 없습니다. 먼저 카드 결제 수단을 등록해 주세요.</div>
            )}

            {/* 3열 그리드 */}
            <div style={gridStyle}>
                {sampleCards.map((c) => (
                    <label
                        key={c.id}
                        style={{
                            ...cardStyle,
                            outline: selectedCardId === c.id ? "2px solid #111827" : "1px solid #e5e7eb",
                            boxShadow: selectedCardId === c.id ? "0 6px 18px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                    >
                        <input
                            type="radio"
                            name="card"
                            value={c.id}
                            checked={selectedCardId === c.id}
                            onChange={() => onSelect?.(c)}
                            style={{ display: "none" }}
                            aria-label={`${c.brand} ${c.masked}`}
                        />

                        {/* 카드 일러스트 */}
                        <div style={imageWrapStyle}>
                            <CardSVG color={c.color} />
                        </div>

                        {/* 텍스트 영역 */}
                        <div style={{ display: "grid", gap: 6 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{c.brand}</div>
                            <div style={{ color: "#6b7280", fontSize: 12 }}>{c.masked}</div>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};

/** 간단한 카드 SVG (브랜드별 색상 적용) */
const CardSVG = ({ color = "#3b82f6" }) => (
    <svg viewBox="0 0 320 200" width="100%" height="100%" role="img" aria-label="card image">
        <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={color} stopOpacity="0.75" />
            </linearGradient>
        </defs>
        <rect x="0" y="0" width="320" height="200" rx="16" fill="url(#g)" />
        <rect x="20" y="50" width="280" height="24" rx="6" fill="rgba(255,255,255,0.85)" />
        <rect x="20" y="90" width="180" height="18" rx="4" fill="rgba(255,255,255,0.8)" />
        <rect x="20" y="120" width="140" height="18" rx="4" fill="rgba(255,255,255,0.65)" />
        <circle cx="260" cy="140" r="16" fill="rgba(255,255,255,0.9)" />
        <circle cx="285" cy="140" r="16" fill="rgba(255,255,255,0.7)" />
    </svg>
);

/*** styles ***/
const containerStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    background: "#ffffff",
};

const headerStyle = {
    fontWeight: 700,
    marginBottom: 12,
    fontSize: 16,
    color: "#111827",
};

const emptyStyle = {
    color: "#6b7280",
    fontSize: 14,
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
};

const cardStyle = {
    display: "grid",
    gap: 10,
    alignContent: "start",
    cursor: "pointer",
    padding: 12,
    borderRadius: 12,
    transition: "box-shadow .2s ease, outline .2s ease, transform .06s ease",
    background: "#fff",
    userSelect: "none",
};

const imageWrapStyle = {
    width: "100%",
    aspectRatio: "16 / 10",
    borderRadius: 10,
    overflow: "hidden",
    background: "#f3f4f6",
};

export default CardPicker;
