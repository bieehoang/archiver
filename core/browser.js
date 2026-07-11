import { chromium } from "playwright";

export class Browser {

    constructor(config) {

        this.config = config;

        this.browser = null;

    }

    async launch() {

        this.browser = await chromium.launch({

            headless: this.config.headless,

            slowMo: this.config.headless ? 0 : 50

        });

        return this.browser;

    }

    async newPage() {

        if (!this.browser)
            throw new Error("Browser has not been launched.");

        return await this.browser.newPage({

            viewport: {

                width: 1920,

                height: 1080

            }

        });

    }

    async close() {

        if (this.browser)
            await this.browser.close();

    }

}