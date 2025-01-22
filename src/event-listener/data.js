import config from '../config/configs.js';
import { getProtoMessages } from '../init/load.proto.js';

export const onData = (socket) => async (data) => {
  // //   | **필드 명** | **타입** | **설명** |
  // // | --- | --- | --- |
  // // | packetType | ushort | 패킷 타입 (2바이트) |
  // // | versionLength | ubyte | 버전 길이 (1바이트) |
  // // | version | string | 버전 (문자열) |
  // // | sequence | uint32 | 패킷 번호 (4바이트) |
  // // | payloadLength | uint32 | 데이터 길이 (4바이트) |
  // // | payload | bytes | 실제 데이터 |

  try {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    const packetTypeByte = config.header.typeByte;
    const versionLengthByte = config.header.versionLengthByte;
    let versionByte = null;
    const sequenceByte = config.header.sequenceByte;
    const payloadLengthByte = config.header.payloadLengthByte;

    while (socket.buffer.length >= packetTypeByte + versionLengthByte) {
      versionByte = socket.buffer.readUInt8(packetTypeByte);
      while (
        socket.buffer.length >=
        packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte
      ) {
        let versionOffset = packetTypeByte + versionLengthByte;
        const version = socket.buffer.slice(versionOffset, versionOffset + versionByte).toString();
        const sequence = socket.buffer.readUInt32BE(packetTypeByte + versionLengthByte + versionByte);
        const payloadLength = socket.buffer.readUInt32BE(
          packetTypeByte + versionLengthByte + versionByte + sequenceByte,
        );
        const headerLength = packetTypeByte + versionLengthByte + versionByte + sequenceByte + payloadLengthByte;
        if(socket.buffer.length >= headerLength + payloadLength){
          const packetType = socket.buffer.readUInt16BE(0);
          const payloadBuffer = socket.buffer.slice(headerLength, headerLength + payloadLength);
          socket.buffer = socket.buffer.slice(headerLength + payloadLength);
  
          console.log('------------- 헤더 -------------')
          console.log('type:', packetType);
          console.log('versionLength:', versionByte);
          console.log('version:', version);
          console.log('sequence', sequence);
          console.log('payloadLength', payloadLength);
          console.log('-------------------------------')
  
          let proto = null;

          switch(packetType){
            case config.packetType.registerRequest: 
              proto = getProtoMessages().C2SRegisterRequest; 
              // 핸들러
              break;
            case config.packetType.loginRequest: 
              proto = getProtoMessages().C2SLoginRequest; 
              break;
            case config.packetType.matchRequest: 
              proto = getProtoMessages().C2SMatchRequest; 
              break;
            default : break;
          }
          const payload = proto.decode(payloadBuffer);
          console.log('페이로드:', payload);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const verifyClientVersion = (clientVersion) => {
  if (clientVersion !== version) {
    throw new Error('클라이언트 버전 검증 오류');
  }
};

const getNextSequence = () => {
  //
};

export default onData;
