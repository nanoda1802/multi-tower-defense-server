import { loadProtos } from './load.proto.js';

const initServer = async () => {
  await loadProtos();
  // 디벨롭 예정
  // 테스트 쿼리 작동 로직 추가
};

export default initServer;
