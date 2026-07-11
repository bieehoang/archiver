import path from "node:path";
import crypto from "node:crypto";
import fse from "fs-extra";
import { EXTENSION_MAP, ASSET_FOLDERS } from "../lib/constants.js";

/**
 * Chuẩn hoá URL: bỏ hash, bỏ dấu "/" thừa ở cuối, để tránh crawl trùng.
 */
export function normalizeUrl(url) {

    try {

        const u = new URL(url);
        u.hash = "";

        if (u.pathname !== "/" && u.pathname.endsWith("/"))
            u.pathname = u.pathname.slice(0, -1);

        return u.toString();

    } catch {

        return url;

    }

}

export function getExtension(url) {

    try {

        const { pathname } = new URL(url);
        const base = path.basename(pathname);

        return base.includes(".")
            ? base.split(".").pop().toLowerCase()
            : "";

    } catch {

        return "";

    }

}

export function getAssetType(url) {

    const ext = getExtension(url);

    return EXTENSION_MAP[ext] || "other";

}

export function getAssetFolder(url) {

    return ASSET_FOLDERS[getAssetType(url)] || ASSET_FOLDERS.other;

}

export function hashUrl(url) {

    return crypto.createHash("md5").update(url).digest("hex").slice(0, 10);

}

export function sanitizeFilename(name) {

    return name.replace(/[<>:"|?*\x00-\x1F]/g, "_");

}

/**
 * Đổi URL của 1 trang HTML thành đường dẫn file local, ví dụ:
 * https://site.com/about -> output/about/index.html
 * https://site.com/      -> output/index.html
 */
export function urlToLocalPath(url, outputDir) {

    const parsed = new URL(url);
    let pathname = decodeURIComponent(parsed.pathname);

    if (pathname === "" || pathname === "/")
        pathname = "/index.html";
    else if (pathname.endsWith("/"))
        pathname += "index.html";
    else if (!path.extname(pathname))
        pathname += "/index.html";

    const segments = pathname
        .split("/")
        .filter(Boolean)
        .map(sanitizeFilename);

    return path.join(outputDir, ...segments);

}

/**
 * Đổi URL của 1 asset (css/js/ảnh/font...) thành đường dẫn file local,
 * đặt trong thư mục assets/<type>/ với tên file gắn hash để tránh trùng.
 */
export function assetToLocalPath(url, outputDir) {

    const folder = getAssetFolder(url);
    const ext = getExtension(url) || "bin";

    const rawName = path.basename(new URL(url).pathname);
    const base = sanitizeFilename(rawName) || `file.${ext}`;

    const unique = `${hashUrl(url)}_${base}`;

    return path.join(outputDir, folder, unique);

}

export async function ensureDir(filePath) {

    await fse.ensureDir(path.dirname(filePath));

}

export function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

/**
 * Tính đường dẫn tương đối từ 1 file HTML tới 1 file asset, dùng để rewrite src/href.
 */
export function relativePath(fromFile, toFile) {

    let rel = path.relative(path.dirname(fromFile), toFile);

    if (!rel.startsWith("."))
        rel = `./${rel}`;

    return rel.split(path.sep).join("/");

}