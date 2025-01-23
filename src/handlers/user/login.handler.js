import config from '../../config/configs.js';
import { userSession } from '../../session/session.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
// 요청 페이로드 C2SLoginRequest {id,password}
// 응답 페이로드 S2CLoginResponse {success,message,token,failCode}

const loginHandler = (socket, payload, sequence) => {
  // 페이로드에서 아이디랑 비번 추출
  const { id, password } = payload;
  // DB에서 유저정보 가져와서 비교 검증
  // 비번은 decrypt해서 비교
  console.log();
  // jwt 생성
  // 유저 인스턴스 생성
  // 유저 세션에 추가
  userSession.setUser(id, socket, winCount, loseCount, mmr);
  // 응답 페이로드 준비
  const responsePayload = {};
  // 패킷 만들어서 버퍼로 변환
  const S2CLoginResponse = makePacketBuffer(config.packetType.loginResponse, responsePayload);
  // 클라이언트에 응답 버퍼 보냄
  socket.write(S2CLoginResponse);
};

export default loginHandler;
