import fse from "fs-extra";
import { Queue } from "./queue.js";
import { Manifest } from "./manifest.js";
import { Downloader } from "./downloader.js";
import { NetworkRecorder } from "./network.js";
import { PageController } from "./page.js";
import { rewriteHtml } from "./rewrite.js";
import { Reporter } from "./reporter.js";
import { logger } from "./logger.js";
import { shouldCrawl } from "../lib/filters.js";
import { normalizeUrl, urlToLocalPath, ensureDir } from "./ultils.js";

export class Crawler {

    constructor(browser, config) {

        this.browser = browser;
        this.config = config;

        this.queue = new Queue();
        this.manifest = new Manifest(config.output);

        this.downloader = new Downloader({
            outputDir: config.output,
            manifest: this.manifest,
            config
        });

        this.reporter = new Reporter();

    }

    async run() {

        const startUrl = normalizeUrl(this.config.url);
        this.queue.add(startUrl);

        await fse.ensureDir(this.config.output);

        this.reporter.start(
            this.config.mode === "homepage" ? 1 : (this.config.maxPages || 10)
        );

        let processed = 0;

        while (!this.queue.isEmpty()) {

            if (this.config.maxPages > 0 && processed >= this.config.maxPages)
                break;

            const url = this.queue.next();

            try {

                await this._processPage(url);

            } catch (err) {

                this.manifest.addError(url, err.message);
                logger.warn(`Lỗi khi xử lý trang: ${url} (${err.message})`);

                if (process.env.DEBUG)
                    logger.debug(err.stack);

            }

            processed++;
            this.reporter.update(processed, url);

            if (this.config.mode === "homepage")
                break;

        }

        this.reporter.stop();

        await this.manifest.save();

        this.reporter.summary({
            pages: this.manifest.pages.size,
            assets: this.manifest.assets.size,
            errors: this.manifest.errors.length
        });

        return this.manifest;

    }

    async _processPage(url) {

        const rawPage = await this.browser.newPage();
        const controller = new PageController(rawPage, this.config);

        const recorder = new NetworkRecorder(rawPage, {
            onAsset: async ({ url: assetUrl, buffer }) => {
                if (this.config.downloadAssets)
                    await this.downloader.saveAsset(assetUrl, buffer);
            }
        });

        recorder.start();

        try {

            await controller.goto(url);
            await recorder.waitForPending(); 
            const html = await controller.getHtml();
            const localPath = urlToLocalPath(url, this.config.output);

            this.manifest.addPage(url, localPath);

            if (this.config.mode === "website") {

                try {

                    const links = await controller.extractLinks(url);

                    for (const link of links)
                        if (shouldCrawl(link, this.config.url))
                            this.queue.add(link);

                } catch (err) {

                    logger.warn(`Không lấy được link từ ${url}: ${err.message}`);

                }

            }

            const rewritten = await this._safeRewrite({
                html,
                pageUrl: url,
                pageLocalPath: localPath,
                rawPage
            });

            await ensureDir(localPath);
            await fse.writeFile(localPath, rewritten);

            logger.success(`Đã lưu trang: ${url}`);

        } finally {
            await recorder.waitForPending();
            recorder.stop();
            await controller.close();

        }

    }

    /**
     * Rewrite HTML nhưng không để lỗi rewrite (css/asset lẻ tẻ) làm mất
     * luôn cả trang — nếu lỗi, fallback ghi HTML gốc (chưa rewrite link).
     */
    async _safeRewrite({ html, pageUrl, pageLocalPath, rawPage }) {

        try {

            return await rewriteHtml({
                html,
                pageUrl,
                pageLocalPath,
                outputDir: this.config.output,
                downloader: this.downloader,
                manifest: this.manifest,
                page: rawPage
            });

        } catch (err) {

            this.manifest.addError(pageUrl, `Rewrite thất bại: ${err.message}`);
            logger.warn(`Rewrite HTML thất bại (${pageUrl}), lưu HTML gốc: ${err.message}`);

            if (process.env.DEBUG)
                logger.debug(err.stack);

            return html;

        }

    }

}