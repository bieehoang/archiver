import fse from "fs-extra";
import { assetToLocalPath, ensureDir, relativePath } from "./ultils.js";
import { logger } from "./logger.js";

export class Downloader {

    constructor({ outputDir, manifest, config }) {

        this.outputDir = outputDir;
        this.manifest = manifest;
        this.config = config;

    }

    /**
     * Lưu buffer đã có sẵn (thường lấy từ NetworkRecorder) xuống đĩa.
     */
    async saveAsset(url, buffer) {

        if (this.manifest.has(url))
            return this.manifest.getLocalPath(url);

        const localPath = assetToLocalPath(url, this.outputDir);

        await ensureDir(localPath);
        await fse.writeFile(localPath, buffer);

        this.manifest.addAsset(url, localPath);

        return localPath;

    }

    /**
     * Chủ động tải 1 asset chưa từng gặp (ví dụ: url() bên trong CSS
     * mà browser không load vì không hiển thị/không dùng tới).
     */
    async fetchAndSave(url, page) {

        if (this.manifest.has(url))
            return this.manifest.getLocalPath(url);

        try {

            const response = await page.context().request.get(url, {
                timeout: this.config.timeout
            });

            if (!response.ok())
                throw new Error(`HTTP ${response.status()}`);

            const buffer = await response.body();

            return await this.saveAsset(url, buffer);

        } catch (err) {

            this.manifest.addError(url, err.message);
            logger.warn(`Không tải được asset: ${url} (${err.message})`);

            return null;

        }

    }

    /**
     * Trả về đường dẫn tương đối từ 1 file trang HTML tới asset đã tải.
     */
    relativeFromPage(pageLocalPath, assetUrl) {

        const assetLocalPath = this.manifest.getLocalPath(assetUrl);

        if (!assetLocalPath)
            return assetUrl;

        return relativePath(pageLocalPath, assetLocalPath);

    }

}