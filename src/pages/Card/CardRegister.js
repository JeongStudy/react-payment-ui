import React, { useRef, useState } from 'react';
import axios from 'axios';

const PG_INPUT_KEYS = [
  "version", "gopaymethod", "mid", "oid", "price", "timestamp",
  "signature", "verification", "mKey", "goodname", "buyername", "buyertel", "buyeremail",
  "returnUrl", "closeUrl", "acceptmethod", "offerPeriod", "use_chkfake", "currency"
];

const CardRegister = () => {
  const formRef = useRef(null);
  const [params, setParams] = useState({});

  // 가장 확실한 결제창 오픈 핸들러
  const handleCardRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. 파라미터를 백엔드에서 받아옴
      const res = await axios.post('http://localhost:8080/api/payment/cards/auth', {
        pgCompany: "INICIS",
        buyerName: "홍길동",
        buyerTel: "01012341234",
        buyerEmail: "test@email.com",
        goodName: "카드 등록"
      });
      setParams(res.data); // state 변경

      // 2. 렌더링 끝난 뒤에 결제창 오픈 (input value 보장)
      setTimeout(() => {
        if (!formRef.current) {
          alert('formRef가 없습니다!');
          return;
        }
        const mKeyVal = formRef.current.querySelector('[name="mKey"]').value;
        console.log('실제 mKey 값:', mKeyVal);
        if (!mKeyVal) {
          alert('mKey 값이 비어있습니다!');
          return;
        }
        window.INIStdPay.pay('order_form');
      }, 0);
    } catch (err) {
      alert('카드 등록 요청 에러! 콘솔 확인');
      console.error(err);
    }
  };

  return (
    <form
      id="order_form"
      name="order_form"
      method="POST"
      ref={formRef}
      action="#"
    >
      {/* 파라미터를 state → input value로 완전히 자동 연결 */}
      {PG_INPUT_KEYS.map((key) => (
        <input
          key={key}
          type="hidden"
          name={key}
          value={params[key] || ""}
          readOnly
        />
      ))}
      <button type="button" onClick={handleCardRegister}>
        카드 등록
      </button>
    </form>
  );
};

export default CardRegister;
