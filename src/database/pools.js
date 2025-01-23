import createPool from './createPool.js';
import config from '../config/configs.js';

const pools = {
  USER_DB: createPool(config.env),
};

export default pools;
