import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config/configs.js';
import { userSession } from '../../session/session.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import { GlobalFailCode } from '../../utils/send-packet/payload/game.data.js';
import { selectUserData } from '../../database/user_db/functions.js';

/* 응답 메세지 유형 */
const messageType = {
  user: '유저 정보를 찾을 수 없슴다!',
  password: '비밀번호가 일치하지 않슴다!',
  none: '알 수 없는 이유로 로그인에 실패했슴다!',
  success: '로그인 성공임다!!',
};

/* 실패 응답 페이로드 제작 함수 */
const makeFailPayload = (type = 'none') => {
  // [1] 상황별 메세지 구분
  const message = messageType[type];
  // [2] 실패 응답 페이로드 반환
  return {
    success: false,
    message,
    token: 'empty',
    failCode: GlobalFailCode.INVALID_REQUEST,
  };
};

/* 요청받은 정보 검증 후 처리하고 적절한 페이로드 준비하는 함수 */
const verifyLoginInfo = async (socket, id, password) => {
  // [1] DB에서 유저 정보 가져오기
  let userData = null;
  try {
    userData = await selectUserData(id);
  } catch (err) {
    // [1 -> 실패] 오류 출력
    console.error('로그인 처리 중 문제 발생!!', err);
    return {
      success: false,
      message: `DB 문제 발생 : ${err.code}`,
      failCode: GlobalFailCode.UNKNOWN_ERROR,
    };
  }
  // [2] 요청된 유저 정보가 없는 경우
  if (!userData) return makeFailPayload('user');
  // [3] 비밀번호 일치 여부 검증
  const isRightPassword = await bcrypt.compare(password, userData.password);
  if (!isRightPassword) return makeFailPayload('password');
  // [4] 모든 검증 통과 시 jwt 생성
  const token = jwt.sign({ userId: id }, config.env.secretKey);
  // [5] 깡통 유저에 로그인 정보 넣어주기
  const verifiedUser = userSession.getUser(socket);
  verifiedUser.login(
    userData.key,
    userData.id,
    userData.high_score,
    userData.win_count,
    userData.lose_count,
    userData.mmr,
  );
  // [6] 성공 응답 페이로드 반환
  return { success: true, message: messageType.success, token, failCode: GlobalFailCode.NONE };
};

/* !!! 로그인 핸들러 !!! */
// 요청 페이로드 C2SLoginRequest {id,password}
// 응답 페이로드 S2CLoginResponse {success,message,token,failCode}
const loginHandler = async (socket, payload) => {
  // [1] 요청 페이로드에서 아이디랑 비번 추출
  const { id, password } = payload;
  // [2] DB 조회 후 정보 검증하고 응답 페이로드 및 시퀀스 준비
  const responsePayload = await verifyLoginInfo(socket, id, password);
  const sequence = userSession.getUser(socket).sequence;
  // [3] 패킷 만들고 버퍼로 변환
  const S2CLoginResponse = makePacketBuffer(
    config.packetType.loginResponse,
    sequence,
    responsePayload,
  );
  // [4] 만든 버퍼 클라이언트에 송신
  socket.write(S2CLoginResponse);
};

export default loginHandler;
