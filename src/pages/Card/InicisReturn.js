import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const InicisReturn = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const resultCode = searchParams.get('resultCode');
  const authToken = searchParams.get('authToken');

  // 필요하면 여기서 백엔드에 별도의 처리 결과 요청/상태 조회(선택)
  // useEffect(() => {
  //   axios.get('/api/payment/status?authToken=' + authToken).then(...)
  // }, [authToken]);

  return (
    <div>
      결제 결과 처리 중입니다...
      <br />
      resultCode: {resultCode}
      <br />
      authToken: {authToken}
    </div>
  );
};

export default InicisReturn;
