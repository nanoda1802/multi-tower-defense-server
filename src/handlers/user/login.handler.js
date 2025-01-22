// 요청 페이로드 C2SLoginRequest {id,password}
// 응답 페이로드 S2CLoginResponse {success,message,token,failCode}

const loginHandler = (socket, payload) => {
  // 페이로드에서 아이디랑 비번 추출
  // DB에서 유저정보 가져와서 비교 검증
  // 비번은 decrypt해서 비교
  // 유저 인스턴스 생성
  // 유저 세션에 추가
  // 응답 페이로드 준비
  // 패킷 만들어서 버퍼로 변환
  // 클라이언트에 응답 버퍼 보냄
};

export default loginHandler;
