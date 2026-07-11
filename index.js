import { promptConfig } from "./core/cli.js";
import { Browser } from "./core/browser.js";

const config = await promptConfig();

const browser = new Browser(config);

await browser.launch();

console.log("Chromium launched.");

await browser.close();

console.log("Browser closed.");