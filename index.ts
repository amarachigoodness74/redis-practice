import express, { Request, Response } from "express";
import session from "express-session";
import requestIp from "request-ip";
import redisSession from "./services/redis-session-store";
import logger from "./utils/logger";
import {
  saveUserDataInRedis,
  getUserDataFromRedis,
  checkIfKeyExistsInRedis,
} from "./services/redis-data-store";
import { disconnectRedisConnection } from "./utils/redis";
import { IUser } from "./types/user.type";
import { getUsersUniqueNumber } from "./services/redis-as-cache";
import rateLimiter from "./services/redis-as-rate-limiter";
import redisClient from "./utils/redis";
import { sendEmail } from "./services/queue/jobs/send-email.job";

declare module "express-session" {
  interface SessionData {
    user: IUser;
  }
}

export const app = express();
const port = 3000;
const LIMIT_PER_SECOND = 3;
const DURATION = 60;

app.use(session({ ...redisSession }));

app.get("/", async (req: Request, res: Response) => {
  if (req.session.user) {
    // Perform expensive calculation and cache result
    const usersUniqueNumber = await getUsersUniqueNumber(
      req.session.user.username || "username"
    );
    return res.status(200).json(usersUniqueNumber);
  }
  return res.sendStatus(401);
});

// Redis as a Rate Limiter
app.get("/ping", async (req: Request, res: Response) => {
  const identifier = requestIp.getClientIp(req);
  const result = await rateLimiter(
    redisClient,
    identifier!,
    LIMIT_PER_SECOND,
    DURATION
  );
  res.setHeader("X-RateLimit-Limit", result.limit);
  res.setHeader("X-RateLimit-Remaining", result.remaining);

  if (!result.success) {
    return res
      .status(429)
      .json({
        error:
          "Too many requests in 1 minute. Please try again in a few minutes.",
      });
  }

  return res.status(200).json({ ping: "pong" });
});

// Redis as a Data Store
app.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (username && email && password) {
    const userExist: boolean = await checkIfKeyExistsInRedis(email);
    if (userExist) {
      return res.sendStatus(400);
    }
    await saveUserDataInRedis(req.body);
    return res.redirect("/signin");
  }
  return res.sendStatus(400);
});

// Redis as a Session Manager
app.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email && password) {
    const userData: IUser | null = await getUserDataFromRedis(req.body);
    if (!userData) {
      return res.sendStatus(400);
    } else {
      req.session.user = userData;
      return res.redirect("/");
    }
  }
  return res.sendStatus(400);
});

app.get("/signout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/signin");
    }
    disconnectRedisConnection();
    return res.redirect("/signin");
  });
});

app.get("/send-mail", async (req: Request, res: Response) => {
  await sendEmail("This is just a test message to learn redis");
  return res.send({ status: "ok" });
});

app.listen(port, () => {
  logger.info(`Application running on port ${port}`);
});
