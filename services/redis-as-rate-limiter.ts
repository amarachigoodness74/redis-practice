import Redis from "ioredis";

const rateLimiter = async (client: Redis, ip: string, limit: number, duration: number) => {
  const key = `rate_limit:${ip}`;
  let currentCount = await client.get(key);
  let count = parseInt(currentCount as string, 10) || 0;
  if (count >= limit) {
    return { limit, remaining: limit - count, success: false };
  }
  client.incr(key);
  client.expire(key, duration);
  return { limit, remaining: limit - (count + 1), success: true };
};

export default rateLimiter;