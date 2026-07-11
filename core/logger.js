import chalk from "chalk";

const timestamp = () => new Date().toLocaleTimeString();

export const logger = {

    info(msg) {
        console.log(chalk.blue(`[${timestamp()}] ℹ`), msg);
    },

    success(msg) {
        console.log(chalk.green(`[${timestamp()}] ✔`), msg);
    },

    warn(msg) {
        console.log(chalk.yellow(`[${timestamp()}] ⚠`), msg);
    },

    error(msg) {
        console.log(chalk.red(`[${timestamp()}] ✖`), msg);
    },

    debug(msg) {
        if (process.env.DEBUG)
            console.log(chalk.gray(`[${timestamp()}] •`), msg);
    }

};