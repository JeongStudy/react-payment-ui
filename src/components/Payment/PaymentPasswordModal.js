// components/Payment/PaymentPasswordModal.js
// CHANGED: onConfirm만 호출하고 닫기. 결제 API 호출은 부모(Payment)에서.
import React, {useEffect, useState} from "react";
import {getAesKey} from "../../apis/crypto/AesKeyApis";
import {getRsaKey} from "../../apis/crypto/RsaKeyApis";
import {aesEncrypt, rsaEncrypt} from "../../utils/Cipher";

const PaymentPasswordModal = ({
                                  open,
                                  onClose,
                                  onConfirm,            // NEW: 암호화 결과를 부모에 전달
                              }) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (open) {
            setPassword("");
            setErrorMsg("");
            setLoading(false);
        }
    }, [open]);

    if (!open) return null;

    const handleConfirm = async () => {
        if (!password) {
            setErrorMsg("비밀번호를 입력해 주세요.");
            return;
        }
        try {
            setLoading(true);
            setErrorMsg("");

            // 1) AES/RSA 키 발급
            const aesRes = await getAesKey();
            const rsaRes = await getRsaKey();
            const aesKey = aesRes?.data?.data?.aesKey;
            const publicKey = rsaRes?.data?.data?.publicKey;
            if (!aesKey || !publicKey) {
                setErrorMsg("암호화 키 발급에 실패했습니다.");
                return;
            }

            // 2) 암호화
            const encAesKey = await rsaEncrypt(aesKey, publicKey);
            const encPassword = await aesEncrypt(password, aesKey);

            // 3) 부모에게 결과 전달 → 모달 닫기
            onConfirm?.({encPassword, encAesKey, rsaPublicKey: publicKey});
            onClose?.();
        } catch (e) {
            setErrorMsg(e?.response?.data?.message || e?.message || "암호화 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={backdrop} onClick={onClose}>
            <div style={modal} onClick={(e) => e.stopPropagation()}>
                <div style={{fontWeight: 700, fontSize: 18}}>비밀번호 확인</div>
                <div style={{color: "#6b7280", marginTop: 8, fontSize: 14}}>
                    결제를 진행하려면 회원 비밀번호를 입력해 주세요.
                </div>

                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={input}             // 작게
                    autoFocus
                    maxLength={25}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && password) {
                            handleConfirm();   // 엔터 → 결제요청과 동일하게 동작
                        }
                    }}
                />

                {errorMsg && <div style={{color: "#ef4444", fontSize: 12, marginTop: 6}}>{errorMsg}</div>}

                <div style={{display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12}}>
                    <button onClick={onClose} disabled={loading} style={btnGhost}>취소</button>
                    <button onClick={handleConfirm} disabled={loading || !password} style={btnPrimary}>
                        {loading ? "처리 중..." : "결제 요청"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const backdrop = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
};
const modal = {
    width: 360,
    background: "white",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
};
const input = {
    width: "80%",
    padding: "6px 10px",
    fontSize: 14,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    marginTop: 10,
    outline: "none",
    alignSelf: "center",
    display: "block"
};
const btnPrimary = {
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer"
};
const btnGhost = {
    background: "white",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer"
};

export default PaymentPasswordModal;
