import createPool from './createPool.js';
import config from '../config/configs.js';

/* 데이터베이스 별 커넥션 풀 매핑용 객체 */
const pools = {
  USER_DB: createPool(config.env),
};

export default pools;
