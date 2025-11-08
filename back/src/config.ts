import { config } from "dotenv";
import * as path from "path";

[".env.production"].forEach((filename) => {
  config({
    path: path.resolve(process.cwd(), filename),
    quiet: true,
  });
});
