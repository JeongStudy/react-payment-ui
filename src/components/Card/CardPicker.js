import React, { useEffect, useMemo, useState } from "react";
import { getCardList } from "../../apis/card/CardApis"; // 경로는 프로젝트 구조에 맞게 조정

/**
 * 실제 카드 조회 API 연동 버전
 * - API 응답 스펙: { cardId, cardNumberMasked, cardType(1=체크, 0=신용), cardCompany(코드) }
 * - 3열 그리드로 여러 줄 표시, 간단한 SVG 카드 일러스트 포함
 * - 로딩/에러/빈 상태 처리
 */
const CardPicker = ({ selectedCardId, onSelect, payload }) => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 카드사 코드 → 표시명/색상 매핑 (임시)
    const companyMap = useMemo(
        () => ({
            // 알파 코드를 쓰는 경우
            KEB: { label: "하나", color: "#16a34a" },
            KNB: { label: "국민", color: "#f59e0b" },
            SHB: { label: "신한", color: "#3b82f6" },
            WRB: { label: "우리", color: "#10b981" },
            LTB: { label: "롯데", color: "#ef4444" },
            HYB: { label: "현대", color: "#64748b" },
            NHB: { label: "NH", color: "#22c55e" },
            // 숫자 코드(예: "14" 등)가 오는 경우를 대비한 임시 매핑
            // 실제 코드 확정 시 여기만 교체
            "14": { label: "신한", color: "#3b82f6" },
            "06": { label: "국민", color: "#f59e0b" },
            "11": { label: "농협", color: "#22c55e" },
            "17": { label: "우리", color: "#10b981" },
            "12": { label: "롯데", color: "#ef4444" },
            "31": { label: "하나", color: "#16a34a" },
            DEFAULT: { label: "카드", color: "#111827" },
        }),
        []
    );

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const res = await getCardList(payload ?? {});
                // 응답이 [ ... ] 형태 혹은 { data: [ ... ] } 두 케이스 모두 대응
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res?.data?.data)
                        ? res.data.data
                        : [];
                if (!mounted) return;
                // 표준화: UI에서 쓰기 쉬운 형태로 매핑
                const normalized = list.map((it) => {
                    const typeNum = Number(it.cardType);
                    const company = companyMap[it.cardCompany] ?? companyMap.DEFAULT;
                    return {
                        id: it.cardId,
                        masked: it.cardNumberMasked,
                        type: Number.isNaN(typeNum) ? it.cardType : typeNum, // "1" → 1
                        companyCode: String(it.cardCompany),
                        companyLabel: company.label,
                        color: company.color,
                        billingKey: it.billingKey,
                    };
                });
                setCards(normalized);
                setError(null);
            } catch (e) {
                console.error(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [payload, companyMap]);

    const onChange = (c) => {
        if (selectedCardId === c.id) {
            // 이미 선택된 카드를 다시 클릭 → 해제
            onSelect?.(null);
        } else {
            onSelect?.(c);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>내 카드</div>

            {loading && (
                <div style={gridStyle}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ ...cardStyle, outline: "1px solid #e5e7eb" }}>
                            <div style={{ ...imageWrapStyle, background: "#f3f4f6" }} />
                            <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6 }} />
                            <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, width: "70%" }} />
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && (
                <div style={emptyStyle}>카드 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>
            )}

            {!loading && !error && cards.length === 0 && (
                <div style={emptyStyle}>등록된 카드가 없습니다. 먼저 카드 결제 수단을 등록해 주세요.</div>
            )}

            {!loading && !error && cards.length > 0 && (
                <div style={gridStyle}>
                    {cards.map((c) => (
                        <label
                            key={c.id}
                            style={{
                                ...cardStyle,
                                outline: selectedCardId === c.id ? "2px solid #111827" : "1px solid #e5e7eb",
                                boxShadow:
                                    selectedCardId === c.id ? "0 6px 18px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.06)",
                            }}
                        >
                            <input
                                type="checkbox"
                                name="card"
                                value={c.id}
                                checked={selectedCardId === c.id}
                                onChange={() => onChange(c)}
                                style={{ display: "none" }}
                                aria-label={`${c.companyLabel} ${c.masked}`}
                            />

                            {/* 카드 일러스트 */}
                            <div style={imageWrapStyle}>
                                <CardSVG color={c.color} />
                            </div>

                            {/* 텍스트 영역 */}
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                                    {c.companyLabel} · {Number(c.type) === 1 ? "체크" : "신용"}
                                </div>
                                <div style={{ color: "#6b7280", fontSize: 12 }}>{c.masked}</div>
                            </div>
                        </label>
                    ))}
                </div>
            )}
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
