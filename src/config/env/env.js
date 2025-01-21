import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  CLIENT_VERSION: process.env.CLIENT_VERSION,

  DB1_NAME: process.env.DB1_NAME,
  DB1_USER: process.env.DB1_USER,
  DB1_PASSWORD: process.env.DB1_PASSWORD,
  DB1_HOST: process.env.DB1_HOST,
  DB1_PORT: process.env.DB1_PORT,

  SECRET_KEY: process.env.SECRET_KEY,
};

export default env;
