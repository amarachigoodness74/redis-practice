export default {
  env: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET|| 'keyboard cat',
  redis: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  }
}