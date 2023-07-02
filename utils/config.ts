export default {
  env: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET|| 'keyboard cat',
  redis: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
  }
}