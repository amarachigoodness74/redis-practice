import express, { Request, Response } from "express";
import session from "express-session";
import redisSession from "./services/redis-session-store";
import logger from "./utils/logger";
import {
  saveUserDataInRedis,
  getUserDataFromRedis,
  checkIfKeyExistsInRedis,
} from "./services/redis-data-store";
import { disconnectRedisConnection } from "./utils/redis";
import { IUser } from "./types/user.type";

declare module "express-session" {
  interface SessionData {
    user: IUser;
  }
}

export const app = express();
const port = 3000;

app.use(session({ ...redisSession }));

app.get("/", (req: Request, res: Response) => {
  if (req.session.user) {
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

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

app.listen(port, () => {
  logger.info(`Application running on port ${port}`);
});
