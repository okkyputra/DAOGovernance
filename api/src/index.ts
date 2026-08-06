import "dotenv/config";
import { migrate } from "./db/migrate.js";
import { createApp } from "./app.js";

migrate();

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
