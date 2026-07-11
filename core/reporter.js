import cliProgress from "cli-progress";
import chalk from "chalk";

export class Reporter {

    constructor() {

        this.bar = null;
        this.startedAt = null;

    }

    start(total) {

        this.startedAt = Date.now();

        this.bar = new cliProgress.SingleBar({
            format: `${chalk.cyan("Crawling")} |{bar}| {percentage}% | {value}/{total} pages | {url}`,
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
            hideCursor: true
        }, cliProgress.Presets.shades_classic);

        this.bar.start(total || 1, 0, { url: "" });

    }

    update(current, url) {

        if (!this.bar)
            return;

        const total = Math.max(this.bar.getTotal(), current);

        this.bar.setTotal(total);
        this.bar.update(current, { url: url ? url.slice(0, 60) : "" });

    }

    stop() {

        if (this.bar)
            this.bar.stop();

    }

    summary({ pages, assets, errors }) {

        const duration = ((Date.now() - this.startedAt) / 1000).toFixed(1);

        console.log();
        console.log(chalk.cyan("========================================"));
        console.log(chalk.green(`✔ Archive hoàn tất sau ${duration}s`));
        console.log(`  Số trang đã lưu : ${pages}`);
        console.log(`  Số asset đã tải : ${assets}`);

        if (errors > 0)
            console.log(chalk.yellow(`  Lỗi             : ${errors}`));

        console.log(chalk.cyan("========================================"));

    }

}