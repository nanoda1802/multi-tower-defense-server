import bcrypt from 'bcrypt';
import config from '../../config/configs.js';
import makePacketBuffer from '../../utils/send-packet/makePacket.js';
import { GlobalFailCode } from '../../utils/send-packet/payload/game.data.js';
// 요청 페이로드 C2SRegisterRequest {id,password,email}
// 응답 페이로드 S2CRegisterResponse {success,message,failCode}

const regex = {
  id: /^[a-z0-9]+$/, // 아이디는 빈칸이 아니고, 영소문자 또는 숫자로만
  pw: /^[a-z0-9]{4,}$/, // 비밀번호는 최소 네자리, 영소문자 또는 숫자로만
  email: /^[a-z0-9]+@[a-z]+\.[a-z]{2,}$/, // 이메일은 일반적인 이메일 형식
};

const makeFailPayload = (input) => {
  // [1] 매개변수 없으면 고유성 제약 조건 검증 실패로 간주
  let message = input ? `유효한 ${input}이(가) 아님다!` : `이미 존재하는 아이디임다!!`;
  // [2] 실패 응답 페이로드 반환
  return {
    success: false,
    message,
    failCode: GlobalFailCode.INVALID_REQUEST,
  };
};

const validateRegisterInfo = async (id, password, email) => {
  // [1] 아이디 유효성 검사
  const isValidateId = regex.id.test(id);
  if (!isValidateId) return makeFailPayload('아이디');
  // [2] 비밀번호 유효성 검사
  const isValidatePw = regex.pw.test(password);
  if (!isValidatePw) return makeFailPayload('비밀번호');
  // [3] 이메일 유효성 검사
  const isValidateEmail = regex.email.test(email);
  if (!isValidateEmail) return makeFailPayload('이메일');
  // [4] 비밀번호 암호화
  const hashedPw = bcrypt.hash(password, 5);
  // [5] DB에 회원 정보 저장
  try {
    // await INSERT 쿼리로 DB에 정보 저장 (비번은 hashedPw로)
    // insert하면서 자연스레 id 고유성 검사 -> 걸리면 mysql에서 에러 객체 보내줌
  } catch (err) {
    // 아이디 고유성 제약조건에 걸렸을 시
    if (err.code === 'ER_DUP_ENTRY') return makeFailPayload();
    // 추가 에러 처리도 ㄱㄱ
  }
  // [6] 전부 통과하면 성공 응답 페이로드 반환
  return { success: true, message: `회원가입 성공이여유!`, failCode: GlobalFailCode.NONE };
};

const registerHandler = async (socket, payload) => {
  // [1] 페이로드에서 정보 추출
  const { id, password, email } = payload;
  // [2] 가입 정보 검증 후 응답 페이로드 준비
  const responsePayload = await validateRegisterInfo(id, password, email);
  // [3] 패킷 만들고 버퍼로 변환
  const S2CRegisterResponse = makePacketBuffer(config.packetType.registerResponse, 0, responsePayload);
  // [4] 만든 버퍼 클라이언트에 송신
  socket.write(S2CRegisterResponse);
};

export default registerHandler;
