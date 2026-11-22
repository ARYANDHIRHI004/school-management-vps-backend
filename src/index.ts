import { createApp } from "./app.js";
import { env } from "./utils/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(
    `Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});