// components/Password/PasswordModal.js
import React, { useState } from "react";
import apiClient from "../../apis/Axios";
import { getAesKey } from "../../apis/crypto/AesKeyApis";
import { getRsaKey } from "../../apis/crypto/RsaKeyApis";
import { aesEncrypt, rsaEncrypt } from "../../utils/Cipher";

/**
 * props:
 *  - open: boolean
 *  - onClose: () => void
 *  - orderId: number
 *  - billingKey: string
 *  - onSuccess?: (paymentId: number | string) => void
 */
const PaymentPasswordModal = ({ open, onClose, orderId, billingKey, onSuccess }) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!open) return null;

    const requestPay = async () => {
        if (!password) {
            setErrorMsg("비밀번호를 입력해 주세요.");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            // 1) AES 키 발급
            const aesRes = await getAesKey();
            if (!aesRes || (aesRes.status !== 201 && aesRes.status !== 200)) {
                setErrorMsg(aesRes?.message || "AES 키 발급에 실패했습니다.");
                return;
            }
            const { aesKey } = aesRes.data?.data || {};
            if (!aesKey) {
                setErrorMsg("AES 키가 응답에 없습니다.");
                return;
            }

            // 2) RSA 키 발급
            const rsaRes = await getRsaKey();
            if (!rsaRes || (rsaRes.status !== 201 && rsaRes.status !== 200)) {
                setErrorMsg(rsaRes?.message || "RSA 키 발급에 실패했습니다.");
                return;
            }
            const { publicKey } = rsaRes.data?.data || {};
            if (!publicKey) {
                setErrorMsg("RSA 공개키가 응답에 없습니다.");
                return;
            }

            // 3) 클라이언트 암호화
            const encryptedAesKey = await rsaEncrypt(aesKey, publicKey);        // Base64
            const encryptedPassword = await aesEncrypt(password, aesKey);        // Base64(IV + Cipher)

            // 4) 결제 요청
            // 로그인과 동일하게 필드명을 맞춰 일관성 유지: password/encAesKey/rsaPublicKey
            const body = {
                orderId,
                billingKey,
                payMethod: "CARD",
                password: encryptedPassword,
                encAesKey: encryptedAesKey,
                rsaPublicKey: publicKey,
            };

            const payRes = await apiClient.post("/payment/requests", body);
            if (payRes?.status === 201 || payRes?.status === 200) {
                const paymentId = payRes.data?.data?.paymentId;
                onSuccess?.(paymentId);
                onClose();
            } else {
                setErrorMsg(payRes?.data?.message || "결제 요청이 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(
                err?.response?.data?.message || err?.message || "결제 요청 중 오류가 발생했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={backdrop}>
            <div style={modal}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>비밀번호 확인</div>
                <div style={{ color: "#6b7280", marginTop: 8, fontSize: 14 }}>
                    결제를 진행하려면 회원 비밀번호를 입력해 주세요.
                </div>

                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={input}
                />

                {errorMsg && (
                    <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{errorMsg}</div>
                )}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                    <button onClick={onClose} disabled={loading} style={btnGhost}>
                        취소
                    </button>
                    <button onClick={requestPay} disabled={loading || !password} style={btnPrimary}>
                        {loading ? "요청 중..." : "결제 요청"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const backdrop = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
};
const modal = {
    width: 420,
    background: "white",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};
const input = {
    width: "80%",
    marginTop: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
};
const btnPrimary = {
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
};
const btnGhost = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
};

export default PaymentPasswordModal;
