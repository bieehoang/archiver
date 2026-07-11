import {
    DEFAULT_OUTPUT_DIR,
    DEFAULT_TIMEOUT,
    DEFAULT_MAX_PAGES,
    DEFAULT_CONCURRENCY
} from "../lib/constants.js";

export const defaultConfig = {
    url: "",
    output: DEFAULT_OUTPUT_DIR,
    mode: "homepage",          // "homepage" | "website"
    headless: true,
    maxPages: DEFAULT_MAX_PAGES,
    timeout: DEFAULT_TIMEOUT,
    concurrency: DEFAULT_CONCURRENCY,
    downloadAssets: true,
    sameOriginOnly: true
};

/**
 * Gộp config lấy từ CLI (hoặc bất kỳ nguồn nào) với giá trị mặc định.
 */
export function resolveConfig(userConfig = {}) {

    return {
        ...defaultConfig,
        ...userConfig
    };

}