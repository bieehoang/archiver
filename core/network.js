import { getAssetType } from "./ultils.js";
import { TRACKED_RESOURCE_TYPES } from "../lib/constants.js";
import { logger } from "./logger.js";

/**
 * Lắng nghe các response của 1 Playwright page trong lúc điều hướng,
 * bắt nội dung của các asset (css/js/ảnh/font/media) để tải về.
 */
export class NetworkRecorder {

    constructor(page, { onAsset } = {}) {

        this.page = page;
        this.onAsset = onAsset;
        this.seen = new Set();

        this._handler = this._handleResponse.bind(this);

    }

    start() {

        this.page.on("response", this._handler);

    }

    stop() {

        this.page.off("response", this._handler);

    }

    async _handleResponse(response) {

        try {

            const url = response.url();

            if (this.seen.has(url))
                return;

            const request = response.request();
            const resourceType = request.resourceType();

            if (!TRACKED_RESOURCE_TYPES.includes(resourceType))
                return;

            if (!response.ok())
                return;

            this.seen.add(url);

            const buffer = await response.body();
            const contentType = response.headers()["content-type"] || "";

            if (this.onAsset)
                await this.onAsset({
                    url,
                    buffer,
                    contentType,
                    type: getAssetType(url)
                });

        } catch (err) {

            // Body có thể không lấy được (redirect, cache, opaque response...)
            logger.debug(`Bỏ qua response: ${err.message}`);

        }

    }

}