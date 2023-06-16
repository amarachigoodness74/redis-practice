import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import redisSession from "./services/redis-session-store";
import { disconnectRedisConnection } from "./utils/redis";
import logger from "./utils/logger";

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

app.post("/signup", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username && password) {
    res.redirect("/signin");
  } else {
    res.sendStatus(400);
  }
});

app.post("/signin", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username && password) {
    req.session.username = username;
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
