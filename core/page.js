import { logger } from "./logger.js";

export class PageController {

    constructor(page, config) {

        this.page = page;
        this.config = config;

    }

    async goto(url) {

        await this.page.goto(url, {
            waitUntil: "networkidle",
            timeout: this.config.timeout
        });

    }

    async getHtml() {

        return await this.page.content();

    }

    async extractLinks(baseUrl) {

        return await this.page.$$eval(
            "a[href]",
            (anchors, base) => anchors
                .map(a => a.getAttribute("href"))
                .filter(Boolean)
                .map(href => {
                    try {
                        return new URL(href, base).toString();
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean),
            baseUrl
        );

    }

    async close() {

        try {
            await this.page.close();
        } catch (err) {
            logger.debug(`Không đóng được page: ${err.message}`);
        }

    }

}