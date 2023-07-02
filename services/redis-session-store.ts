import session from 'express-session';
import RedisStore from "connect-redis";
import redisClient from "../utils/redis";
import config from "../utils/config";

let redisStore = new RedisStore({
  client: redisClient,
});

// Initialize sesssion storage.
const redisSession = {
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  secret: config.sessionSecret
};

export default redisSession;