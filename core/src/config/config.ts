import { cleanEnv, str, port } from 'envalid';
import dotenv from 'dotenv';

// Load environment variables from .env file if it exists
dotenv.config();

const env = cleanEnv(process.env, {
  MONGO_URI: str({ desc: 'MongoDB connection string',
    default: "mongodb://root:example@localhost:27017/phoenix?authSource=admin" }),
  PORT: port({ default: 4000 }),
  JWT_SECRET: str({ desc: 'Secret key for JWT token', default: 'your-secret'}),
  JTW_EXPIRY: str({ default: '1y' }),
  MODE: str({ choices: ['server', 'worker', 'dev'], default: 'dev' }),
  REDIS_HOST: str({ default: 'localhost' }),
  REDIS_PORT: port({ default: 6379 }),
  KAFKA_BROKER: str({ default: 'localhost:29092' }),
});

export default env;
