const URL_REGEX = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
const IMPORT_REGEX = /@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/g;

/**
 * Lấy danh sách tất cả URL tham chiếu trong 1 đoạn CSS (url(...) và @import).
 */
export function extractCssUrls(cssText) {

    const urls = new Set();

    for (const match of cssText.matchAll(URL_REGEX)) {

        const value = match[2].trim();

        if (value && !value.startsWith("data:"))
            urls.add(value);

    }

    for (const match of cssText.matchAll(IMPORT_REGEX)) {

        const value = match[1].trim();

        if (value)
            urls.add(value);

    }

    return [...urls];

}

/**
 * Rewrite các URL trong CSS thành đường dẫn tương đối trỏ tới file local.
 * Asset chưa được tải (chưa có trong manifest) sẽ được tải bổ sung qua downloader.
 */
export async function rewriteCss(cssText, baseUrl, cssLocalPath, downloader, page) {

    const urls = extractCssUrls(cssText);
    let result = cssText;

    for (const raw of urls) {

        try {

            const absolute = new URL(raw, baseUrl).toString();

            let localPath = downloader.manifest.getLocalPath(absolute);

            if (!localPath)
                localPath = await downloader.fetchAndSave(absolute, page);

            if (!localPath)
                continue;

            const rel = downloader.relativeFromPage(cssLocalPath, absolute);

            result = result.split(raw).join(rel);

        } catch {

            // URL không hợp lệ bên trong CSS, bỏ qua.

        }

    }

    return result;

}