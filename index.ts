import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import redisSession from "./services/redis-session-store";
import { disconnectRedisConnection } from "./utils/redis";

declare module 'express-session' {
  interface SessionData {
    username: string;
  }
}

export const app = express();
const port = 3000;

app.use(session({ ...redisSession }));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  if (req.session.username) {
    next();
  } else {
    res.redirect("/signin");
  }
});

app.get("/signup", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username && password) {
    req.session.username = username;
    res.redirect("/signin");
  } else {
    res.redirect("/signup");
  }
});

app.get("/signin", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username && password) {
    req.session.username = username;
    res.redirect("/");
  } else {
    res.redirect("/signup");
  }
});

app.get("/signout", (req: Request, res: Response) => {
  req.session.destroy;
  disconnectRedisConnection();
  res.redirect("/signin");
});

app.listen(port, () => {
  console.log(`Application running on port ${port}`);
});
