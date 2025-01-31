import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config/configs.js';
import { userSession } from '../../session/session.js';
import { GlobalFailCode } from '../../utils/send-packet/payload/game.data.js';
import { selectUserData } from '../../database/user_db/functions.js';

/* 응답 메세지 유형 */
const messageType = {
  user: '유저 정보를 찾을 수 없슴다!',
  duplicate: '이미 접속된 계정임다!',
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
const verifyLoginInfo = async (user, id, password) => {
  // [1] 요청된 유저와 일치하는 정보가 없는 경우
  if (!user) return makeFailPayload('user');
  // [2] DB에서 유저 정보 가져오기 (쿼리 실행)
  let userData = null;
  try {
    userData = await selectUserData(id);
  } catch (err) {
    // [실패] 예외적인 오류 발생 시
    console.error('로그인 처리 중 문제 발생!!', err);
    return {
      success: false,
      message: `DB 문제 발생 : ${err.code}`,
      failCode: GlobalFailCode.UNKNOWN_ERROR,
    };
  }
  // [3] 이미 로그인된 계정인지 검증
  for (const account of userSession.users.values()) {
    if (account.id === userData.id) {
      return makeFailPayload('duplicate');
    }
  }
  // [4] 비밀번호 일치 여부 검증
  const isRightPassword = await bcrypt.compare(password, userData.password);
  if (!isRightPassword) return makeFailPayload('password');
  // [5] 모든 검증 통과 시 jwt 생성
  const token = jwt.sign({ userId: userData.id }, config.env.secretKey);
  // [6] 깡통 유저에 계정 정보 연동하기
  user.login(
    userData.user_key,
    userData.id,
    userData.win_count,
    userData.lose_count,
    userData.mmr,
    userData.high_score,
  );
  // [7] 성공 응답 페이로드 반환
  return { success: true, message: messageType.success, token, failCode: GlobalFailCode.NONE };
};

/* !!! 로그인 핸들러 !!! */
// 요청 페이로드 C2SLoginRequest {id,password}
// 응답 페이로드 S2CLoginResponse {success,message,token,failCode}
const loginHandler = async (socket, payload) => {
  // [1] 요청 페이로드에서 아이디랑 비번 추출
  const { id, password } = payload;
  // [2] 로그인 요청한 유저 찾기
  const user = userSession.getUser(socket);
  // // [3] DB 조회 후 정보 검증하고 응답 페이로드 준비
  const responsePayload = await verifyLoginInfo(user, id, password);
  // // [4] 패킷 버퍼로 변환해 클라이언트에 송신
  user.sendPacket(config.packetType.loginResponse, responsePayload);
};

export default loginHandler;
