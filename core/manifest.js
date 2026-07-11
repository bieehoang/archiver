import path from "node:path";
import fse from "fs-extra";

export class Manifest {

    constructor(outputDir) {

        this.outputDir = outputDir;
        this.pages = new Map();   // remoteUrl -> localPath
        this.assets = new Map();  // remoteUrl -> localPath
        this.errors = [];

    }

    addPage(remoteUrl, localPath) {

        this.pages.set(remoteUrl, localPath);

    }

    addAsset(remoteUrl, localPath) {

        this.assets.set(remoteUrl, localPath);

    }

    getLocalPath(remoteUrl) {

        return this.pages.get(remoteUrl) || this.assets.get(remoteUrl) || null;

    }

    has(remoteUrl) {

        return this.pages.has(remoteUrl) || this.assets.has(remoteUrl);

    }

    addError(remoteUrl, message) {

        this.errors.push({ url: remoteUrl, message });

    }

    toJSON() {

        return {
            generatedAt: new Date().toISOString(),
            pages: Object.fromEntries(this.pages),
            assets: Object.fromEntries(this.assets),
            errors: this.errors
        };

    }

    async save() {

        const filePath = path.join(this.outputDir, "manifest.json");

        await fse.ensureDir(this.outputDir);
        await fse.writeJson(filePath, this.toJSON(), { spaces: 2 });

        return filePath;

    }

}