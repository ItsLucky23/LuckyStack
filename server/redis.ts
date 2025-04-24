import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config(); 

//* here we create a Redis instance
const redis = new Redis({
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT as string),
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

export default redis;