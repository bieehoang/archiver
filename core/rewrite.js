import * as cheerio from "cheerio";
import { HTML_ASSET_ATTRS } from "../lib/constants.js";
import { isSkippableUrl, isSameOrigin } from "../lib/filters.js";
import { urlToLocalPath, relativePath } from "./ultils.js";
import { rewriteCss } from "./css.js";

/**
 * Rewrite toàn bộ HTML của 1 trang: link asset (ảnh/css/js/font),
 * link nội bộ giữa các trang, style inline và thẻ <style>.
 */
export async function rewriteHtml({
    html,
    pageUrl,
    pageLocalPath,
    outputDir,
    downloader,
    manifest,
    page
}) {

    const $ = cheerio.load(html, { decodeEntities: false });

    for (const { tag, attr } of HTML_ASSET_ATTRS) {

        if (attr === "srcset")
            continue; // xử lý riêng bên dưới

        $(tag).each((_, el) => {

            const $el = $(el);
            const value = $el.attr(attr);

            if (!value || isSkippableUrl(value))
                return;

            let absolute;

            try {
                absolute = new URL(value, pageUrl).toString();
            } catch {
                return;
            }

            // Link nội bộ giữa các trang (thẻ <a>)
            if (tag === "a" && isSameOrigin(absolute, pageUrl)) {
                const targetLocal = urlToLocalPath(absolute, outputDir);
                $el.attr(attr, relativePath(pageLocalPath, targetLocal));
                return;
            }

            // Asset (ảnh/css/js/font...) đã có trong manifest
            const localPath = manifest.getLocalPath(absolute);

            if (localPath)
                $el.attr(attr, relativePath(pageLocalPath, localPath));

        });

    }

    // srcset: nhiều URL cách nhau bởi dấu phẩy, mỗi URL có thể kèm descriptor (1x, 2x, 480w...)
    $("[srcset]").each((_, el) => {

        const $el = $(el);
        const value = $el.attr("srcset");

        if (!value)
            return;

        const rewritten = value
            .split(",")
            .map(part => {

                const [url, descriptor] = part.trim().split(/\s+/);

                try {

                    const absolute = new URL(url, pageUrl).toString();
                    const localPath = manifest.getLocalPath(absolute);

                    if (!localPath)
                        return part.trim();

                    const rel = relativePath(pageLocalPath, localPath);

                    return descriptor ? `${rel} ${descriptor}` : rel;

                } catch {

                    return part.trim();

                }

            })
            .join(", ");

        $el.attr("srcset", rewritten);

    });

    // Thẻ <style>...</style>
    for (const el of $("style").toArray()) {

        const $el = $(el);
        const css = $el.html();

        if (css) {
            const rewritten = await rewriteCss(css, pageUrl, pageLocalPath, downloader, page);
            $el.html(rewritten);
        }

    }

    // Thuộc tính style="..." inline có chứa url()
    for (const el of $("[style]").toArray()) {

        const $el = $(el);
        const css = $el.attr("style");

        if (css && css.includes("url(")) {
            const rewritten = await rewriteCss(css, pageUrl, pageLocalPath, downloader, page);
            $el.attr("style", rewritten);
        }

    }

    return $.html();

}