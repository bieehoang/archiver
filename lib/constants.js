export const DEFAULT_OUTPUT_DIR = "output";

export const DEFAULT_TIMEOUT = 30000;

export const DEFAULT_MAX_PAGES = 0; // 0 = unlimited

export const DEFAULT_CONCURRENCY = 5;

export const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 UIArchiver/2.0";

// Thư mục lưu asset theo loại
export const ASSET_FOLDERS = {
    css: "assets/css",
    js: "assets/js",
    image: "assets/images",
    font: "assets/fonts",
    media: "assets/media",
    other: "assets/other"
};

// Map đuôi file -> loại asset
export const EXTENSION_MAP = {
    css: "css",
    js: "js",
    mjs: "js",
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
    svg: "image",
    webp: "image",
    ico: "image",
    avif: "image",
    bmp: "image",
    woff: "font",
    woff2: "font",
    ttf: "font",
    otf: "font",
    eot: "font",
    mp4: "media",
    webm: "media",
    mp3: "media",
    wav: "media",
    ogg: "media"
};

// Các scheme URL sẽ bị bỏ qua, không tải/không crawl
export const SKIP_SCHEMES = [
    "data:",
    "mailto:",
    "tel:",
    "javascript:",
    "blob:",
    "#"
];

// Các thẻ/attribute HTML chứa link tới asset cần rewrite
export const HTML_ASSET_ATTRS = [
    { tag: "img", attr: "src" },
    { tag: "img", attr: "srcset" },
    { tag: "source", attr: "src" },
    { tag: "source", attr: "srcset" },
    { tag: "script", attr: "src" },
    { tag: "link[rel=stylesheet]", attr: "href" },
    { tag: "link[rel=icon]", attr: "href" },
    { tag: "link[rel=shortcut icon]", attr: "href" },
    { tag: "video", attr: "src" },
    { tag: "video", attr: "poster" },
    { tag: "audio", attr: "src" },
    { tag: "a", attr: "href" }
];

// Resource type Playwright coi là asset cần bắt lại
export const TRACKED_RESOURCE_TYPES = [
    "stylesheet",
    "image",
    "font",
    "media",
    "script"
];