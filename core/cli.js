import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import chalk from "chalk";

export async function promptConfig() {

    const rl = readline.createInterface({
        input: stdin,
        output: stdout
    });

    console.clear();

    console.log(
        chalk.cyan(`
========================================
          UI Archiver v2.0
========================================
`)
    );

    // Website
    let url = "";

    while (!url) {

        url = (await rl.question(
            chalk.green("🌐 Website URL : ")
        )).trim();

        if (!url) {
            console.log(
                chalk.red("Website URL cannot be empty.\n")
            );
        }

    }

    // Output folder
    let output = (
        await rl.question(
            chalk.green("📁 Output folder [output]: ")
        )
    ).trim();

    if (!output)
        output = "output";

    console.log();

    console.log(chalk.yellow("📚 Crawl mode"));

    console.log("1. Homepage");

    console.log("2. Entire Website");

    let mode = (
        await rl.question("> ")
    ).trim();

    mode = mode === "2"
        ? "website"
        : "homepage";

    console.log();

    // Headless
    const headlessInput = (
        await rl.question(
            chalk.green("🤖 Headless? (Y/n): ")
        )
    ).trim().toLowerCase();

    const headless =
        headlessInput === "" ||
        headlessInput === "y";

    console.log();

    // Max Pages
    let maxPages = (
        await rl.question(
            chalk.green("📄 Maximum Pages [0 = Unlimited]: ")
        )
    ).trim();

    maxPages = Number(maxPages);

    if (Number.isNaN(maxPages))
        maxPages = 0;

    rl.close();

    return {
        url,
        output,
        mode,
        headless,
        maxPages
    };

}