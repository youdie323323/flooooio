import {
    type AsyncObjectStack,
    type StackGuard,
    createAsyncObjectStack,
} from "./index.js";

import chalk from "chalk";

export class Logger {
    #stack: AsyncObjectStack;

    constructor() {
        this.#stack = createAsyncObjectStack();
    }

    /**
     * Runs the given function in a separate region.
     */
    region<R>(fn: () => R): R {
        return this.#stack.region(fn);
    }

    /**
     * Add metadata to the current execution.
     */
    metadata(metadata: object): StackGuard {
        return this.#stack.push(metadata);
    }

    /**
     * Format the metadata as key=value key2=value2.
     */
    private formatMetadata(metadata: Record<string, any>): string {
        return Object.entries(metadata)
            .map(([key, value]) => `${chalk.gray("@")}${key}=${value}`)
            .join(" ");
    }

    /**
     * Get the current timestamp in a formatted string.
     */
    private getTimestamp(): string {
        const now = new Date();
        return now.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    }

    /**
     * Emit a log message with a given level and color.
     */
    private emit(level: string, message: string, color: (text: string) => string): void {
        const metadata = this.formatMetadata(this.#stack.render());
        const timestamp = this.getTimestamp();
        const logLine = `${timestamp} ${color(level)} ${message} ${metadata}`;
        console.log(logLine);
    }

    /**
     * Emit a log message (INFO level).
     */
    info(message: string): void {
        this.emit(" INFO", message, chalk.blueBright);
    }

    /**
     * Emit a warning message (WARN level).
     */
    warn(message: string): void {
        this.emit(" WARN", message, chalk.yellow);
    }

    /**
     * Emit an error message (ERROR level).
     */
    error(message: string): void {
        this.emit("ERROR", message, chalk.red);
    }
}