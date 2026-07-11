import { SKIP_SCHEMES } from "./constants.js";

/**
 * URL có nằm trong danh sách scheme cần bỏ qua không (data:, mailto:, javascript:...)
 */
export function isSkippableUrl(url) {

    if (!url)
        return true;

    const trimmed = url.trim().toLowerCase();

    return SKIP_SCHEMES.some(scheme => trimmed.startsWith(scheme));

}

/**
 * So sánh origin của url với baseUrl (cùng domain, cùng scheme, cùng port)
 */
export function isSameOrigin(url, baseUrl) {

    try {

        const a = new URL(url, baseUrl);
        const b = new URL(baseUrl);

        return a.origin === b.origin;

    } catch {

        return false;

    }

}

/**
 * Đoán xem URL có phải là 1 trang HTML (để crawl tiếp) hay không,
 * dựa trên đuôi file trong pathname.
 */
export function isHtmlPage(url) {

    try {

        const { pathname } = new URL(url);

        if (!pathname.includes("."))
            return true;

        const ext = pathname.split(".").pop().toLowerCase();

        return ext === "html" || ext === "htm";

    } catch {

        return false;

    }

}

/**
 * Quyết định 1 link có nên được thêm vào queue để crawl tiếp không.
 */
export function shouldCrawl(url, baseUrl) {

    if (isSkippableUrl(url))
        return false;

    if (!isSameOrigin(url, baseUrl))
        return false;

    return isHtmlPage(url);

}