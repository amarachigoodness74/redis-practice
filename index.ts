import express from "express";
import session from "express-session";
import redisSession from "./services/redis-session-store";

export const app = express();
const port = 3000;

app.use(session({ ...redisSession }));

app.listen(port, () => {
  console.log(`Application running on port ${port}`);
});
