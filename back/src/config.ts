import { config } from "dotenv";
import * as path from "path";

[".env.local"].forEach((filename) => {
  config({
    path: path.resolve(process.cwd(), filename),
    quiet: true,
  });
});
