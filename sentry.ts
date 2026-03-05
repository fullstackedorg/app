import * as Sentry from "@sentry/browser";
import packageJson from "./package.json";
import fs from "fs";

try {
    const dsn = await fs.promises.readFile("build:/dsn.txt", {
        encoding: "utf-8"
    });
    Sentry.init({
        dsn,
        release: packageJson.version
    });
} catch (e) {}
