#!/usr/bin/env node
import path from "node:path";
import fse from "fs-extra";
import { relativePath } from "../core/ultils.js";
import { logger } from "../core/logger.js";

/**
 * Công cụ sửa lỗi hậu kỳ: dùng manifest.json (nguồn chân lý cho việc
 * URL nào -> file local nào) để quét lại toàn bộ file HTML/CSS đã lưu
 * và thay các URL tuyệt đối còn sót thành đường dẫn tương đối.
 *
 * Dùng khi 1 vài trang bị "Rewrite HTML thất bại" (fallback lưu HTML gốc)
 * hoặc khi file .css external còn chứa url() trỏ tới ảnh/font gốc.
 *
 * Cách chạy:
 *   node tools/fix-paths.js <output-dir>
 *   node tools/fix-paths.js output
 */

async function loadManifest(outputDir) {

    const manifestPath = path.join(outputDir, "manifest.json");

    if (!(await fse.pathExists(manifestPath)))
        throw new Error(`Không tìm thấy manifest.json tại: ${manifestPath}`);

    return fse.readJson(manifestPath);

}

/**
 * Gộp pages + assets thành 1 map remoteUrl -> localPath,
 * sắp xếp theo độ dài URL giảm dần để tránh 1 URL ngắn
 * match nhầm vào bên trong 1 URL dài hơn (URL substring khác nhau).
 */
function buildUrlMap(manifest) {

    const map = new Map([
        ...Object.entries(manifest.pages || {}),
        ...Object.entries(manifest.assets || {})
    ]);

    const sortedUrls = [...map.keys()].sort((a, b) => b.length - a.length);

    return { map, sortedUrls };

}

/**
 * Thay toàn bộ URL tuyệt đối tìm thấy trong `content` bằng đường dẫn
 * tương đối từ `fromLocalPath`, dựa trên urlMap. Trả về { content, count }.
 */
function patchContent(content, fromLocalPath, urlMap, sortedUrls, selfUrl) {

    let result = content;
    let count = 0;

    for (const url of sortedUrls) {

        if (url === selfUrl)
            continue; // không tự trỏ vào chính file đang xử lý

        if (!result.includes(url))
            continue;

        const targetLocal = urlMap.get(url);
        const rel = relativePath(fromLocalPath, targetLocal);

        const occurrences = result.split(url).length - 1;
        result = result.split(url).join(rel);
        count += occurrences;

    }

    return { content: result, count };

}

async function fixHtmlPages(manifest, urlMap, sortedUrls) {

    let filesFixed = 0;
    let totalReplacements = 0;

    for (const [pageUrl, localPath] of Object.entries(manifest.pages || {})) {

        if (!(await fse.pathExists(localPath))) {
            logger.warn(`Bỏ qua (file không tồn tại): ${localPath}`);
            continue;
        }

        const original = await fse.readFile(localPath, "utf-8");
        const { content, count } = patchContent(original, localPath, urlMap, sortedUrls, pageUrl);

        if (count > 0) {
            await fse.writeFile(localPath, content);
            filesFixed++;
            totalReplacements += count;
            logger.success(`[HTML] Đã sửa ${count} link trong: ${localPath}`);
        }

    }

    return { filesFixed, totalReplacements };

}

async function fixCssAssets(manifest, urlMap, sortedUrls) {

    let filesFixed = 0;
    let totalReplacements = 0;

    for (const [assetUrl, localPath] of Object.entries(manifest.assets || {})) {

        if (!localPath.toLowerCase().endsWith(".css"))
            continue;

        if (!(await fse.pathExists(localPath))) {
            logger.warn(`Bỏ qua (file không tồn tại): ${localPath}`);
            continue;
        }

        const original = await fse.readFile(localPath, "utf-8");
        const { content, count } = patchContent(original, localPath, urlMap, sortedUrls, assetUrl);

        if (count > 0) {
            await fse.writeFile(localPath, content);
            filesFixed++;
            totalReplacements += count;
            logger.success(`[CSS]  Đã sửa ${count} link trong: ${localPath}`);
        }

    }

    return { filesFixed, totalReplacements };

}

async function main() {

    const outputDir = process.argv[2] || "output";

    logger.info(`Đang đọc manifest tại: ${path.join(outputDir, "manifest.json")}`);

    const manifest = await loadManifest(outputDir);
    const { map: urlMap, sortedUrls } = buildUrlMap(manifest);

    if (sortedUrls.length === 0) {
        logger.warn("Manifest rỗng, không có gì để sửa.");
        return;
    }

    logger.info(`Tìm thấy ${sortedUrls.length} URL trong manifest (pages + assets).`);

    const htmlResult = await fixHtmlPages(manifest, urlMap, sortedUrls);
    const cssResult = await fixCssAssets(manifest, urlMap, sortedUrls);

    console.log();
    logger.info(
        `Hoàn tất: ${htmlResult.filesFixed} file HTML (${htmlResult.totalReplacements} link) ` +
        `+ ${cssResult.filesFixed} file CSS (${cssResult.totalReplacements} link) đã được sửa.`
    );

}

main().catch(err => {

    logger.error(`Fix-paths thất bại: ${err.message}`);

    if (process.env.DEBUG)
        logger.debug(err.stack);

    process.exit(1);

});