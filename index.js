import { promptConfig } from "./core/cli.js";
import { Browser } from "./core/browser.js";
import { Crawler } from "./core/crawler.js";
import { resolveConfig } from "./config/defaults.js";
import { logger } from "./core/logger.js";

const userConfig = await promptConfig();
const config = resolveConfig(userConfig);

const browser = new Browser(config);

await browser.launch();

logger.info("Chromium launched.");

const crawler = new Crawler(browser, config);

try {

    await crawler.run();

} catch (err) {

    logger.error(`Crawl thất bại: ${err.message}`);

} finally {

    await browser.close();

    logger.info("Browser closed.");

}