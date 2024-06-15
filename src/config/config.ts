import { cleanEnv, str, port } from 'envalid';
import dotenv from 'dotenv';

// Load environment variables from .env file if it exists
dotenv.config();

const env = cleanEnv(process.env, {
  MONGO_URI: str({ desc: 'MongoDB connection string' }),
  PORT: port({ default: 4000 }),
  JWT_SECRET: str({ desc: 'Secret key for JWT token' }),
});

export default env;
