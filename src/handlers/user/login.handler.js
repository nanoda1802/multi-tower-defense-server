import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config/configs.js';
import { userSession } from '../../session/session.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import { GlobalFailCode } from '../../utils/send-packet/payload/game.data.js';
// 요청 페이로드 C2SLoginRequest {id,password}
// 응답 페이로드 S2CLoginResponse {success,message,token,failCode}

const messageType = {
  user: '유저 정보를 찾을 수 없슴다!',
  password: '비밀번호가 일치하지 않슴다!',
  none: '알 수 없는 이유로 로그인에 실패했슴다!',
  success: '로그인 성공임다!!',
};

const makeFailPayload = (type = 'none') => {
  // [1] 상황별 메세지 구분
  let message = messageType[type];
  // [2] 실패 응답 페이로드 반환
  return {
    success: false,
    message,
    token: 'none',
    failCode: GlobalFailCode.INVALID_REQUEST,
  };
};

const verifyLoginInfo = async (userData, socket, id, password) => {
  // db에 요청된 유저 정보가 없는 경우
  if (!userData) return makeFailPayload('user');
  // 비밀번호 일치 검증
  const isRightPassword = await bcrypt.compare(password, userData.password);
  if (!isRightPassword) return makeFailPayload('password');
  // jwt 생성
  const token = jwt.sign({ userId: id }, config.env.secretKey);
  // 깡통 유저에 정보 넣어줌
  const verifiedUser = userSession.getUser(socket);
  verifiedUser.login(
    userData.key,
    userData.id,
    userData.highScore, // 스키마에 하이스코어도 넣어야해........
    userData.winCount,
    userData.loseCount,
    userData.mmr,
  );
  // 로그인 성공 페이로드 반환
  return { success: true, message: messageType.success, token, failCode: GlobalFailCode.NONE };
};

const loginHandler = async (socket, payload) => {
  // 페이로드에서 아이디랑 비번 추출
  const { id, password } = payload;
  // DB에서 await select 쿼리로 유저 정보 가져옴
  const userData = {
    id: 'aaaa4321',
    password: 'aaaa4321',
    email: 'aaaa4321@gmail.com',
    created_at: 55452342,
  };
  // 응답 페이로드 준비
  const responsePayload = await verifyLoginInfo(userData, socket, id, password);
  // 패킷 만들어서 버퍼로 변환
  const S2CLoginResponse = makePacketBuffer(config.packetType.loginResponse, responsePayload);
  // 클라이언트에 응답 버퍼 보냄
  socket.write(S2CLoginResponse);
};

export default loginHandler;
