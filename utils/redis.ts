import Redis from "ioredis";
import config from "./config";
import logger from "./logger";

const client = new Redis(config.redis.uri);

client
  .on("connect", function () {
    logger.info('Redis connected');
  })
  .on("error", function (error) {
    logger.error('Redis error', error);
  });

  export const disconnectRedisConnection = () => {
    client.disconnect();
  }

  export default client;