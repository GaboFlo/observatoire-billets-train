import { config } from "dotenv";
import * as path from "node:path";

for (const filename of [".env.local", ".env.production", ".env"]) {
  config({
    path: path.resolve(process.cwd(), filename),
    quiet: true,
  });
}
