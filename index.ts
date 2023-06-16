import express, { Request, Response } from "express";
import session from "express-session";
import redisSession from "./services/redis-session-store";
import { getUserDataInRedis } from "./services/redis-data-store";
import { disconnectRedisConnection } from "./utils/redis";
import logger from "./utils/logger";
import saveUserDataInRedis from "./services/redis-data-store";

declare module "express-session" {
  interface SessionData {
    username: string;
  }
}

export const app = express();
const port = 3000;

app.use(session({ ...redisSession }));

app.get("/", (req: Request, res: Response) => {
  if (req.session.username) {
    res.sendStatus(200);
  } else {
    res.redirect("/signin");
  }
});

app.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (username && email && password) {
    await saveUserDataInRedis(req.body);
    res.redirect("/signin");
  } else {
    res.sendStatus(400);
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email && password) {
    const userData = await getUserDataInRedis(req.body);
    if (!userData) {
      res.sendStatus(400);
    }
    res.redirect("/");
  } else {
    res.sendStatus(400);
  }
});

app.get("/signout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/signin");
    }
    disconnectRedisConnection();
    res.redirect("/signin");
  });
});

app.listen(port, () => {
  logger.info(`Application running on port ${port}`);
});
