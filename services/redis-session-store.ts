import RedisStore from "connect-redis";
import redisClient from "../utils/redis";
import config from "../utils/config";

let redisStore = new RedisStore({
  client: redisClient,
});

// Initialize sesssion storage.
const redisSession = {
  store: redisStore,
  resave: true,
  saveUninitialized: true,
  secret: config.sessionSecret
};

export default redisSession;