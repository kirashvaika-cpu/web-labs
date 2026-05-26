import { app } from "./app";
import { migrate } from "./db/migrate";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  await migrate();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
