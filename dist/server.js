"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const migrate_1 = require("./db/migrate");
const PORT = Number(process.env.PORT) || 3000;
async function bootstrap() {
    await (0, migrate_1.migrate)();
    app_1.app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error("Fatal startup error:", err);
    process.exit(1);
});
