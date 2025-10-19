import { config } from "dotenv";
import * as path from "path";

[".env"].forEach((filename) => {
  config({
    path: path.resolve(process.cwd(), filename),
    quiet: true,
  });
});
