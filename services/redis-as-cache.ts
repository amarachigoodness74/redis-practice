import logger from "../utils/logger";
import redisClient from "../utils/redis";

const generateRandomString = (length: number) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export async function getUsersUniqueNumber(username: string) {
  let results;
  let isCached = false;

  try {
    const cacheResult = await redisClient.get(username);
    if (cacheResult) {
      isCached = true;
      results = cacheResult;
    } else {
      results = generateRandomString(35);
      await redisClient.set(username, results);
    }

    return {
      fromCache: isCached,
      data: results,
    };
  } catch (error) {
    logger.error(error);
    return null
  }
}