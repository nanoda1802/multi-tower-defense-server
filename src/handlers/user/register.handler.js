import bcrypt from 'bcrypt';
import config from '../../config/configs.js';
import { GlobalFailCode } from '../../utils/send-packet/payload/game.data.js';
import { userSession } from '../../session/session.js';
import { insertUserData } from '../../database/user_db/functions.js';

/* 아이디, 비번, 이메일 정규식 */
const regex = {
  id: /^[a-z0-9]+$/, // 아이디는 빈칸이 아니고, 영소문자 또는 숫자로만
  pw: /^[a-z0-9]{4,}$/, // 비밀번호는 최소 네자리, 영소문자 또는 숫자로만
  email: /^[a-z0-9]+@[a-z]+\.[a-z]{2,}$/, // 이메일은 일반적인 이메일 형식
};

/* 응답 메세지 유형 */
const messageType = {
  id: '아이디는 영소문자와 숫자만 입력 가능함다!',
  password: '비밀번호는 영소문자와 숫자만 입력 가능하고, 최소 4자리임다!',
  email: '잘못된 이메일 형식임다!!',
  duplicate: `이미 사용 중인 아이디임다!`,
  success: '회원가입 성공임다!!',
};

/* 실패 응답 페이로드 제작 함수 */
const makeFailPayload = (type = 'none') => {
  // [1] 상황별 메세지 구분
  const message = messageType[type];
  // [2] 실패 응답 페이로드 반환
  return {
    success: false,
    message,
    failCode: GlobalFailCode.INVALID_REQUEST,
  };
};

/* 요청받은 정보 검증 후 처리하고 적절한 페이로드 준비하는 함수 */
const validateRegisterInfo = async (id, password, email) => {
  // [1] 아이디 유효성 검사
  const isValidateId = regex.id.test(id);
  if (!isValidateId) return makeFailPayload('id');
  // [2] 비밀번호 유효성 검사
  const isValidatePw = regex.pw.test(password);
  if (!isValidatePw) return makeFailPayload('password');
  // [3] 이메일 유효성 검사
  const isValidateEmail = regex.email.test(email);
  if (!isValidateEmail) return makeFailPayload('email');
  // [4] 모든 검사 통과 시 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 5);
  // [5] DB에 회원 정보 저장 (쿼리 실행)
  try {
    await insertUserData(id, hashedPassword, email);
  } catch (err) {
    // [5 -> 실패A] 중복 아이디 입력 시
    if (err.code === 'ER_DUP_ENTRY') return makeFailPayload('duplicate');
    // [5 -> 실패B] 예외적인 오류 발생 시
    console.error('회원가입 처리 중 문제 발생!!', err);
    return {
      success: false,
      message: `DB 문제 발생 : ${err.code}`,
      failCode: GlobalFailCode.UNKNOWN_ERROR,
    };
  }
  // [6] 전부 통과하면 성공 응답 페이로드 반환
  return { success: true, message: messageType.success, failCode: GlobalFailCode.NONE };
};

/* !!! 회원가입 핸들러 !!! */
// 요청 페이로드 C2SRegisterRequest {id,password,email}
// 응답 페이로드 S2CRegisterResponse {success,message,failCode}
const registerHandler = async (socket, payload) => {
  // [1] 요청 페이로드에서 가입 정보 추출
  const { id, password, email } = payload;
  // [2] 가입 정보 검증 후 응답 페이로드 준비
  const responsePayload = await validateRegisterInfo(id, password, email);
  // [3] 패킷 보낼 유저 찾기
  const user = userSession.getUser(socket);
  // [4] 패킷 버퍼로 변환해 클라이언트에 송신
  user.sendPacket(config.packetType.registerResponse, responsePayload);
};

export default registerHandler;
